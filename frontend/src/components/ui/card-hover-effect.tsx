import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { CARD_BG,HOVER_CARD_BG, CARD_BORDER_AND_HOVER_BORDER} from "../../lib/constants";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    spaceId: string;
    language: string;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "flex overflow-x-auto gap-4 py-1 pr-4 snap-x snap-mandatory","scrollbar-hide",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          key={item?.spaceId}
          className="snap-start relative group  block p-2 h-[150px] w-[150px] shrink-0"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className={cn("absolute inset-0 h-full w-full block rounded-3xl", HOVER_CARD_BG)}
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          {/* <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card> */}
          <Card2 title={item.spaceId} stackName={item.language}/>
        </a>
      ))}
    </div>
  );
};

export function Card2({
  title,
  stackName,
}: {
  title: string;
  stackName: string;
}) {
  return (
    <div className={cn(
        "rounded-2xl h-full w-full overflow-hidden relative z-20 border", CARD_BG,CARD_BORDER_AND_HOVER_BORDER,
      )}>
      <div className="relative flex items-center justify-center h-1/3 bg-zinc-400/60 dark:bg-zinc-800">
        {/* Line */}
        <div className="absolute  bottom-0 left-0 w-full h-px bg-black/20 dark:bg-white/20 z-0" />

        {/* Icon with background to hide the line behind */}
        {/* <div className={cn("z-10 text-zinc-900 dark:text-zinc-100 bg-neutral-950 px-2 text-xl font-semibold", CARD_BG)}>@</div> */}
      </div>

      <div className="flex flex-col items-start px-2">
        <div className="text-lg font-medium text-zinc-900 dark:text-white">{title}</div>
        <div className="text-xs mt-1 text-black/70 dark:text-white/50">{stackName}</div>
      </div>
    </div>
  );
}

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-1 overflow-hidden relative z-20 border", CARD_BG,CARD_BORDER_AND_HOVER_BORDER,
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-900 dark:text-zinc-100 font-bold tracking-wide", className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        " text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
