// app/embed/image/[username]/route.jsx
import { fetchPullRequests, fetchMonthlyPRStats } from '@/lib/github-api-utils';
import { supabase } from '@/lib/supabaseClient';
import { decrypt } from '@/lib/encryption';

export const runtime = 'edge';

// Helper to extract badge-specific stats from raw combined GitHub data
function extractBadgeStats(rawCacheData) {
  const totalPRs = rawCacheData.counts?.total || 0;
  const mergedPRs = rawCacheData.counts?.merged || 0;
  const mergeRate = totalPRs > 0 ? Math.round((mergedPRs / totalPRs) * 100) : 0;
  const activityData = (rawCacheData.monthlyData || []).map(month => ({
    month: month.name.split(' ')[0].substring(0, 3),
    count: month.total
  }));

  return {
    totalPRs,
    mergedPRs,
    mergeRate,
    prStatus: {
      total: totalPRs,
      open: rawCacheData.counts?.open || 0,
      merged: mergedPRs,
      closed: rawCacheData.counts?.closed || 0
    },
    activityData: activityData.slice(-6)
  };
}

// Updated function to get raw user data from GitHub API
async function getRawUserData(accessToken) {
  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const [prData, statsData] = await Promise.all([
    fetchPullRequests(accessToken),
    fetchMonthlyPRStats(accessToken)
  ]);

  return {
    ...prData,
    ...statsData
  };
}

// Function to generate line graph path
function generateLinePath(data, width, height, padding) {
  const availableWidth = width - (padding * 2);
  const availableHeight = height - (padding * 2);
  if (data.length <= 1) {
    return { path: "", points: [{ x: padding, y: padding }] };
  }
  const segmentWidth = availableWidth / (data.length - 1);
  
  // Find max value to scale properly
  const maxCount = Math.max(...data.map(d => d.count)) || 1;
  
  // Generate points
  let points = data.map((item, index) => {
    const x = padding + (index * segmentWidth);
    // Invert Y coordinate (SVG 0,0 is top-left)
    const y = padding + availableHeight - (item.count / maxCount * availableHeight);
    return { x, y };
  });
  
  // Generate SVG path
  let path = `M${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    // Use curve for smoother line
    const cpx1 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
    const cpy1 = points[i-1].y;
    const cpx2 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
    const cpy2 = points[i].y;
    
    path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${points[i].x},${points[i].y}`;
  }
  
  return { path, points };
}

// Function to generate error SVG
function generateErrorSVG(width, height, errorMessage) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Border Rectangle -->
      <rect x="2" y="2" width="${width-4}" height="${height-4}" rx="5" ry="5" fill="transparent" stroke="#CCCCCC" stroke-width="2" />
      
      <!-- Error Icon -->
      <circle cx="${width/2}" cy="${height/2 - 30}" r="30" fill="#F2994A" />
      <text x="${width/2}" y="${height/2 - 24}" font-size="40" font-weight="bold" text-anchor="middle" fill="white">!</text>
      
      <!-- Error Message -->
      <text x="${width/2}" y="${height/2 + 15}" font-size="18" font-weight="bold" text-anchor="middle" fill="#8370DB">Something went wrong</text>
      <text x="${width/2}" y="${height/2 + 40}" font-size="14" text-anchor="middle" fill="#8370DB">${errorMessage}</text>
      
      <!-- Powered by -->
      <text x="${width-10}" y="${height-10}" font-size="10" text-anchor="end" fill="#8370DB">Powered by ShowPR</text>
    </svg>
  `;
}

export async function GET(request, { params }) {
  const { username } = await params;
  const width = 500;
  const height = 200;
  
  try {
    // Extract token and settings from database
    const { data } = await supabase
      .from('github_profiles')
      .select('encrypted_token, iv, settings')
      .eq('github_username', username)
      .single()

    const settings = data.settings || {};
    const cache = settings._cache;
    const now = Date.now();

    let userData;

    if (cache && cache.expiresAt && now < cache.expiresAt && cache.rawCacheData) {
      userData = extractBadgeStats(cache.rawCacheData);
    } else {
      const accessToken = await decrypt(data.encrypted_token, data.iv);
      const rawCacheData = await getRawUserData(accessToken || null);
      
      userData = extractBadgeStats(rawCacheData);

      // Asynchronously update settings with the cached raw data
      const updatedSettings = {
        ...settings,
        _cache: {
          rawCacheData,
          expiresAt: now + 30 * 60 * 1000 // 30 minutes
        }
      };

      await supabase
        .from('github_profiles')
        .update({ settings: updatedSettings })
        .eq('github_username', username);
    }
    
    // Calculate section widths (divide evenly into 3 parts)
    const sectionWidth = width / 3;
    
    // Calculate PR status segments for the circle
    const totalStatusCount = userData.prStatus.total;
    const mergedPercent = (userData.prStatus.merged / totalStatusCount) * 100;
    const openPercent = (userData.prStatus.open / totalStatusCount) * 100;
    const closedPercent = (userData.prStatus.closed / totalStatusCount) * 100;
    
    // Circle dimensions (increased size)
    const radius = 50;
    const strokeWidth = 12;
    
    // Generate line graph data
    const graphWidth = sectionWidth - 10; // Less padding to utilize more space
    const graphHeight = 120;
    const graphPadding = 10;
    const { path: linePath, points } = generateLinePath(userData.activityData, graphWidth, graphHeight, graphPadding);
    const lastPoint = points[points.length - 1];
    
    // Calculate stroke-dasharray and stroke-dashoffset for circle segments
    const circumference = 2 * Math.PI * radius;
    
    // Calculate each segment's dash array
    const mergedDash = (mergedPercent / 100) * circumference;
    const openDash = (openPercent / 100) * circumference;
    const closedDash = (closedPercent / 100) * circumference;
    
    // Create the SVG content with animations
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <!-- Animations -->
          <style>
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes drawLine {
              from { stroke-dashoffset: 1000; }
              to { stroke-dashoffset: 0; }
            }
            
            @keyframes drawCircle {
              from { stroke-dashoffset: ${circumference}; }
              to { stroke-dashoffset: 0; }
            }
            
            @keyframes pulseCircle {
              0% { r: 2; }
              50% { r: 5; }
              100% { r: 4; }
            }
            
            .text-fade {
              animation: fadeIn 0.8s ease-in-out forwards;
              opacity: 0;
            }
            
            .text-fade-delayed-1 {
              animation: fadeIn 0.8s ease-in-out 0.3s forwards;
              opacity: 0;
            }
            
            .text-fade-delayed-2 {
              animation: fadeIn 0.8s ease-in-out 0.6s forwards;
              opacity: 0;
            }
            
            .line-draw {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: drawLine 1.5s ease-in-out 0.5s forwards;
            }
            
            .circle-draw {
              animation: drawCircle 1.2s ease-in-out forwards;
            }
            
            .pulse-circle {
              animation: pulseCircle 1s ease-in-out 1.8s forwards;
            }
            
            .legend-fade {
              animation: fadeIn 0.5s ease-in-out 1.5s forwards;
              opacity: 0;
            }
            
            .circle-fade {
              opacity: 0;
              animation: fadeIn 0.6s ease-in-out forwards;
            }

          </style>
        </defs>
        
        <!-- Border Rectangle -->
        <rect x="2" y="2" width="${width-4}" height="${height-4}" rx="5" ry="5" fill="transparent" stroke="#CCCCCC" stroke-width="2" />
        
        <!-- Left Column - Stats -->
        <g transform="translate(${sectionWidth/2}, ${height/2-35})">
          <!-- Total PRs -->
          <text x="0" y="0" font-size="34" font-weight="bold" text-anchor="middle" fill="#8370DB" class="text-fade">${userData.totalPRs}</text>
          <text x="0" y="24" font-size="13" text-anchor="middle" fill="#8370DB" class="text-fade-delayed-1">Total PR's count</text>
          
          <!-- Merged PRs -->
          <text x="0" y="60" font-size="34" font-weight="bold" text-anchor="middle" fill="#8370DB" class="text-fade-delayed-1">${userData.mergedPRs}</text>
          <text x="0" y="84" font-size="13" text-anchor="middle" fill="#8370DB" class="text-fade-delayed-2">Merged PR's count</text>
        </g>
        
        <!-- Middle Column - Donut Chart -->
        <g transform="translate(${sectionWidth + sectionWidth/2 - 12}, ${height/2-16})">
          <!-- Background circle -->
          <circle cx="0" cy="0" r="${radius}" fill="transparent" stroke="#CCCCCC" stroke-width="${strokeWidth+1}" />
          
          <!-- Merged segment (green) -->
          <circle cx="0" cy="0" r="${radius}" fill="transparent" stroke="#2ED398" stroke-width="${strokeWidth}" 
                  stroke-dasharray="${mergedDash} ${circumference-mergedDash}" stroke-dashoffset="0" transform="rotate(-90)"
                  class="circle-fade" style="animation-delay: 0.2s;" />

          <!-- Open segment (yellow) -->
          <circle cx="0" cy="0" r="${radius}" fill="transparent" stroke="#F2C94C" stroke-width="${strokeWidth}" 
                  stroke-dasharray="${openDash} ${circumference-openDash}" stroke-dashoffset="${-mergedDash}" transform="rotate(-90)"
                  class="circle-fade" style="animation-delay: 0.4s;" />

          <!-- Closed segment (red) -->
          <circle cx="0" cy="0" r="${radius}" fill="transparent" stroke="#F2994A" stroke-width="${strokeWidth}" 
                  stroke-dasharray="${closedDash} ${circumference-closedDash}" stroke-dashoffset="${-(mergedDash+openDash)}" transform="rotate(-90)"
                  class="circle-fade" style="animation-delay: 0.6s;" />

          
          <!-- Inner white circle -->
          <circle cx="0" cy="0" r="${radius-strokeWidth}" fill="white" />
          
          <!-- Center text -->
          <text x="0" y="-5" font-size="24" font-weight="bold" text-anchor="middle" fill="#8370DB" class="text-fade-delayed-2">${userData.mergeRate}%</text>
          <text x="0" y="15" font-size="12" text-anchor="middle" fill="#8370DB" class="text-fade-delayed-2">Merge Rate</text>

          
          <!-- Legend -->
          <g transform="translate(0, 75)" class="legend-fade">
            <!-- Open -->
            <rect x="-75" y="0" width="10" height="10" fill="#F2C94C" />
            <text x="-60" y="9" font-size="11" fill="#8370DB">Open</text>
            
            <!-- Merged -->
            <rect x="-25" y="0" width="10" height="10" fill="#2ED398" />
            <text x="-10" y="9" font-size="11" fill="#8370DB">Merged</text>
            
            <!-- Closed -->
            <rect x="30" y="0" width="10" height="10" fill="#F2994A" />
            <text x="45" y="9" font-size="11" fill="#8370DB">Closed</text>
          </g>
        </g>
        
        <!-- Right Column - Line Graph -->
        <g transform="translate(${2*sectionWidth }, ${height/2 - graphHeight/2 - 5})">
          <!-- Line graph -->
          <path d="${linePath}" stroke="#2ED398" stroke-width="2.5" fill="none" class="line-draw" />
          
          <!-- Circle at latest point -->
          <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="4" fill="#2ED398" class="pulse-circle" />
          
          <!-- X-axis -->
          <line x1="${graphPadding}" y1="${graphHeight-graphPadding}" x2="${graphWidth-graphPadding}" y2="${graphHeight-graphPadding}" stroke="#CCCCCC" stroke-width="1" />
          
          <!-- X-axis labels -->
          ${userData.activityData.map((item, i) => {
            const x = graphPadding + i * ((graphWidth - graphPadding * 2) / (userData.activityData.length - 1));
            const delay = 0.1 * i;
            return `<text x="${x}" y="${graphHeight}" font-size="9" text-anchor="middle" fill="#CCCCCC" style="animation-delay: ${delay}s" class="text-fade-delayed-1">${item.month}</text>`;
          }).join('')}
        </g>
        
        <!-- Powered by -->
        <text x="${width-10}" y="${height-10}" font-size="10" text-anchor="end" fill="#8370DB" class="text-fade-delayed-2">Powered by ShowPR</text>
      </svg>
    `;
    
    return new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'max-age=3600',
      },
    });
    
  } catch (error) {
    console.error('Error fetching PR data:', error);
    
    // Generate error SVG
    const errorMessage = error.message === 'Authentication required' 
      ? 'Please login to view your GitHub stats' 
      : 'Unable to fetch GitHub data';
    
    const errorSvgContent = generateErrorSVG(width, height, errorMessage);
    
    return new Response(errorSvgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store',
      },
    });
  }
}