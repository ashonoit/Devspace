import { useSearchParams } from "react-router-dom";

export const Output = () => {
    const [searchParams] = useSearchParams();
    const spaceId = searchParams.get('spaceId') ?? '';
    const INSTANCE_URI = `ws://localhost:3003`;

    return (
        <iframe 
            className="w-full h-full border-none"
            src={`${INSTANCE_URI}`} 
        />
    );
}
