import React from "react"
import { cn } from "../../../lib/utils"
import { Toggle } from "../../ui/toggle"
import { Sun, Moon } from "lucide-react"
import { useAppSelector, useAppDispatch } from "../../../redux/reduxTypeSafety"
import { toggleTheme } from "../../../redux/slices/themeSlice"

interface ToolDrawerProps {
  children: React.ReactNode
}

export function Tools(){
    const theme = useAppSelector((state)=>state.theme.mode);
    const dispatch = useAppDispatch()

    return (
        <div>
            <ToolDrawer>
              <div className="flex flex-row">
                  <Toggle key={theme} aria-label="toggle theme" className="cursor-pointer"
                    pressed={theme === "dark"}
                    onClick={() => dispatch(toggleTheme())}
                  >
                      {theme==="dark"?
                          <Sun className="h-4 w-4 text-zinc-200 text-md"/>
                          :
                          <Moon className="h-4 w-4 "/>
                      }

                  </Toggle>
              </div>


            </ToolDrawer>
        </div>
    )
}

export function ToolDrawer({ children }: ToolDrawerProps) {
  return (
    <div className="fixed right-0 top-1/4 z-50 -translate-y-1/2">
      <div
        className={cn(
          "group flex h-14 max-w-[1.5rem] items-center justify-end rounded-l-full bg-zinc-100 dark:bg-zinc-800 transition-[max-width] duration-500 ease-in-out hover:max-w-[200px] overflow-hidden"
        )}
      >
        <div className="flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {children}
        </div>
      </div>
    </div>
  )
}


// export function ToolDrawer({ children }: ToolDrawerProps) {
//   return (
//     <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
//       <div
//         className={cn(
//           "group relative h-14 w-6 rounded-l-full bg-gray-300 dark:bg-zinc-800 transition-all duration-400 hover:w-fit px-2"
//         )}
//       >
//         <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           {children}
//         </div>
//       </div>
//     </div>
//   )
// }
