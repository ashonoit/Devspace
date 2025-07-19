// src/hooks/useLaunchNamespace.ts
import { useState } from 'react';
import axios from 'axios';

interface LaunchParams {
  title: string;
  description: string;
  stack: string;
}

interface LaunchResult {
  launch: (params: LaunchParams) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to handle namespace (pod) launching
 * Handles loading state, error, and navigation
 */
export function useLaunchNamespace(): LaunchResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Launches a new namespace by sending a request to backend.
   * On success, opens a new tab with the namespace URL.
   * @param {LaunchParams} params - title, description, stack
   */
  const launch = async ({ title, description, stack }: LaunchParams) => {
    setLoading(true);
    setError(null);

     // Reserve the new tab immediately
    const newTab = window.open('', '_blank');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/api/namespace/launch`,
        { title, description, stack },
        { withCredentials: true }
      );

      console.log(response.data)
      const { spaceId, podId, success, message } = response.data;

      if(success===false){
        console.log(message);
        return;
      }

      if ((!spaceId || typeof spaceId !== 'string') || (!podId || typeof podId!=='string')) {
        throw new Error('Invalid response from server: Missing spaceId');
      }

      if (newTab) {
        newTab.location.href = `/namespace/${spaceId}/${podId}`;
      }
      
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Something went wrong while launching the workspace';
      setError(message);
      alert(message); // For now, alert the user — can be replaced with toast later
    } finally {
      setLoading(false);
    }
  };

  return { launch, loading, error };
}
