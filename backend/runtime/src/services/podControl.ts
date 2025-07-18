import axios from 'axios';

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

export const authorisationWithLobby = async (accessToken: string, podId: string): Promise<boolean> =>{
    try {
        const res = await axios.post(`${process.env.LOBBY_URI}/api/pod/authorisePodAccess`, {
          accessToken,
          podId
        });

        return res.data?.success === true;
    } catch (err:any) {
      console.error("authorisation with lobby failed:", err);
      return false;
    }
}
