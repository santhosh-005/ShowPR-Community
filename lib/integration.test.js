import assert from "node:assert/strict";
import test from "node:test";
import { fetchPullRequests, fetchMonthlyPRStats } from "./github-api-utils.js";

// Mock environment variables for testing
process.env.SUPABASE_URL = "https://mockproject.supabase.co";
process.env.SUPABASE_ANON_KEY = "mock-anon-key";
process.env.AES_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const mockGithubGraphQLResponse = {
  data: {
    viewer: {
      login: "testuser",
      name: "Test User",
      bio: "Open source contributor",
      avatarUrl: "https://github.com/avatar.png",
      repositories: { totalCount: 10 },
      followers: { totalCount: 100 },
      pullRequests: {
        nodes: [
          {
            id: "pr_1",
            title: "feat: add feature",
            number: 42,
            url: "https://github.com/testuser/repo/pull/42",
            state: "MERGED",
            createdAt: "2026-06-15T12:00:00Z",
            repository: {
              name: "repo",
              url: "https://github.com/testuser/repo"
            }
          }
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: "cursor_1"
        }
      },
      pullRequestsOpen: { totalCount: 1 },
      pullRequestsClosed: { totalCount: 2 },
      pullRequestsMerged: { totalCount: 3 }
    }
  }
};

const mockStatsResponse = {
  data: {
    month0_open: { issueCount: 1 },
    month0_closed: { issueCount: 2 },
    month0_merged: { issueCount: 3 },
    month1_open: { issueCount: 0 },
    month1_closed: { issueCount: 0 },
    month1_merged: { issueCount: 5 },
    month2_open: { issueCount: 0 },
    month2_closed: { issueCount: 0 },
    month2_merged: { issueCount: 0 },
    month3_open: { issueCount: 0 },
    month3_closed: { issueCount: 0 },
    month3_merged: { issueCount: 0 },
    month4_open: { issueCount: 0 },
    month4_closed: { issueCount: 0 },
    month4_merged: { issueCount: 0 },
    month5_open: { issueCount: 0 },
    month5_closed: { issueCount: 0 },
    month5_merged: { issueCount: 0 }
  }
};

// Mock global fetch
const originalFetch = global.fetch;

test.before(() => {
  global.fetch = async (url, options) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    
    // Mock GitHub GraphQL API
    if (urlStr.includes("api.github.com/graphql")) {
      const body = JSON.parse(options.body);
      if (body.query.includes("viewer {")) {
        return {
          ok: true,
          headers: new Map([["x-ratelimit-remaining", "4999"]]),
          json: async () => mockGithubGraphQLResponse
        };
      } else {
        return {
          ok: true,
          headers: new Map([["x-ratelimit-remaining", "4999"]]),
          json: async () => mockStatsResponse
        };
      }
    }
    
    // Mock Supabase GET Profiles call
    if (urlStr.includes(".supabase.co/rest/v1/github_profiles")) {
      const mockProfile = {
        github_username: "testuser",
        encrypted_token: "gcm:v1:mock_encrypted_hex_data",
        iv: "mock_iv_hex",
        settings: {
          theme: "dark",
          layout: "grid",
          badgeStyle: "flat"
        }
      };
      
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => [mockProfile]
      };
    }
    
    return {
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" })
    };
  };
});

test.after(() => {
  global.fetch = originalFetch;
});

test("Integration: fetchPullRequests parses GraphQL data and returns correct schema", async () => {
  const result = await fetchPullRequests("mock-access-token");
  
  assert.equal(result.userInfo.login, "testuser");
  assert.equal(result.prs.length, 1);
  assert.equal(result.prs[0].title, "feat: add feature");
  assert.equal(result.counts.merged, 3);
});

test("Integration: fetchMonthlyPRStats aggregates and parses stats correctly", async () => {
  const result = await fetchMonthlyPRStats("mock-access-token");
  
  assert.ok(result.monthlyData.length > 0, "Should contain monthly metrics");
  const firstMonth = result.monthlyData.find(d => d.merged === 3);
  assert.ok(firstMonth, "Should find the month with 3 merged PRs");
});
