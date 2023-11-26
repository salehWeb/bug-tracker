import { Link, useParams } from "react-router-dom"
import { useEffect } from "react";
import useFetchApi from "../utils/hooks/useFetchApi";
import formatDate from "../utils/formatDate";
import CircleProgress from "../components/utils/CircleProgress";
import Content from "../components/utils/Content";
import Members from "../components/project/Members";
import Tickets from "../components/project/Tickets";
import Activities from "../components/project/Activities";
import DangerZone from "../components/project/DangerZone";

interface IProject {
    id: string;
    createdAt: string;
    name: string;
    isPrivate: boolean;
    isReadOnly: boolean;
    members: number;
    tickets: number;
    markdown: string;
    owner: {
        imageUrl: string;
        name: string;
        id: string;
    };
}

const Project = () => {
    const { projectId } = useParams();
    const [payload, call] = useFetchApi<IProject>("GET", `project/${projectId}`);

    const [isOwnerPayload, callIsOwner] = useFetchApi<boolean>("GET", `project/is-owner/${projectId}`);

    useEffect(() => {
        call()
        callIsOwner()
    }, [])

    return payload.isLoading
        ? <CircleProgress size="lg" />
        : payload.result !== null && (<section className="flex flex-col w-full h-full my-10 p-2 flex-grow">
            <div className="bg-white mb-4 rounded-md shadow-md p-4 gap-2 flex flex-col">

                <h1 className="text-2xl font-bold">{payload.result.name}</h1>

                {payload.result.isReadOnly ? (
                    <div className="flex  flex-col justify-center w-full">
                        <div className="flex rounded-md bg-yellow-300 bg-opacity-80 border-black border p-2 w-fit">
                            <p className="text-center text-gray-900 text-lg font-bold">this project is archived</p>
                        </div>
                    </div>
                ) : null}


                <Content editable={Boolean(isOwnerPayload?.result)} url={`project/content/${projectId}`} />

                <div title="owner" className="flex flex-row justify-start items-center">
                    <Link to={`/profile/${payload.result.owner.id}`}>
                        <div className="flex items-center">
                            <img
                                className="rounded-full shadow-md w-10 h-10 object-contain"
                                src={payload.result.owner.imageUrl}
                                alt={`${payload.result.owner.name}`}
                            />
                            <span className="ml-2 font-medium">{payload.result.owner.name}</span>
                        </div>
                    </Link>
                </div>

                <p className="text-sm mt-4 text-gray-600">Created at: {formatDate(payload.result.createdAt)}</p>
            </div>

            <Members />
            <Tickets />
            <Activities />

            {Boolean(isOwnerPayload.result) ? <DangerZone {...payload.result} /> : null}

        </section >
        );
};


export default Project;
