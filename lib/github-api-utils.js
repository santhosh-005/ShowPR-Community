// github-api-utils.js

/**
 * Fetches pull requests for the authenticated GitHub user with pagination.
 * Uses the GitHub GraphQL API to retrieve PR list, user info, and status counts
 * in a single request.
 *
 * @param {string} accessToken - GitHub OAuth access token.
 * @param {string|null} [cursor=null] - Pagination cursor for fetching the next page of results.
 * @param {number} [limit=30] - Maximum number of pull requests to fetch per page.
 * @returns {Promise<Object>} Pull requests data with pagination info.
 * @property {Object} userInfo - GitHub user profile data (login, name, bio, avatarUrl, etc.).
 * @property {Array} prs - Array of pull request node objects.
 * @property {Object} pageInfo - Pagination metadata (hasNextPage, endCursor).
 * @property {Object} counts - PR status counts (open, closed, merged, total).
 * @throws {Error} If the API request fails or the GraphQL response contains errors.
 */
export async function fetchPullRequests(accessToken, cursor = null, limit = 30) {
  // console.log("fetchPullRequests called")
  if (!accessToken) {
    return { prs: [], pageInfo: {}, counts: { open: 0, closed: 0, merged: 0, total: 0 } };
  }
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query ($cursor: String, $limit: Int!) {
            viewer {
              login
              name
              bio
              avatarUrl
              repositories {
                totalCount
              }
              followers {
                totalCount
              }
              pullRequests(first: $limit, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                  id
                  title
                  number
                  url
                  state
                  createdAt
                  repository {
                    name
                    url
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                  startCursor
                }
              }
              pullRequestsOpen: pullRequests(states: OPEN) {
                totalCount
              }
              pullRequestsClosed: pullRequests(states: CLOSED) {
                totalCount
              }
              pullRequestsMerged: pullRequests(states: MERGED) {
                totalCount
              }
            }
          }
        `,
        variables: {
          cursor: cursor,
          limit: limit
        }
      })
    });
      if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${error}`);
    }
    const responseData = await response.json();
   
    if (responseData.errors) {
      throw new Error(`GitHub GraphQL error: ${responseData.errors[0].message}`);
    }
    const data = responseData.data.viewer;
    const prData = data.pullRequests;
   
    const rateLimit = {
      limit: response.headers.get('x-ratelimit-limit'),
      remaining: response.headers.get('x-ratelimit-remaining'),
      used: response.headers.get('x-ratelimit-used'),
      reset: response.headers.get('x-ratelimit-reset')
    };
    return {
      userInfo: {
        login: data.login,
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        publicRepos: data.repositories.totalCount || 0,
        followers: data.followers.totalCount || 0,
      },
      prs: prData.nodes || [],
      pageInfo: prData.pageInfo || { hasNextPage: false, endCursor: null },
      counts: {
        open: data.pullRequestsOpen.totalCount || 0,
        closed: data.pullRequestsClosed.totalCount || 0,
        merged: data.pullRequestsMerged.totalCount || 0,
        total: (data.pullRequestsOpen.totalCount || 0) +
               (data.pullRequestsClosed.totalCount || 0) +
               (data.pullRequestsMerged.totalCount || 0)
      }
    };
  } catch (err) {
    throw new Error(`Failed to fetch pull requests: ${err.message}`);
  }
}

/**
 * Generates an array of month range objects for the last N months.
 * Each range includes ISO start/end dates, month name, year, and index.
 *
 * @param {number} [monthCount=6] - Number of past months to generate ranges for.
 * @returns {Array<Object>} Array of month range objects.
 * @property {string} start - ISO date string for the first day of the month (YYYY-MM-DD).
 * @property {string} end - ISO date string for the last day of the month (YYYY-MM-DD).
 * @property {string} monthName - Short month name (e.g., "Jan", "Feb").
 * @property {number} year - The full year (e.g., 2026).
 * @property {number} monthIndex - Month number (1-12).
 */
function generateMonthRanges(monthCount = 6) {
  const monthRanges = [];
  const now = new Date();
  
  for (let i = 0; i < monthCount; i++) {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() - i;

    // Use UTC month boundaries so ISO date strings do not shift in non-UTC timezones.
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));
    
    monthRanges.push({
      start: monthStart.toISOString().split('T')[0],
      end: monthEnd.toISOString().split('T')[0],
      monthName: monthStart.toLocaleString('default', { month: 'short', timeZone: 'UTC' }),
      year: monthStart.getUTCFullYear(),
      monthIndex: monthStart.getUTCMonth() + 1
    });
  }
  
  return monthRanges;
}

/**
 * Fetches monthly PR statistics (open, closed, merged) for the last 6 months.
 * Uses a single batched GraphQL query with search queries per month to minimize API calls.
 *
 * @param {string} accessToken - GitHub OAuth access token.
 * @returns {Promise<Object>} Monthly PR statistics.
 * @property {Array} monthlyData - Array of monthly stat objects sorted chronologically.
 * @property {Object} rateLimit - GitHub API rate limit headers (limit, remaining, used, reset).
 * @throws {Error} If the API request fails or returns a non-OK status.
 */
export async function fetchMonthlyPRStats(accessToken) {
  // console.log("stat called");
  if (!accessToken) {
    return { monthlyData: [] };
  }

  try {
    // Get dates for last 6 months
    const monthRanges = generateMonthRanges(6);

    // Build a single query with all months to reduce API calls
    const query = `
      query {
        ${monthRanges.map((range, index) => `
          month${index}_open: search(query: "author:@me is:pr created:${range.start}..${range.end} is:open", type: ISSUE, first: 1) {
            issueCount
          }
          month${index}_closed: search(query: "author:@me is:pr created:${range.start}..${range.end} is:closed -is:merged", type: ISSUE, first: 1) {
            issueCount
          }
          month${index}_merged: search(query: "author:@me is:pr created:${range.start}..${range.end} is:merged", type: ISSUE, first: 1) {
            issueCount
          }
        `).join('')}
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    // Note: fetch does not throw for non-2xx responses, so we manually check
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Extract rate limit information from headers
    const rateLimit = {
      limit: response.headers.get('x-ratelimit-limit'),
      remaining: response.headers.get('x-ratelimit-remaining'),
      used: response.headers.get('x-ratelimit-used'),
      reset: response.headers.get('x-ratelimit-reset')
    };

    // console.log(rateLimit);

    const json = await response.json();
    const data = json.data;

    const monthlyData = [];

    monthRanges.forEach((range, index) => {
      const open = data[`month${index}_open`].issueCount;
      const closed = data[`month${index}_closed`].issueCount;
      const merged = data[`month${index}_merged`].issueCount;

      monthlyData.push({
        name: `${range.monthName} ${range.year}`,
        open,
        closed,
        merged,
        total: open + closed + merged,
        monthYear: `${range.year}-${String(range.monthIndex).padStart(2, '0')}`
      });
    });

    // Sort by date (oldest to newest)
    monthlyData.sort((a, b) => a.monthYear.localeCompare(b.monthYear));

    return {
      monthlyData,
      rateLimit
    };
  } catch (err) {
    throw new Error(`Failed to fetch monthly PR stats: ${err.message}`);
  }
}


/**
 * Fetches monthly PR statistics with client-side localStorage caching.
 * Returns cached data if available and less than cacheTimeMs old, otherwise
 * fetches fresh data from the API and updates the cache.
 *
 * @param {string} accessToken - GitHub OAuth access token.
 * @param {number} [cacheTimeMs=3600000] - Cache duration in milliseconds (default: 1 hour).
 * @returns {Promise<Object>} Monthly PR statistics (same shape as fetchMonthlyPRStats return value).
 * @throws {Error} If fetchMonthlyPRStats throws (propagated).
 */
export async function fetchMonthlyPRStatsWithCache(accessToken, cacheTimeMs = 3600000) {
  // console.log("stat called with cache")
  // Check localStorage for cached data
  const cachedData = localStorage.getItem('prMonthlyStats');
  const cacheTimestamp = localStorage.getItem('prMonthlyStatsTimestamp');
  
  // If we have cached data less than cacheTimeMs old, use it
  if (cachedData && cacheTimestamp) {
    const cacheAge = Date.now() - parseInt(cacheTimestamp);
    if (cacheAge < cacheTimeMs) {
      return JSON.parse(cachedData);
    }
  }
  
  // Otherwise fetch new data
  const data = await fetchMonthlyPRStats(accessToken);
  
  // Cache the new data
  if (data.monthlyData && data.monthlyData.length > 0) {
    localStorage.setItem('prMonthlyStats', JSON.stringify(data));
    localStorage.setItem('prMonthlyStatsTimestamp', Date.now().toString());
  }
  
  return data;
}
