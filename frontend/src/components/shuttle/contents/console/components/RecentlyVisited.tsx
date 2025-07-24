import { SpaceCards } from "./SpaceCards";
import { useRecentVisits } from "../../../../../hooks/useRecentVisits";

export const projects = [
  {
    spaceId: "Stripe",
    language:
      "Python",
  },
  {
    spaceId: "Xux",
    language:
      "Python",
  },
  
  
];

export function RecentlyVisited() {
  const { recentVisits, loading, error } = useRecentVisits();
  if(loading) return (<div>Loading...</div>)

    // console.log("Recent : ", recentVisits)
  // console.log("got it ",recentVisits)

  if (loading) return <p>Loading recent visits...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div className="mb-6">
      <h4 className="text-md font-sm text-gray-900 dark:text-gray-300">Recently visited</h4>
      <div className="">
        <SpaceCards projects={recentVisits}/>
      </div>
    </div>
  );
}