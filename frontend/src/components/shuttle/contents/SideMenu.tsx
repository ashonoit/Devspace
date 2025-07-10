"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "../../ui/sidebar";
import {LogOut, Settings, SquareTerminal, User, Pin, PinOff  } from "lucide-react"
import { motion } from "motion/react";
import { useAppDispatch } from "../../../redux/reduxTypeSafety";
import { signout } from "../../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

export function SideMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Signing out");
    dispatch(signout());
    console.log("signed out")
    navigate("/signin");
  };

  const links = [
    {
      label: "Console",
      href: "/console",
      icon: (
        <SquareTerminal  className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <User className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Sign Out",
      href: "#",
      icon: (
        <LogOut 
            onClick={(e)=> {
              e.preventDefault() // stop href from triggering
              handleLogout();
            }} 
            className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" 
        />
      ),
    },
  ];
  const [open, setOpen] = useState(true);
  const [pinned,setPinned] =useState(true);

  return (
    
      <Sidebar open={open} setOpen={setOpen} pinned={pinned} setPinned={setPinned}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">

            <SidebarHeader />

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-5 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Namespace
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

const SidebarHeader = () => {
  const { pinned, setPinned, open } = useSidebar();

  return (
    <div className="flex flex-row items-center justify-between px-2">
      {open ? <Logo /> : <LogoIcon />}
      {open && (
        <button
          className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition"
          onClick={() => {
            setPinned(!pinned);
          }}
        >
          {pinned ? <Pin className="cursor-pointer w-4 h-4" /> : <PinOff className="cursor-pointer w-4 h-4" />}
        </button>
      )}
    </div>
  );
};



