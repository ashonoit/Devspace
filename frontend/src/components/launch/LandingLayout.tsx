import { Outlet } from "react-router-dom";
import {  Navbar, TVAdoor } from "./contents";


export default function LandingLayout(){
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