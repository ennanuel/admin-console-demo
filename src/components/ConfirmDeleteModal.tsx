import { MdClose } from "react-icons/md";



export default function ConfirmDeleteModal({ show, closeModal }: { show: boolean; closeModal: () => void }) {

    return (
        <dialog className={`${show ? '' : 'opacity-0 pointer-events-none'} z-[9999] transition-opacity duration-300 fixed top-0 left-0 w-full h-dvh bg-black/50 flex items-center justify-center `}>
            <div className={`${show ? '' : '-translate-y-10'} transition-transform duration-300 w-full max-w-[480px] rounded-md bg-white py-6 shadow-xl shadow-black/10`}>
                <div className="px-6 flex items-center justify-between gap-6">
                    <h2 className="text-2xl font-bold text-gray-800">Confirm delete</h2>
                    <button onClick={closeModal} className="flex items-center justify-center w-8 aspect-square rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600">
                        <MdClose size={18} />
                    </button>
                </div>
                <div className="mt-8 px-6 flex flex-col gap-6">
                    <p className="text-sm text-gray-600">Are you sure you want to delete these apartment details?</p>
                    <div className="flex items-center gap-4">
                        <button onClick={closeModal} className="h-10 min-w-20 rounded-md px-4 flex items-center justify-center bg-gray-200">
                            <span className="text-sm font-semibold text-gray-800">No</span>
                        </button>
                        <button onClick={closeModal} className="h-10 min-w-20 rounded-md px-4 flex items-center justify-center bg-red-500">
                            <span className="text-sm font-semibold text-white">Yes</span>
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}