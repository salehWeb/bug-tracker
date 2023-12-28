import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import useFetchApi from "../../utils/hooks/useFetchApi";
import CircleProgress from "../../components/utils/CircleProgress";
import { IChartsData, isData } from ".";
import TypeChart from "./TypeChart";
import StatusChart from "./StatusChart";
import PriorityChart from "./PriorityChart";

const Charts = () => {
    const { projectId } = useParams();
    const [payload, call] = useFetchApi<IChartsData>("GET", `projects/${projectId}/tickets/chart`);

    useLayoutEffect(() => { call() }, [call])

    return (
        !payload.isLoading && payload.result === null ? null :
            <div className="flex flex-row flex-wrap gap-2 justify-center items-center my-4">
                {payload.isLoading ? <CircleProgress size="lg" /> : payload.result === null ? null : (
                    <>
                        {!isData(payload.result.type) ? null : <TypeChart {...payload.result.type} />}
                        {!isData(payload.result.status) ? null : <StatusChart {...payload.result.status} />}
                        {!isData(payload.result.priority) ? null : <PriorityChart {...payload.result.priority} />}
                    </>
                )}
            </div>
    )
}

export default Charts;
