// Topbar.tsx
import React from "react";
import { cn } from "../../../lib/utils"; // if using className combiner
import { RocketIcon, PanelRightCloseIcon, PanelRightOpen, Sun, Moon } from "lucide-react"; // replace with logo/icon
import { useToggleContext } from "../context/toggleContext";
import { useAppSelector, useAppDispatch } from "../../../redux/reduxTypeSafety";
import { toggleTheme } from "../../../redux/slices/themeSlice";

interface TopbarProps {
  spaceId: string | undefined;
}

export function Topbar({ spaceId }: TopbarProps) {
    const dispatch = useAppDispatch();
    const {isRightBarOpen, toggleRightBar} = useToggleContext();
    const theme = useAppSelector(state => state.theme.mode)


  return (
    <div className="w-full h-12 px-4 flex items-center bg-zinc-100 dark:bg-zinc-800 shadow-sm cursor-pointer select-none">
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

      <div className=" flex flex-row items-end gap-1">
            <button onClick={() => dispatch(toggleTheme())} className=" cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-600/70 hover:rounded-md p-1 ">
                {theme==="dark"?
                  <Sun className="size-5 text-zinc-600 dark:text-zinc-400 "/>
                  :
                  <Moon className="size-5 text-zinc-600 dark:text-zinc-400"/>
                }
            </button>

            <button onClick={toggleRightBar} className=" cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-600/70 hover:rounded-md p-1">
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

