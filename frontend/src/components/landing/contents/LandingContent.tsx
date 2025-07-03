import React from "react";

const LandingContent = () => {
  return (
    <div className="relative h-screen w-full flex items-center justify-center px-6">
        <div className="flex flex-col md:flex-row gap-12 w-full ">
            {/* Left column - Title */}
            <div className="flex flex-col justify-center items-start text-left space-y-4 w-full md:w-1/2">
              <h1 className="text-6xl md:text-8xl font-bold text-black dark:text-white">
                Code-Space
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Jump stacks. Like jumping timelines.
              </p>
            </div>

            {/* Right column - Quote */}
            <div className="flex flex-col justify-center items-end text-right space-y-4 w-full md:w-1/2">
              <blockquote className="text-xl italic text-gray-700 dark:text-gray-300 max-w-md">
                Code-Space gives you your own live coding environment, instantly spun up for any tech stack. Explore what others are building, share your own spaces, and code without setup hassles.
              </blockquote>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">– xyz</p> */}
            </div>
        </div>
    </div>
  );
};

export default LandingContent;
