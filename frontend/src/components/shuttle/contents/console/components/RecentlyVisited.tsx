import { SpaceCards } from "./SpaceCards";

export const projects = [
  {
    title: "Stripe",
    description:
      "Python",
    link: "https://stripe.com",
  },
  {
    title: "Netflix",
    description:
      "Node.js",
    link: "https://netflix.com",
  },
  {
    title: "Google",
    description:
      "GoLang",
    link: "https://google.com",
  },
  {
    title: "Meta",
    description:
      "C++",
    link: "https://meta.com",
  },
  {
    title: "Amazon",
    description:
      "MERN",
    link: "https://amazon.com",
  },
  {
    title: "Microsoft",
    description:
      "Python",
    link: "https://microsoft.com",
  },
];

export function RecentlyVisited() {
  return (
    <div className="mb-6">
      <h4 className="text-md font-sm text-gray-900 dark:text-gray-300">Recently visited</h4>
      <div className="">
        <SpaceCards projects={projects}/>
      </div>
    </div>
  );
}