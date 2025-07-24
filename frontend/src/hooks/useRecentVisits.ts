import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "../redux/reduxTypeSafety";

export interface RecentVisit {
  spaceId: string;
  language: string;
  lastVisit: string; // or Date
}

export const useRecentVisits = () => {
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAppSelector(state=>state.auth.user)

  useEffect(() => {
    if(!user) return;

    const fetchRecentVisits = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URI}/api/namespace/recents`, {withCredentials:true});

        if (!response.data.success) {
          throw new Error("Failed to fetch recent visits");
        }
        const data = await response.data;
        // console.log("Got recent visits", data)
        setRecentVisits(data.recentVisits);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentVisits();
  }, []);

  return { recentVisits, loading, error };
};