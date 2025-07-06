import React from "react";
import { cn } from "../../../../../lib/utils";
import { BUTTON_BG_COLOR } from "../../../../../lib/constants";
import {Ellipsis } from "lucide-react"

export function OwnedNamespaceCard() {
  return (
    <div className="w-full bg-zinc-900/70 border border-white/10 rounded-2xl px-5 py-3 mb-4 flex justify-between transition-all hover:shadow-lg hover:border-white/20 duration-200">
      {/* Left Content */}
      <div className="flex flex-col justify-center">

        <div className="flex items-center gap-2">
          <h1 className="text-zinc-800 dark:text-zinc-200 text-lg font-semibold">Title</h1>
          <span className="h-4 w-px bg-white/30" />
          <span className="text-sm text-zinc-800 dark:text-zinc-500 text-muted-foreground">StackName</span>
        </div>

        <p className="text-sm text-zinc-300 mt-1">The description you wrote</p>

        <div className="text-xs text-zinc-500 mt-3 leading-relaxed">
          Created: 3 days ago <br />
          Last updated: 24hr ago
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex flex-col items-end justify-between">

        {/* Three Dot Icon */}
        <div className="text-zinc-400 text-xl cursor-pointer hover:text-white transition-colors duration-150">
          <Ellipsis />
        </div>

        {/* Resume Button */}
        
        <button className="relative cursor-pointer inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-zinc-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-zinc-600 hover:to-zinc-700 hover:text-white  dark:bg-zinc-300   focus:outline-none">
          Resume
        </button>
      


      </div>
    </div>
  );
}
