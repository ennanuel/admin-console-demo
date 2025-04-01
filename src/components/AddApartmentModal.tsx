import { IoImagesOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";

import { useState } from "react";

type Image = {
    src: string | ArrayBuffer | null;
    file_name: string;
    file_size: string;
};

const FILE_SIZES = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const K = 1024;

const converFileSize = (size: number, decimals: number = 2) => {
    if(size === 0) return "0 Bytes";

    const i = Math.floor(Math.log(size) / Math.log(K));
    const result = `${(size / Math.pow(K, i)).toFixed(decimals)} ${FILE_SIZES[i]}`;
    return result;
};

const readFile = (file: File) => new Promise<Image>(function (resolve, reject) {
    try {
        const fileReader = new FileReader();
        
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve({
            file_name: file.name,
            file_size: converFileSize(file.size),
            src: fileReader.result
        });
    } catch (error) {
        reject(error);
    }
});

export default function AddApartmentModal({ modalRef, closeModal }: { modalRef: React.RefObject<HTMLDialogElement | null>; closeModal: () => void }) {
    const [images, setImages] = useState<Image[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    const addFeatures: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if(event.key === 'Enter') {
            event.preventDefault();
            const inputElement = (event.target as HTMLInputElement);

            if(features.includes(inputElement.value) || !inputElement.value) return;
            setFeatures([...features, inputElement.value]);
            inputElement.value = '';
        }
    }

    const removeFeatures = (value: string, index: number) => {
        setFeatures(features.filter((feature, i) => value !== feature || index !== i));
    }

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        if(!event.target?.files) return;
        let images = [];

        for(let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i];
            images.push(readFile(file))
        }

        images = await Promise.all(images);

        setImages(images);
    };

    const removeImage = (indexToRemove: number) => {
        setImages(images.filter((image, index) => image && index !== indexToRemove));
    };

    const addApartment: React.FormEventHandler<HTMLElement> = async (event) => {
        event.preventDefault();
    }

    return (
        <dialog ref={modalRef} className="group w-full h-dvh open:block open:opacity-100 open:pointer-events-auto pointer-events-none opacity-0 transition-[opacity] duration-300 z-[999] bg-black/50 flex items-center justify-center">
            <div className="w-full max-h-full overflow-y-auto overflow-x-hidden p-10">
                <div className="-translate-y-10 mx-auto group-open:translate-y-0 transition-transform duration-300 py-6 w-full max-w-[800px] rounded-xl bg-white border border-gray-200 shadow-lg shadow-black/10">
                    <div className="px-6 flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold">Add new apartment</h2>
                        <button onClick={closeModal} type="button" className="w-8 aspect-square rounded-md text-gray-600 hover:text-red-600 hover:bg-red-100 flex items-center justify-center">
                            <MdClose size={20} />
                        </button>
                    </div>
                    <form onSubmit={addApartment} className="mt-10 flex flex-col gap-6 px-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm text-gray-400">Apartment name</label>
                            <input type="text" id="name" title="name" placeholder="1st Cherry Avenue" className="h-12 rounded-md px-4 border border-gray-200" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="desc" className="text-sm text-gray-400">Apartment description</label>
                            <textarea id="desc" title="desc" placeholder="Description" className="h-24 rounded-md px-4 py-2 border border-gray-200" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="location" className="text-sm text-gray-400">Location coordinates</label>
                            <input type="text" id="location" title="location" placeholder="" className="h-12 rounded-md px-4 border border-gray-200" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="status" className="text-sm text-gray-400">Sale status</label>
                            <select name="status" id="status" className="text-gray-600 h-12 rounded-md px-4 border border-gray-200">
                            <option value="">Select option</option>
                            <option value="on_sale">ON SALE</option>
                            <option value="sold">SOLD</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="features" className="text-sm text-gray-400">Additional features</label>
                            <div className="min-h-12 flex flex-wrap gap-2 rounded-md p-1 border border-gray-200">
                                {
                                    features.map((item, index) => (
                                        <span key={index} className="h-10 pl-3 pr-2 rounded-sm flex items-center justify-center gap-4 bg-gray-100 text-gray-800 has-[button:hover]:bg-red-100 has-[button:hover]:text-red-600">
                                            <span className="text-sm font-semibold whitespace-nowrap">{item}</span>
                                            <button onClick={() => removeFeatures(item, index)} className="text-gray-600 hover:text-red-600 flex items-center justify-center">
                                                <MdClose size={16} />
                                            </button>
                                        </span>
                                    ))
                                }
                                <input onKeyDown={addFeatures} type="text" id="features" name="features" placeholder="Feature" className="h-10 flex-1 min-w-30 px-2 focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="images" className="text-sm text-gray-400">Apartment images</label>
                            <div className="">
                                <input type="file" onChange={handleFileChange} multiple accept="image/*" id="images" name="images" className="hidden" />
                                <label htmlFor="images" className="cursor-pointer hover:bg-blue-100/50 hover:text-blue-600 w-fit h-10 rounded-md px-4 bg-blue-100 text-blue-700 flex gap-2 items-center justify-center">
                                    <IoImagesOutline size={20} />
                                    <span className="text-sm font-semibold">Choose image from files</span>
                                </label>
                            </div>
                            <ul className="mt-2 grid grid-cols-3 gap-4">
                            {
                                images.map(({ file_name, file_size, src }, index) => (
                                <li key={index} className="has-[button:hover]:bg-red-100/50 has-[button:hover]:border-red-200 w-full border border-transparent flex gap-2 items-center pr-2 overflow-hidden bg-gray-100 rounded-md">
                                    <span className="relative block w-20 h-14 overflow-hidden">
                                        <img src={String(src)} className="w-full h-full object-cover" alt="Apartment image" />
                                    </span>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <span className="text-sm text-gray-600 text-left block truncate max-w-30">{file_name}</span>
                                        <span className="text-xs text-gray-600/50 text-left">{file_size}</span>
                                    </div>
                                    <button onClick={() => removeImage(index)} type="button" className="hover:text-red-600 flex items-center justify-center">
                                        <MdClose size={16} />
                                    </button>
                                </li>
                                ))
                            }
                            </ul>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-4">
                            <button onClick={closeModal} className="flex items-center justify-center h-12 rounded-md px-8 bg-blue-600 text-white">
                                <span className="font-semibold">Submit details</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    )
}