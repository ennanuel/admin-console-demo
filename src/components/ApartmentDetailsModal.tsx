

import { IoImagesOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";

import { useState } from "react";

import { image1, image2, image3, image4 } from "../assets/images";

type Image = {
    src: string | ArrayBuffer | null;
    file_name: string;
    file_size: string;
};

type Apartment = {
    city: string;
    address: string;
    status: string;
    created_at: string;
}

type Props = {
    show: boolean;
    closeModal: () => void;
    apartment: Apartment | null;
}

const IMAGES = [image1, image2, image3, image4];

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

export default function ApartmentDetailsModal({ show, closeModal, apartment }: Props) {
    const [images, setImages] = useState<Image[]>([]);

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

    if(!apartment) return;

    return (
        <dialog className={`${show ? '' : 'opacity-0 pointer-events-none'} transition-[opacity] duration-300 pt-20 z-[999] fixed top-0 left-0 w-full h-dvh overflow-y-auto overflow-x-hidden flex items-center justify-center bg-black/50`}>
            <div className={`${show ? '' : '-translate-y-10'} transition-transform duration-300 mb-10 py-6 w-full max-w-[800px] rounded-xl bg-white border border-gray-200 shadow-lg shadow-black/10`}>
                <div className="px-6 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">Edit apartment details</h2>
                    <button onClick={closeModal} type="button" className="w-8 aspect-square rounded-md text-gray-600 hover:text-red-600 hover:bg-red-100 flex items-center justify-center">
                        <MdClose size={20} />
                    </button>
                </div>
                <form className="mt-10 flex flex-col gap-6 px-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm text-gray-400">Apartment name</label>
                        <input type="text" id="name" title="name" value={`${apartment.city}, ${apartment.address}`} placeholder="1st Cherry Avenue" className="h-12 rounded-md px-4 border border-gray-200" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm text-gray-400">Sale status</label>
                        <select name="status" value={apartment.status} id="status" className="text-gray-600 h-12 rounded-md px-4 border border-gray-200">
                        <option value="">Select option</option>
                        <option value="on_sale">ON SALE</option>
                        <option value="sold">SOLD</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="">
                            <input type="file" onChange={handleFileChange} multiple accept="image/*" id="images" name="images" className="hidden" />
                            <label htmlFor="images" className="cursor-pointer hover:bg-blue-100/50 hover:text-blue-600 w-fit h-10 rounded-md px-4 bg-blue-100 text-blue-700 flex gap-2 items-center justify-center">
                                <IoImagesOutline size={20} />
                                <span className="text-sm font-semibold">Choose image from files</span>
                            </label>
                        </div>
                        {images.length <= 0 && IMAGES.length <= 0 ? <label htmlFor="images" className="text-sm text-gray-400">Select apartment images</label> : null}
                        <ul className="mt-2 grid grid-cols-3 gap-4">
                            {
                                IMAGES.map((image, index) => 
                                    <li key={index} className="has-[button:hover]:bg-red-100/50 has-[button:hover]:border-red-200 w-full border border-transparent flex gap-2 items-center pr-2 overflow-hidden bg-gray-100 rounded-md">
                                        <span className="relative block w-20 h-14 overflow-hidden">
                                            <img src={image} className="w-full h-full object-cover" alt="Apartment image" />
                                        </span>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <span className="text-sm text-gray-600 text-left block truncate max-w-30">{["image.jpg", "image2.jpg", "image3.jpg", "image4.png"][Math.floor((Math.random() * 4))]}</span>
                                            <span className="text-xs text-gray-600/50 text-left">{["20 KB", "30.33 MB"][Math.floor(Math.random() * 2)]}</span>
                                        </div>
                                        <button type="button" className="hover:text-red-600 flex items-center justify-center">
                                            <MdClose size={16} />
                                        </button>
                                    </li>
                                )
                            }
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
                    <div className="mt-4 flex items-center justify-between gap-4">
                        <button onClick={closeModal} className="flex items-center justify-center h-12 rounded-md px-8 bg-gray-200 text-gray-800">
                            <span className="font-semibold">Cancel</span>
                        </button>
                        <button onClick={closeModal} className="flex items-center justify-center h-12 rounded-md px-8 bg-blue-600 text-white">
                            <span className="font-semibold">Save changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}