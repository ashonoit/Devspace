import { RocketIcon } from "lucide-react";
import {
  Select,SelectContent,SelectItem,SelectTrigger,SelectValue,
} from "../../../../../components/ui/select"

import { useState } from "react";
import { useLaunchNamespace } from "../../../../../hooks/useLaunchNamespace";

export function CreateNamespace() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stack, setStack] = useState('');
  const { launch, loading } = useLaunchNamespace(); // hook in use

  const handleLaunch = async ()=>{
    if (loading) return; // prevent double submission
    if (!title.trim() || !description.trim() || !stack.trim()) {
      alert("All fields are required.");
      return;
    }

    try{

      // Launch namespace
      await launch({ title, description, stack })
    }
    catch(err){
      console.log("Failed to launch ", err);
      alert("Try again later")
    }
  }


  return (
    <div className="w-full rounded-2xl bg-transparent p-1 space-y-3">
      <h4 className="text-md font-sm text-gray-900 dark:text-gray-300">Launch Namespace</h4>

      {/* Description */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-3">

          <textarea
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a description about your namespace..."
            className="w-full scrollbar-hide resize-none rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-200 p-3 focus:outline-none "
            rows={3}
          />

          {/* Inputs and Button */}
          <div className="flex flex-row gap-2 justify-between">
            
            <div className="flex flex-row gap-2">
                <input
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="UniqueTitle..."
                  className="flex-1 min-w-[180px] rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 border border-zinc-300 dark:border-zinc-700"
                  />
                  <StackSelect value={stack} setValue={setStack}/>
                
            </div>

            {/* <button className="flex items-center gap-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-zinc-900 px-4 py-2 font-medium text-sm transition duration-150 ease-in-out">
              <RocketIcon className="w-4 h-4" />
              Launch
            </button> */}
            <button onClick={handleLaunch}
               className="relative cursor-pointer inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 p-[1px] transition-all duration-300 hover:scale-105 focus:outline-none"
            >
              
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
                {loading?<>Loading...</>
                        :
                        <> 
                        Launch 
                        <RocketIcon className="ml-2 w-4 h-4" />
                        </>
                }
              </span>
            </button>

          </div>
        </div>
    </div>
  );
}

const stacks = [
  { 
    stackName: "NodeJS",
    stackValue: "nodejs"
  },{
    stackName: "C++",
    stackValue: "c++"
  },{
    stackName: "Python",
    stackValue: "python"
  }
]

function StackSelect({
  value,
  setValue,
}: {
  value: string;
  setValue: (val: string) => void;
}){
  return (
    <Select value={value} onValueChange={(val) => setValue(val)}>
      <SelectTrigger className="w-[130px] rounded-xl bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 text-zinc-800 focus:bg-zinc-300 dark:focus:bg-zinc-900">
        <SelectValue placeholder="Stack" />
      </SelectTrigger>
      <SelectContent className=" bg-zinc-200 dark:bg-zinc-800 shadow-xl shadow-zinc-900 border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 text-zinc-800">
        {
          stacks.map((stack,idx) =>{
            return <SelectItem key={idx} className="dark:hover:bg-zinc-700/50 hover:bg-zinc-400/50 rounded-md cursor-pointer" value={stack.stackValue}>{stack.stackName}</SelectItem>;
          })
        }
        {/* <SelectItem className="dark:hover:bg-zinc-700/50 hover:bg-zinc-400/50 rounded-md cursor-pointer" value="nodejs">NodeJs</SelectItem>
        <SelectItem className="dark:hover:bg-zinc-700/50 hover:bg-zinc-400/50 rounded-md cursor-pointer " value="c++">C++</SelectItem>
        <SelectItem className="dark:hover:bg-zinc-700/50 hover:bg-zinc-400/50 rounded-md cursor-pointer" value="python">Python</SelectItem>
        <SelectItem className="dark:hover:bg-zinc-700/50 hover:bg-zinc-400/50 rounded-md cursor-pointer" value="ruby">Ruby</SelectItem>
        */}
      </SelectContent>
    </Select>
  )
}
