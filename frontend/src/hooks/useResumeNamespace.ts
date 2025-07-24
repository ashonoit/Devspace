import { useState } from 'react';
import axios from 'axios';


interface ResumeResult {
  resume: (spaceId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to handle namespace (pod) resume
 * Handles loading state, error, and navigation
 */
export function useResumeNamespace(): ResumeResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resume = async ( spaceId: string) => {
    setLoading(true);
    setError(null);

    // Reserve the new tab immediately
    const newTab = window.open('', '_blank');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/api/namespace/resume`,
        { spaceId },
        { withCredentials: true }
      );

      console.log(response.data)
      const { podId, success, message } = response.data;

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

  return { resume, loading, error };
}
