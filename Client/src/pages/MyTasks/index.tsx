import { useEffect, useState, useMemo } from "react"
import useFetchApi from "../../utils/hooks/useFetchApi";
import CircleProgress from "../../components/utils/CircleProgress";
import { Link, useParams } from "react-router-dom";
import SelectButton from "../../components/utils/SelectButton";
import CreateTicketModal, { priorityOptions, typeOptions } from "../../components/utils/CreateTicketModal";
import Button from "../../components/utils/Button";
import SearchFiled from "../../components/utils/SearchFiled";
import Droppable from "./Droppable";
import { useModalDispatch } from "../../utils/context/modal";

export enum Status {
    review = "review",
    active = "active",
    in_progress = "in_progress",
    resolved = "resolved",
    closed = "closed"
}

export enum Priority {
    low = "low",
    medium = "medium",
    high = "high",
    critical = "critical"
}

export enum Type {
    bug = "bug",
    feature = "feature"
}

export interface IItem {
    name: string;
    id: string;
    priority: Priority;
    status: Status;
    type: Type;
}

const MyTasks = () => {
    const { projectId, userId } = useParams();
    const [data, setData] = useState<IItem[]>([])
    const [search, setSearch] = useState("");
    const [ticketType, setTicketType] = useState("all");
    const [ticketPriority, setTicketPriority] = useState("all");

    const [tasksPayload, callTasks] = useFetchApi<IItem[], unknown>("GET", `users/${userId}/projects/${projectId}/tickets/assigned?search=${search}&type=${ticketType}&priority=${ticketPriority}`, [search, ticketType, ticketPriority], (result) => { setData(result) })
    const [_, callUpdate] = useFetchApi<unknown, { id: string, status: Status }>("PATCH", `users/${userId}/projects/${projectId}/tickets/assigned`, [])

    useEffect(() => { callTasks() }, [ticketType, ticketPriority])

    const handelSearch = () => {
        callTasks()
    }

    const realScreenHeightOffset = useMemo(() => window.screen.height * 0.3, [window.screen.height]);
    const realScreenHeightScroll = useMemo(() => window.screen.height * 0.01, [window.screen.height]);

    const DragOverListener = (e: globalThis.DragEvent) => {
        if ((e.screenY + realScreenHeightOffset) >= window.screen.height) window.scrollBy(0, realScreenHeightScroll + ((e.screenY + realScreenHeightOffset) - window.screen.height));
        if ((e.screenY - realScreenHeightOffset) <= 0) window.scrollBy(0, -realScreenHeightScroll + (e.screenY - realScreenHeightOffset));
    }

    useEffect(() => {
        document.addEventListener("drag", DragOverListener);
        return () => document.removeEventListener("drag", DragOverListener)
    }, [])

    const getElementId = (ele: Element | null): string | null => {
        if (ele === null || ele.id === "root") return null;
        if (ele.id.startsWith("droppable-")) return ele.id.split("-")[1];
        return getElementId(ele.parentElement);
    }

    const handelDrop = (index: number, col: string) => {
        if (!(col in Status)) return;
        if (data[index].status === col) return;
        const dataCopy = Array.from(data);
        callUpdate({ id: dataCopy[index].id, status: col as Status })
        dataCopy[index].status = col as Status;
        setData(dataCopy);
    }

    const dispatchModal = useModalDispatch();

    const handelOpenModal = () => {
        dispatchModal({type: "open", payload: <CreateTicketModal />})
    }

    return (
        <div className="flex flex-col w-full p-2 py-10 my-10">

            <div className="flex flex-row gap-6 w-full flex-wrap-reverse items-center justify-between">
                <div className="flex items-center justify-center flex-wrap gap-4">
                    <div className="max-w-[400px]">
                        <SearchFiled onClick={handelSearch} label="Search for tickets" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    <div className="flex gap-1 flex-row flex-wrap">
                        <SelectButton value={ticketPriority} setValue={setTicketPriority} label="priority" options={["all", ...priorityOptions]} />
                        <SelectButton value={ticketType} setValue={setTicketType} label="type" options={["all", ...typeOptions]} />
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                    <Button onClick={handelOpenModal}>create ticket</Button>

                    <Link to={`/users/${userId}/projects/${projectId}`}>
                        <Button>project</Button>
                    </Link>
                </div>

            </div>

            <div className="flex flex-wrap flex-row justify-center items-start my-6 gap-2">

                {!tasksPayload.isLoading ? (
                    <>
                        <Droppable handelDrop={handelDrop} items={data} col={Status.review} />
                        <Droppable handelDrop={handelDrop} items={data} col={Status.active} />
                        <Droppable handelDrop={handelDrop} items={data} col={Status.in_progress} />
                        <Droppable handelDrop={handelDrop} items={data} col={Status.resolved} />
                        <Droppable handelDrop={handelDrop} items={data} col={Status.closed} />
                    </>
                ) : (
                    <CircleProgress size="lg" className="my-20" />
                )}
            </div>
        </div>
    )
}

export default MyTasks;
