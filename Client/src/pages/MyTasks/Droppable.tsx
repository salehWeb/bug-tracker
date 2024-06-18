import { DragEvent, useRef, useState } from "react";
import { IItem } from ".";
import Draggable from "./Draggable";
import { Link, useParams } from "react-router-dom";
import labelsColors from "../../utils/labelsColors";

interface IDroppableProps {
    items: IItem[] | null;
    col: string;
    handelDrop: (index: number, col: string) => void;
    isReadOnly: boolean;
}

const Droppable = (props: IDroppableProps) => {
    const [isOver, setIsOver] = useState(false)
    const { projectId } = useParams();
    const ref = useRef<HTMLDivElement>(null);

    const dragOverHandler = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        console.log(event)
        event.dataTransfer.dropEffect = "move";
        setIsOver(true)
    };

    const dropHandler = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const itemIndex = Number(event.dataTransfer.getData("text/plain"));
        props.handelDrop(itemIndex, props.col)
        setIsOver(false)
    };

    return (
        <div
        ref={ref}
        onDragOver={dragOverHandler}
        onDrop={dropHandler}
        onDragLeave={() => setIsOver(false)}
        id={`droppable-${props.col}`}
        className={`flex flex-col p-4 h-fit rounded-md gap-2 !w-60 ${isOver ? "dark:bg-slate-800 bg-slate-200" :""}`}
        >
            <h2 className="text-2xl font-bold text-center text-primary dark:text-secondary w-full">{props.col}</h2>
            <div className="flex gap-2 justify-start flex-col flex-1 overflow-y-auto max-h-screen">
                {props.items && props.items.map((item, index) => {
                    if (item.status === props.col) return (
                        <Draggable isReadOnly={props.isReadOnly} index={index} key={index}>
                            <div className="flex flex-col gap-2 w-full">

                                <Link className="link text-base" to={`/projects/${projectId}/tickets/${item.id}`}>{item.name}</Link>

                                <div className="flex text-sm flex-row justify-start gap-1 flex-wrap">
                                    <span title="type" className={`rounded-sm font-bold border-black dark:border-white w-fit p-1 text-white dark:text-black ${labelsColors.TYPE[item.type]}`}>{item.type}</span>
                                    <span title="priority" className={`rounded-sm font-bold border-black dark:border-white w-fit p-1 text-white dark:text-black ${labelsColors.PRIORITY[item.priority]}`}>{item.priority}</span>
                                </div>

                            </div>
                        </Draggable>
                    )
                })}
            </div>
        </div>
    )
}


export default Droppable;
