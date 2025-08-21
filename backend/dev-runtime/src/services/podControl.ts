import axios from 'axios';
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";

// const LOBBY_URI= "http://host.docker.internal:3000"

export const deleteResourcesByPodId = async (podId: string, spaceId:string) => {
    try {

        const res = await axios.post(`${process.env.LOBBY_URI}/api/pod/selfDestroy`, {
          podId,spaceId
        });

        console.log(`Cleaned up resources for podId: ${podId}`);

    } catch (error) {
        console.error(`Failed to delete resources for podId:${podId}:`, error);
    }
};

// export const authorisationWithLobby = async (accessToken: string, podId: string): Promise<boolean> =>{
//     try {
//         const res = await axios.post(`${process.env.LOBBY_URI}/api/pod/authorisePodAccess`, {
//           accessToken,
//           podId
//         });

//         return res.data?.success === true;
//     } catch (err:any) {
//       console.error("authorisation with lobby failed:", err);
//       return false;
//     }
// }

export const authWithJWT = async (podToken: string, podId: string): Promise<boolean> =>{
    try {
        if(!podToken || !podId ) {
                console.log("Socket auth failed: Missing required fields");
                return false;
        }

        const decoded = jwt.verify(podToken, process.env.JWT_POD_SECRET as string) as DefaultJwtPayload;

        // console.log("decoded podToken : ", decoded);

        if(decoded.podId !==podId){
          console.log("Invalid podId : auth failed")
          return false;
        }

        return true;
    } catch (err:any) {
      console.error("authorisation with lobby failed:", err);
      return false;
    }
}
