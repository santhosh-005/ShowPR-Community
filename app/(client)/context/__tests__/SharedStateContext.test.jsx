import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { SharedStateProvider, useSharedState } from '../SharedStateContext';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('axios');

// Test consumer component to expose context state and actions
function TestConsumer() {
  const {
    dashboardPageData,
    profilePageData,
    loading,
    error,
    fetchPRData,
    handleSaveNewUser,
  } = useSharedState();

  return (
    <div>
      <div data-testid="loading-status">{loading ? 'Loading' : 'Idle'}</div>
      <div data-testid="error-status">{error || 'No Error'}</div>
      <div data-testid="prs-count">{dashboardPageData.pullRequests.length}</div>
      <div data-testid="dashboard-fetched">
        {dashboardPageData.dataFetched ? 'Fetched' : 'Not Fetched'}
      </div>
      <div data-testid="profile-fetched">
        {profilePageData.dataFetched ? 'Fetched' : 'Not Fetched'}
      </div>
      <div data-testid="custom-title">{profilePageData.customTitle}</div>
      <button data-testid="fetch-pr-btn" onClick={fetchPRData}>
        Fetch PRs
      </button>
      <button data-testid="save-user-btn" onClick={handleSaveNewUser}>
        Save User
      </button>
    </div>
  );
}

describe('SharedStateContext Integration & Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default safe mocks for automatic useEffect calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { settings: {} } }),
    });

    vi.mocked(axios.get).mockResolvedValue({
      data: {
        prs: [],
        counts: { total: 0, open: 0, merged: 0, closed: 0 },
        pageInfo: { hasNextPage: false, endCursor: null },
        monthlyData: [],
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Scenario 1: Initial State when user is unauthenticated
  it('should initialize with default unauthenticated state', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <SharedStateProvider>
        <TestConsumer />
      </SharedStateProvider>
    );

    expect(screen.getByTestId('loading-status').textContent).toBe('Idle');
    expect(screen.getByTestId('error-status').textContent).toBe('No Error');
    expect(screen.getByTestId('prs-count').textContent).toBe('0');
    expect(screen.getByTestId('dashboard-fetched').textContent).toBe('Not Fetched');
    expect(screen.getByTestId('profile-fetched').textContent).toBe('Not Fetched');
    expect(screen.getByTestId('custom-title').textContent).toBe('My GitHub Contributions');
  });

  // Scenario 2: Sign-in Behavior - triggers automatic PR & Profile data fetching
  it('should automatically fetch PR and Profile data on authenticated session', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        github: {
          login: 'octocat',
          email: 'octocat@github.com',
        },
      },
      status: 'authenticated',
    });

    // Mock profile fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          settings: {
            customTitle: 'Octocat Custom Showcase',
          },
        },
      }),
    });

    // Mock axios PR data response
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        prs: [
          {
            id: 'pr-1',
            title: 'Fix issue',
            number: 101,
            url: 'https://github.com/org/repo/pull/101',
            state: 'MERGED',
            createdAt: '2026-07-01T00:00:00Z',
            repository: { name: 'repo-one', url: 'https://github.com/org/repo-one' },
          },
        ],
        counts: { total: 1, open: 0, merged: 1, closed: 0 },
        pageInfo: { hasNextPage: false, endCursor: null },
        monthlyData: [],
      },
    });

    render(
      <SharedStateProvider>
        <TestConsumer />
      </SharedStateProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-fetched').textContent).toBe('Fetched');
    });

    expect(screen.getByTestId('prs-count').textContent).toBe('1');
    expect(screen.getByTestId('profile-fetched').textContent).toBe('Fetched');
    expect(screen.getByTestId('custom-title').textContent).toBe('Octocat Custom Showcase');
  });

  // Scenario 3: Save Preferences - calls /api/github-profile POST endpoint
  it('should send POST request and save preferences when handleSaveNewUser is invoked', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        github: {
          login: 'octocat',
          email: 'octocat@github.com',
        },
      },
      status: 'authenticated',
    });

    render(
      <SharedStateProvider>
        <TestConsumer />
      </SharedStateProvider>
    );

    const saveBtn = screen.getByTestId('save-user-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/github-profile',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"githubUsername":"octocat"'),
        })
      );
    });
  });

  // Scenario 4: Sync Actions - Manual trigger of fetchPRData updates context state
  it('should update state with newly fetched PRs when fetchPRData is manually triggered', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        prs: [
          {
            id: 'pr-100',
            title: 'Add tests',
            number: 200,
            url: 'https://github.com/org/repo/pull/200',
            state: 'OPEN',
            createdAt: '2026-07-20T00:00:00Z',
            repository: { name: 'ShowPR-Community', url: 'https://github.com/org/ShowPR-Community' },
          },
          {
            id: 'pr-101',
            title: 'Update README',
            number: 201,
            url: 'https://github.com/org/repo/pull/201',
            state: 'MERGED',
            createdAt: '2026-07-21T00:00:00Z',
            repository: { name: 'ShowPR-Community', url: 'https://github.com/org/ShowPR-Community' },
          },
        ],
        counts: { total: 2, open: 1, merged: 1, closed: 0 },
        pageInfo: { hasNextPage: false, endCursor: null },
        monthlyData: [],
      },
    });

    render(
      <SharedStateProvider>
        <TestConsumer />
      </SharedStateProvider>
    );

    expect(screen.getByTestId('prs-count').textContent).toBe('0');

    const fetchBtn = screen.getByTestId('fetch-pr-btn');
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-fetched').textContent).toBe('Fetched');
    });

    expect(screen.getByTestId('prs-count').textContent).toBe('2');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/github/user-data'),
      expect.any(Object)
    );
  });
});
