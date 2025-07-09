import { Children, createContext, useContext, useState } from "react";

export type PanelType = "output" | "ask" | null;

interface toggleContextType{
    isRightBarOpen : boolean,
    toggleRightBar : ()=>void,

    activePanel: "output" | "ask" | null,
    handlePanelToggle: (panel: PanelType)=>void
}

const toggleContext = createContext<toggleContextType | undefined>(undefined);

export const ToggleProvider = ({children} : {children :React.ReactNode}) =>{
    const [isRightBarOpen, setRightBarOpen] = useState(true);
    const [activePanel, setActivePanel] = useState<"output" | "ask" | null>(null);
    // const [rightBarRef, setRightBarRef] = useState<>(null);

    const toggleRightBar = () => {
        // console.log("toggling")
        setRightBarOpen(prev => !prev);
    }

    const handlePanelToggle = (panel: PanelType) =>{
        setActivePanel(prev => prev===panel ? null : panel);
    }

    return (
        <toggleContext.Provider value={{isRightBarOpen, toggleRightBar, activePanel, handlePanelToggle}}>
            {children}
        </toggleContext.Provider>
    )
}

export const useToggleContext = ()=>{
    const context = useContext(toggleContext);
    if(!context){
        throw new Error("useToggleContext must be used within a toggleProvider");
    }

    return context;
}