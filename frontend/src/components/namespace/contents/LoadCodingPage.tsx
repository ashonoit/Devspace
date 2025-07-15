import { useState, useEffect } from "react";
// import axios from 'axios';
import { useParams } from "react-router-dom";
import NamespaceLayout from "../NamespaceLayout";

export const LoadCodingPage = () => {
    const [podCreated, setPodCreated] = useState(false);
    // const [searchParams] = useSearchParams();
    // const spaceId = searchParams.get('spaceId') ?? '';
    const { spaceId, podId } = useParams<{ spaceId: string, podId: string }>();
    
    useEffect(() => {
        if (spaceId && podId) {
            // const callLobbyToStartPod = async (spaceId:string, podId:string) =>{
            //     const response = await axios.post(`${import.meta.env.VITE_SERVER_URI}/api/start`, { spaceId })
            // }
            // axios.post(`http://localhost:3002/start`, { spaceId })
            //     .then(() => setPodCreated(true))
            //     .catch((err : Error) => console.error(err));

            setPodCreated(true)
        }
    }, []);

    if (!podCreated) {
        return <>Booting...</>
    }
    return <NamespaceLayout />

}