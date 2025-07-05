import { CreateNamespace } from "./components/CreateNamespace";
import { RecentlyVisited } from "./components/RecentlyVisited";
import { OwnedNamespaces } from "./components/OwnedNamespaces";

export default function Console() {
  return (
    <div className="flex-1 z-20 overflow-y-auto scrollbar-hide p-4">
      <div className="max-w-3xl mx-auto px-6 mt-5 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-200">Console</h2>
          <div className="flex flex-col gap-16">
              <CreateNamespace />
              <RecentlyVisited />
              <OwnedNamespaces />
          </div>
          
      </div>
    </div>
  );
}