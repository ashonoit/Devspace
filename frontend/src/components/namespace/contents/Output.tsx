import { useState } from "react";
import { useParams } from "react-router-dom";

export const Output = () => {
    const {spaceId, podId} = useParams<{spaceId: string, podId:string }>();

    //http://${podId}.${import.meta.env.VITE_MINIKUBE_IP}.nip.io
    const INSTANCE_URI = `http://${podId}.${import.meta.env.VITE_MINIKUBE_IP}.nip.io`;
    const [notfound, setNotFound] =useState(false);

    return (
        <div className="flex flex-col w-full h-full">

            <div className="h-full">
                {!notfound ? (
                    <iframe 
                        className="w-full h-full border-none bg-zinc-300"
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
