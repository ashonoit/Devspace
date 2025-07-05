import { RocketIcon } from "lucide-react";

export function CreateNamespace() {
  return (
    <div className="w-full rounded-2xl bg-transparent p-1 space-y-3">
      <h4 className="text-md font-sm text-gray-900 dark:text-gray-300">Launch Namespace</h4>

      {/* Description */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-3">

          <textarea
            placeholder="Write a description about your namespace..."
            className="w-full scrollbar-hide resize-none rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-200 p-3 focus:outline-none "
            rows={3}
          />

          {/* Inputs and Button */}
          <div className="flex flex-row gap-2 justify-between">
            
            <div className="flex flex-row gap-2">
                <input
                  placeholder="UniqueTitle..."
                  className="flex-1 min-w-[140px] rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 border border-zinc-300 dark:border-zinc-700"
                  />
                <select className="min-w-[100px] rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 dark:focus:bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
                  <option>Choose stack</option>
                  <option>NodeJS</option>
                  <option>C++</option>
                </select>
            </div>

            {/* <button className="flex items-center gap-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-4 py-2 font-medium text-sm transition duration-150 ease-in-out">
              <RocketIcon className="w-4 h-4" />
              Launch
            </button> */}
            <button className="relative cursor-pointer inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 p-[1px] transition-all duration-300 hover:scale-105 focus:outline-none">
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
                Launch
                <RocketIcon className="ml-2 w-4 h-4" />
              </span>
            </button>

          </div>
        </div>
    </div>
  );
}
