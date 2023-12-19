import { useCallback, useEffect, useState } from "react";
import Button from "../../components/utils/Button"
import Modal from "../../components/utils/Modal";
import useFetchApi from "../../utils/hooks/useFetchApi";
import SelectUser from "../../components/utils/SelectUser";
import { IModalProps } from ".";
import { useParams } from "react-router-dom";

const TransferModal = (props: IModalProps) => {
    const {projectId} = useParams()

    const [transferProjectPayload, callTransferProject] = useFetchApi<unknown, { projectId: string, memberId: string }>("POST", "project/transfer");

    const [isSubmit, setIsSubmit] = useState(false);
    const [isValidId, setIsValidId] = useState(true);
    const [memberId, setMemberId] = useState("")

    const handelTransferProject = useCallback(() => {
        props.setIsOpenModal(false);
        callTransferProject({ projectId: projectId!, memberId });
    }, [memberId])

    useEffect(() => {
        setIsSubmit(false)
    }, [props.isOpenModal])

    return (
        <Modal isOpen={props.isOpenModal} setIsOpen={props.setIsOpenModal}>
            <div className="flex flex-col justify-center items-center pb-2 px-8 text-center h-full">

                {isSubmit ? (
                    <>
                        <div className="pt-4 pb-14 gap-4 flex flex-col w-full justify-center items-center">
                            <h1 className="text-3xl font-black text-blue-700 dark:text-blue-300">{props.name}</h1>
                            <h2 className="text-xl font-bold text-primary dark:text-secondary">are you sure you want to transfer this project</h2>
                        </div>

                        <div className="flex flex-row items-center mt-10 justify-center w-full px-4">
                            <Button isLoading={transferProjectPayload.isLoading} onClick={() => handelTransferProject()} className="!bg-red-600">transfer</Button>
                        </div>

                    </>
                ) : (
                    <>
                        <div className="pt-4 pb-10 gap-4 flex flex-col w-full justify-center items-center">
                            <h1 className="text-3xl font-black text-blue-700 dark:text-blue-300">{props.name}</h1>
                            <h2 className="text-xl font-bold text-primary dark:text-secondary">select user to transfer this project to</h2>
                        </div>

                        <div className="flex flex-col gap-8 p-2 w-full items-start">
                            <SelectUser notMe setIsValid={setIsValidId} required label="select user" route={`members/${projectId}`} setId={setMemberId} id={memberId} />
                            <Button isValid={isValidId} onClick={() => setIsSubmit(true)}>Transfer</Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    )
}

export default TransferModal;
