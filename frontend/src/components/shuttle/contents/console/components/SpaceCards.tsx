import { HoverEffect } from "../../../../ui/card-hover-effect";

export function SpaceCards
({projects}:
  {
    projects: {
      title: string;
      description: string;
      link: string;
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

