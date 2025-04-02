import { JSX, useRef } from "react";


type ChildProps = {
    containerRef: React.RefObject<HTMLDivElement | null>; 
    apartmentId?: string;
    apartmentsToDelete?: string[];
    closeModal: () => void;
}

type Props = {
    modalRef: React.RefObject<HTMLDialogElement | null>; 
    apartmentId?: string;
    apartmentsToDelete?: string[];
    closeModal: () => void;
    Element: (props: ChildProps) => JSX.Element;
}


export default function ModalContainer({ modalRef, apartmentId, closeModal, Element, apartmentsToDelete }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleModalClick: React.MouseEventHandler<HTMLDialogElement> = (event) => {
        const rect = containerRef.current?.getBoundingClientRect();

        if(!rect) return;
        const shouldClose = event.clientX < rect.left || event.clientX > (rect.left + rect.width) || event.clientY < rect.top || event.clientY > (rect.top + rect.height);

        if(shouldClose) closeModal();
    }

    return (
        <dialog ref={modalRef} onClick={handleModalClick} className="group w-full h-dvh fixed top-0 left-0 open:block open:opacity-100 open:pointer-events-auto pointer-events-none opacity-0 transition-[opacity] duration-300 z-[999] bg-black/50 flex items-center justify-center">
            <div className="w-full max-h-full overflow-y-auto overflow-x-hidden py-10 px-4 sm:px-6 lg:px-10">
                <Element containerRef={containerRef} closeModal={closeModal} apartmentId={apartmentId} apartmentsToDelete={apartmentsToDelete} />
            </div>
        </dialog>
    )
}