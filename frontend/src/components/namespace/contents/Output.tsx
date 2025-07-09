import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export const Output = () => {
    const [searchParams] = useSearchParams();
    const spaceId = searchParams.get('spaceId') ?? '';
    const INSTANCE_URI = `ws://localhost:3003`;
    const [notfound, setNotFound] =useState(false);

    return (
        <div className="flex flex-col w-full h-full">

            <div className="h-full">
                {!notfound ? (
                    <iframe 
                        className="w-full h-full border-none bg-zinc-950"
                        src={`${INSTANCE_URI}`} 
                        onError={()=>setNotFound(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white">
                      <p className="text-lg font-semibold">Page could not be loaded</p>
                      <p className="text-sm text-zinc-400">The embedded page might be down or unavailable.</p>
                    </div>
                )
                }
                
            </div>  
        </div>
    );
}
