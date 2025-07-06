
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppDispatch } from "../redux/reduxTypeSafety";
import { signinWithGoogle } from "../redux/slices/authSlice";

interface IUseGoogleAuthResult {
    loginWithGoogle: ()=>void;
    loading: boolean;
    error:string | null;
}



const useGoogleAuth = () : IUseGoogleAuthResult =>{
    const dispatch = useAppDispatch();
    const navigate =useNavigate();
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string | null>(null);

    const sendTokenToRedux = async (code:string) =>{
        setLoading(true);
        setError(null);

        try{
            const result = await dispatch(signinWithGoogle({ code })).unwrap();
            
            console.log("User authenticated using Google auth:", result);

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
            await sendTokenToRedux(tokenResponse.code); // for ID token (popup)
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