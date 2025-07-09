// Topbar.tsx
import React from "react";
import { cn } from "../../../lib/utils"; // if using className combiner
import { RocketIcon, PanelRightCloseIcon, PanelRightOpen } from "lucide-react"; // replace with logo/icon
import { useToggleContext } from "../context/toggleContext";

interface TopbarProps {
  spaceId: string;
}

export function Topbar({ spaceId }: TopbarProps) {

    const {isRightBarOpen, toggleRightBar} = useToggleContext();

  return (
    <div className="w-full h-12 px-4 flex items-center bg-zinc-100 dark:bg-zinc-800 shadow-sm">
      {/* Logo + Name */}
      <div className="flex items-center gap-2">
        <RocketIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Namespace
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          / {spaceId}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      <div className=" flex flex-row items-end">
            <button onClick={toggleRightBar} className=" cursor-pointer hover:bg-zinc-900/50 hover:rounded-md p-1">
                {isRightBarOpen? 
                  <PanelRightCloseIcon className="size-5 text-zinc-600 dark:text-zinc-400"/>
                  :
                  <PanelRightOpen className="size-5 text-zinc-600 dark:text-zinc-400"/>
                }
            </button>
      </div>
      
      {/* (You can add buttons, user profile, etc. here later) */}
    </div>
  );
}
