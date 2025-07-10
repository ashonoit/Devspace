import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {  Navbar, TVAdoor } from "./contents";
import { useAppDispatch, useAppSelector } from "../../redux/reduxTypeSafety";
import { loadUser } from "../../redux/slices/authSlice";


export default function LandingLayout(){
    const dispatch = useAppDispatch();
    const location = useLocation();
  
    const isAuthenticated = useAppSelector(state => state.auth.authenticated);
    const authLoading = useAppSelector(state => state.auth.loading);
  
    useEffect(() => {
      dispatch(loadUser());
    }, [location.pathname]);
  
    if (authLoading) {
      return (
        <div className="w-screen h-screen bg-black flex flex-row items-center justify-center">
          <h1 className="text-5xl text-zinc-200">Ruk zra...</h1>
        </div>
      );
    }
  
    if(isAuthenticated) return <Navigate to="/console"/>


    return(
        <div className="relative pointer-events-none w-screen h-screen overflow-hidden bg-black text-white">
            {/* Spline as full screen background */}

            <div className="absolute inset-0 z-10 pointer-events-auto">
                <TVAdoor/>
            </div>

            {/* Navbar (always on top) */}

            <div className="absolute top-0 left-0 w-full z-20 pointer-events-auto">
              <Navbar />
            </div>

            {/* Main content over the spline */}

            <div className="absolute inset-0 z-10 flex items-center justify-between px-10">
              <Outlet />
            </div>
        </div>
    );
}