import { useToggleContext } from "../context/toggleContext";
import { Output } from "./Output";

export function RightPanels (){
    const {activePanel} = useToggleContext();

    if(!activePanel) return null;

    if(activePanel==="output"){
        return (
            <Output/>
        )
    }
    else if(activePanel==="ask"){
        return (
            <div>
                Ask from AI
            </div>
        )
    }


}