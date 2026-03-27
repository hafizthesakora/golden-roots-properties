'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const POLL_INTERVAL = 12_000; // 12 seconds

export function useRealtimeUpdates(workspaceId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!workspaceId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['leads', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activity', workspaceId] });
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [workspaceId, queryClient]);
}
