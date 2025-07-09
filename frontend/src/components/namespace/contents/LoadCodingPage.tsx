import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NamespaceLayout from "../NamespaceLayout";

export const LoadCodingPage = () => {
    const [podCreated, setPodCreated] = useState(false);
    // const [searchParams] = useSearchParams();
    // const spaceId = searchParams.get('spaceId') ?? '';
    const { spaceId } = useParams<{ spaceId: string }>();
    
    useEffect(() => {
        if (spaceId) {
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