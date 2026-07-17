import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { fetchPullRequests, fetchMonthlyPRStats } from '@/lib/github-api-utils';
import { supabase } from '@/lib/supabaseClient';

// Define the type for the JWT token
interface Token {
  accessToken?: string;
  github?: {
    login: string;
    avatar_url: string;
    html_url: string;
    name?: string;
    email?: string;
    bio?: string;
    public_repos?: number;
  };
  [key: string]: any;
}

export async function GET(req: NextRequest) {  
  try {
    // Get parameters from URL
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || null;
    const limit = parseInt(searchParams.get('limit') || '30');
    
    // Get the token from the session JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as Token | null;
    
    // Check if token exists and has accessToken
    if (!token || !token.accessToken) {
      console.log('No valid token found in the session');
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }
    
    const accessToken = token.accessToken;
    const username = token.github?.login;
    const isFirstPage = !cursor && limit === 30;

    if (isFirstPage && username) {
      const { data: profile } = await supabase
        .from('github_profiles')
        .select('settings')
        .eq('github_username', username)
        .single();
      
      if (profile && profile.settings) {
        const cache = profile.settings._cache;
        const now = Date.now();
        if (cache && cache.expiresAt && now < cache.expiresAt && cache.rawCacheData) {
          return NextResponse.json(cache.rawCacheData);
        }
      }
    }
    
    // Fetch PR data and monthly stats in parallel
    const [prData, statsData] = await Promise.all([
      fetchPullRequests(accessToken, cursor, limit),
      fetchMonthlyPRStats(accessToken)
    ]);
    
    const combinedData = {
      ...prData,
      ...statsData
    };

    if (isFirstPage && username) {
      const { data: profile } = await supabase
        .from('github_profiles')
        .select('settings')
        .eq('github_username', username)
        .single();
      
      const currentSettings = profile?.settings || {};
      const updatedSettings = {
        ...currentSettings,
        _cache: {
          rawCacheData: combinedData,
          expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
        }
      };

      await supabase
        .from('github_profiles')
        .update({ settings: updatedSettings })
        .eq('github_username', username);
    }
    
    // Combine and return the data
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Error in GitHub data fetch:', error);
    // Type check error before accessing message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
