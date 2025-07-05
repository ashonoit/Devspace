import axios from "axios";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

interface IUseGoogleAuthResult {
    loginWithGoogle: ()=>void;
    loading: boolean;
    error:string | null;
}



const useGoogleAuth = () : IUseGoogleAuthResult =>{

    const navigate =useNavigate();
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string | null>(null);

    const sendTokenToBackend = async (code:string) =>{
        setLoading(true);
        setError(null);

        try{
            const res = await axios.post(`${import.meta.env.VITE_SERVER_URI!}/auth/viaGoogle`,{code});
            
            const {user}=res.data;
            
            console.log('User authenticated using Google auth');
            console.log(user);
            navigate('/console'); 
        }catch(err:any){
            console.error('Google auth error:', err);
            setError('Failed to authenticate with Google');
        }
        finally{
            setLoading(false);
        }
    }

    const googleLogin = useGoogleLogin({
        flow: 'auth-code', // for backend uses code exchange
        onSuccess: async (tokenResponse) => {
          if (tokenResponse.code) {
            // console.log(tokenResponse.code)
            await sendTokenToBackend(tokenResponse.code); // for ID token (popup)
          } else {
            setError('No authorization code received');
          }
        },
        onError: () => {
          setError('Google login failed');
        },
    });

    return { loginWithGoogle: googleLogin, loading, error };
};

export default useGoogleAuth;