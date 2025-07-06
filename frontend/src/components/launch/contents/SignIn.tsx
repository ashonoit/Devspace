"use client";
import React from "react";
import { useState } from "react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { cn } from "../../../lib/utils";
// import {
//   IconBrandGoogle,
// } from "@tabler/icons-react";

import useGoogleAuth from "../../../hooks/useGoogleAuth";
import { useAppDispatch } from "../../../redux/reduxTypeSafety";
import { signin } from "../../../redux/slices/authSlice";

export function SignIn(){
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-stone-950 p-6">
      <SigninForm/>
    </div>
  );
}

export function SigninForm() {
  const dispatch = useAppDispatch()
  const { loginWithGoogle, loading, error } = useGoogleAuth()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if(!username || !password){
        alert("Fields are empty")
        return;
      }
  
      dispatch(signin({ username, password }))
  }


  return (
    <div className=" shadow-stone-800 shadow-2xl mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-stone-950">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome Back!
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Login because you can&apos;t see the Home page for eternity 
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="username">Username</Label>
            <Input onChange={(e) => setUsername(e.target.value)} id="username" placeholder="it was 'maru' right?" type="text" />
          </LabelInputContainer>
        </div>
        {/* <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" placeholder="loki@gmail.com" type="email" />
        </LabelInputContainer> */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input onChange={(e) => setPassword(e.target.value)} id="password" placeholder="••••••••" type="password" />
        </LabelInputContainer>
        

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          Sign In &rarr;
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
          <button
            onClick={(e)=>{
              e.preventDefault();
              loginWithGoogle()
            }}
            disabled={loading} 
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="submit"
          >
            {loading ? (
              <span className="text-sm text-neutral-600 dark:text-neutral-300">Signing in...</span>
            ) : (
              <>
                {/* <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" /> */}
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Google
                </span>
              </>
            )}

            <BottomGradient />
          </button>
          
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-orange-800 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
