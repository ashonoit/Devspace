import React, {ReactNode} from 'react';

export const Sidebar = ({children}: { children: ReactNode }) => {
  return (
    <aside className="w-[250px] h-screen border-r-2 border-[#242424] pt-[3px]">
        {children}
    </aside>

  )
}

export default Sidebar
