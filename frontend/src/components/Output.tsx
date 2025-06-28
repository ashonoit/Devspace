import { useSearchParams } from "react-router-dom";

export const Output = () => {
    const [searchParams] = useSearchParams();
    const spaceId = searchParams.get('spaceId') ?? '';
    const INSTANCE_URI = `ws://localhost:3003`;

    return <div style={{height: "40vh", background: "white"}}>
        <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
}