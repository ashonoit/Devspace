import { useParams } from "react-router-dom";
import { cn } from "../../lib/utils";
import { DARK_CONTENT_BG } from "../../lib/constants";
import { Topbar } from "./contents/Topbar";
import { CodingPage } from "./contents/CodingPage";
import { ToggleProvider } from "./context/toggleContext";

export default function NamespaceLayout(){

    const { spaceId } = useParams<{ spaceId: string }>();

    return (
        <div 
            className={cn(
                "mx-auto flex w-full h-screen flex-col overflow-hidden bg-gray-100 dark:border-zinc-700", DARK_CONTENT_BG, 
            )}
        >   
            <ToggleProvider>
                <div className="shadow-zinc-900 shadow-sm z-5">
                    <Topbar spaceId={spaceId}/>
                </div>


                <div className="h-full w-full">
                    <CodingPage/>
                </div>

                {/* <Outlet/> */}
            </ToggleProvider>
        </div>
    )
}