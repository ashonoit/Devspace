import { HoverEffect } from "../../../../ui/card-hover-effect";

export function SpaceCards
({projects}:
  {
    projects: {
      spaceId: string;
      language: string;
    }[]
  }
) 
{
  return (
    <div className="max-w-5xl mx-auto ">
      <HoverEffect items={projects} />
    </div>
  );
}

