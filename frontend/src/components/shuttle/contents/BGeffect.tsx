"use client";
import { BackgroundBeams } from "../../ui/background-beams";
import { cn } from "../../../lib/utils";
import { SHUTTLE_BG_EFFECT_COLOR } from "../../../lib/constants";

export function BGeffect() {
  return (
    <div className={cn("h-full absolute inset-0 w-full flex flex-col items-center justify-center over antialiased", SHUTTLE_BG_EFFECT_COLOR)}>
      <BackgroundBeams />
    </div>
  );
}
