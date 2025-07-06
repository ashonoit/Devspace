import { Outlet } from "react-router-dom";
import { SideMenu } from "./contents/SideMenu";
import { cn } from "../../lib/utils";
import { DARK_CONTENT_BG } from "../../lib/constants";
import { BGeffect } from "./contents";
import { Tools } from "./contents/Tools";

export default function ShuttleLayout(){
    return (
        <div 
            className={cn(
                "mx-auto flex w-full h-screen flex-1 flex-col overflow-hidden border border-neutral-200 bg-gray-100 md:flex-row dark:border-zinc-700", DARK_CONTENT_BG, 
            )}
        >
            <div className="z-50">
                <SideMenu/>
            </div>

            <div className="">
                <BGeffect/>
            </div>

            <div>
                <Tools/>
            </div>
            
            <Outlet/>
        </div>
    )
}