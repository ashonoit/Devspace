import { useState, useEffect } from "react";
import axios from "axios";

export const usePodToken = (spaceId: string, podId: string) : ({podToken: string|null, loading: boolean, error: string|null}) => {
  const [podToken, setPodToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const key = `podToken:${spaceId}`;
    const cachedToken = sessionStorage.getItem(key);

    if (cachedToken) {
      setPodToken(cachedToken);
      setLoading(false);
      return;
    }


    const fetchToken = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URI}/api/pod/getPodToken`,
          { spaceId, podId },
          { withCredentials: true }
        );

        const data = response.data;
        if (data.success) {
          setPodToken(data.podToken);
          sessionStorage.setItem(key, data.podToken);

        } else {
          setError(data.message || "Unknown error");
        }
      } catch (err) {
        setError("Failed to fetch pod token");
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [spaceId, podId]);

  return { podToken, loading, error };
};
