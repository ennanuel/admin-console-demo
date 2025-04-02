import { IoImagesOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";

import { useState, useRef, useEffect } from "react";
import { FiAlertCircle } from "react-icons/fi";

import APARTMENTS from "../assets/APARTMENTS.json";
import { image1, image2, image4 } from "../assets/images";


type Props = {
    containerRef: React.RefObject<HTMLDivElement | null>; 
    apartmentId?: string;
    closeModal: () => void;
}

interface ModifiedError extends Error {
    messages: { [key: string]: string; }
}

type Image = {
    src: string | ArrayBuffer | null;
    file_name: string;
    file_size: string;
};

type ApartmentValues = {
    name?: string;
    desc?: string;
    sale_status?: string;
    features?: string[];
    longitude?: number;
    latitude?: number;
    images?: File[];
    images_to_delete?: string[];
    previous_images_length?: number;
    features_to_remove?: string[];
    previous_features_length?: number;
}

const FILE_SIZES = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const K = 1024;
const MAX_FILE_SIZE = 10 * Math.pow(K, 2);

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

type CheckResult = { failed: boolean; messages: { [key: string]: string; } }

function checkFormValues (values: ApartmentValues): CheckResult {
    const { features, features_to_remove, previous_features_length, images, images_to_delete, previous_images_length, ...otherValues } = values;
    const result: CheckResult = { failed: false, messages: {} };

    for(let [key, value] of Object.entries(otherValues)) {
        switch(key) {
            case "name":
                if(!value) result.messages.name = "Apartment must have a Name";
                continue;
            case "desc":
                if(!value) result.messages.desc = "Apartment must have Description";
                continue;
            case "sale_status":
                if(!value) result.messages.sale_status = "Apartment Sale Status required (eg: SOLD, ON SALE)";
                continue;
            case "longitude":
                if(!value) result.messages.longitude = "Must have a Google Maps Longitude Coordinate";
                continue;
            case "latitude":
                if(!value) result.messages.latitude = "Must have a Google Maps Latitude Coordinate";
                continue;
        }
    }

    if((!Boolean(features?.length)) && features_to_remove?.length === previous_features_length) {
        result.messages.features = "The apartment must have at least one feature";
    }
    if((!Boolean(images?.length)) && images_to_delete?.length === previous_images_length) {
        result.messages.images = "The apartment must have at least one image";
    }

    if((Object.values(result.messages)).length > 0) {
        result.messages.message = "Some fields are empty";
        result.failed = true;
    }

    return result;
};

type Apartment = {
    name: string;
    desc: string;
    sale_status: string;
    features: string[];
    longitude: number;
    latitude: number;
    images: Image[];
}

type FetchResult = {
    loading: boolean;
    error: string;
    apartmentDetails: Apartment | null;
}

function useGetApartmentDetails(apartmentId?: string): FetchResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [apartmentDetails, setApartmentDetails] = useState<Apartment | null>(null);

    useEffect(() => {
        async function fetchDetails() {
            try {
                setLoading(true);
                const apartment = APARTMENTS[Number(apartmentId)];

                if(!apartment) throw new Error("No apartment was found");
                setApartmentDetails({
                    name: `${apartment.city}, ${apartment.address}`,
                    desc: "This is a description",
                    sale_status: apartment.status,
                    longitude: 100.00,
                    latitude: 100.24,
                    features: ["Bigs coaster", "Thrift", "Beans"],
                    images: [
                        { file_name: "wethin.png", file_size: "204.44 KB", src: image1 },
                        { file_name: "Another file.mpeg", file_size: "338.54 KB", src: image2 },
                        { file_name: "something_bad.jpg", file_size: "103.01 KB", src: image4 },
                    ]
                });
            } catch (error) {
                setError((error as Error).message);
            }
        }

        fetchDetails();
    }, [apartmentId]);

    return { loading, error, apartmentDetails };
}

export default function ApartmentDetails({ containerRef, apartmentId, closeModal }: Props) {
    const { apartmentDetails } = useGetApartmentDetails(apartmentId);

    const [errors, setErrors] = useState<{ [key: string]: string; }>({});

    const [images, setImages] = useState<Image[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    const values = useRef<ApartmentValues>({ images_to_delete: [], features_to_remove: [] });

    const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (event) => {
        if(event.key === 'Enter' && event.target) {
            event.preventDefault();

            const nextFieldId = (event.target as HTMLElement).dataset.nextFieldId;

            if(nextFieldId) document.getElementById(nextFieldId)?.focus();
        }
    }

    const addFeatures: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if(event.key === 'Enter') {
            event.preventDefault();
            const inputElement = (event.target as HTMLInputElement);

            if(values.current?.features?.length && (values.current?.features?.includes(inputElement.value) || !inputElement.value)) return;

            const newFeatures = values.current?.features?.length ? 
                [...values.current.features, inputElement.value] : 
                [inputElement.value];
            values.current.features = newFeatures;

            setFeatures([...features, inputElement.value]);
            inputElement.value = '';

            setErrors((prev) => ({ ...prev, features: '' }));
        }
    }

    const removeFeatures = (value: string, index: number) => {
        if(!value) return;

        setFeatures(features?.filter((feature, i) => value !== feature || index !== i));
        if(apartmentDetails?.features?.includes(value)) values.current.features_to_remove?.push(value);

        if(!values?.current?.features?.length) return;
        const newFeatures = values.current?.features?.filter((feature, i) => value !== feature || index !== i) || [];
        values.current.features = newFeatures;
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = async (event) => {
        if(!event.target) return;
        values.current = { ...values.current, [event.target.id]: event.target.value };
        setErrors((prev) => ({ ...prev, [event.target.id]: '' }));
    };

    const addImage: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        if(!event.target?.files) return;
        let result = [];

        for(let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i];

            if(file.size <= MAX_FILE_SIZE) {
                result.push(readFile(file));
                if(values.current.images) values.current?.images?.push(file);
                else values.current.images = [file]
            } else {
                setErrors((prev) => ({ 
                    ...prev, 
                    images: `Could not upload image, the file cannot be above ${converFileSize(MAX_FILE_SIZE)}` 
                }));
            }
        }

        result = await Promise.all(result);
        setImages([...images, ...result]);
        setErrors((prev) => ({ ...prev, images: '' }));
        
        event.target.value = "";
        event.target.files = null;
    };

    const removeImage = (indexToRemove: number, fileName?: string) => {
        
        setImages(images.filter((image, index) => image && index !== indexToRemove));
        values.current.images = values
            ?.current
            ?.images
            ?.filter((image, index) => image && index !== indexToRemove);

        if(apartmentDetails?.images?.some((image) => image.file_name === fileName)) values.current.images_to_delete?.push(String(fileName));
    };

    const addApartment: React.FormEventHandler<HTMLElement> = async (event) => {
        event.preventDefault();
        setErrors({});
        
        try {
            const valueCheck = checkFormValues(values.current);
            if(valueCheck.failed) throw valueCheck;
            console.log(values.current);

            closeModal();
        } catch (error) {
            const errors = (error as ModifiedError).messages || {};
            const errorMessage = (error as ModifiedError).message || "Submission failed";
            
            setErrors(({
                message: errorMessage,
                ...errors,
            }));

            containerRef.current?.scrollIntoView();
        }
    }

    useEffect(() => {
        if(!apartmentDetails) return;

        const { features: apartmentFeatures, images: apartmentImages, ...restOfApartmentDetails } = apartmentDetails;
        setFeatures(apartmentFeatures);
        setImages(apartmentImages);

        values.current.previous_features_length = apartmentFeatures.length;
        values.current.previous_images_length = apartmentImages.length;

        for(let [key, value] of Object.entries(restOfApartmentDetails)) {
            const element = (document.getElementById(key) as HTMLInputElement);

            if(!element) continue;
            element.value = String(value);
        }
    }, [apartmentDetails]);

    useEffect(() => {
        setFeatures([]);
        setImages([]);
        
        values.current.previous_features_length = 0;
        values.current.previous_images_length = 0;
    }, [apartmentId])

    return (
        <div ref={containerRef} className="-translate-y-10 mx-auto group-open:translate-y-0 transition-transform duration-300 py-6 w-full max-w-[800px] rounded-xl bg-white shadow-lg shadow-black/10">
            <div className="px-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Edit apartment details</h2>
                <button onClick={closeModal} type="button" className="w-8 aspect-square rounded-md text-gray-600 hover:text-red-600 hover:bg-red-100 flex items-center justify-center">
                    <MdClose size={20} />
                </button>
            </div>
            {
                errors?.message ? <div className="mx-6 mt-6 flex items-center gap-2 relative bg-red-100/60 text-red-600 rounded-md overflow-hidden py-2 pl-6 pr-3 before:absolute before:top-0 before:left-0 before:w-2 before:h-full before:bg-red-500">
                    <FiAlertCircle size={16} />
                    <span className="text-sm font-semibold">{errors.message}</span>
                </div> :null
            }
            <form onSubmit={addApartment} className="mt-10 flex flex-col gap-6 px-6">
                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-sm text-gray-400">Apartment name</label>
                    <input type="text" id="name" name="name" onChange={handleChange} onKeyDown={handleKeyPress} data-next-field-id="desc" placeholder="1st Cherry Avenue" className={`${errors?.name ? 'border-red-200 focus:outline-red-400 text-red-600 placeholder:text-red-400' : 'border-gray-200 text-gray-600'} mt-1 h-12 rounded-md px-4 border`} />
                    { errors?.name ? <p className="text-xs text-red-500">{errors.name}</p> : null }
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="desc" className="text-sm text-gray-400">Apartment description</label>
                    <textarea id="desc" name="desc" onChange={handleChange} data-next-field-id="sale_status" placeholder="Description" className={`${errors?.desc ? 'border-red-200 focus:outline-red-400 text-red-600 placeholder:text-red-400' : 'border-gray-200 text-gray-600'} mt-1 h-24 rounded-md px-4 py-2 border`} />
                    { errors?.desc ? <p className="text-xs text-red-500">{errors.desc}</p> : null }
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="sale_status" className="text-sm text-gray-400">Sale status</label>
                    <select name="sale_status" id="sale_status" onChange={handleChange} onKeyDown={handleKeyPress} data-next-field-id="features" className={`${errors?.sale_status ? 'border-red-200 focus:outline-red-400 text-red-600 placeholder:text-red-400' : 'border-gray-200 text-gray-600'} mt-1 text-gray-600 h-12 rounded-md px-4 border`}>
                        <option value="" className="text-gray-600">Select option</option>
                        <option value="on_sale" className="text-gray-600">ON SALE</option>
                        <option value="sold" className="text-gray-600">SOLD</option>
                    </select>
                    { errors?.sale_status ? <p className="text-xs text-red-500">{errors.sale_status}</p> : null }
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="features" className="text-sm text-gray-400">Additional features</label>
                    <div className={`${errors?.features ? 'border-red-200 has-[input:focus]:border-red-400' : 'border-gray-200 has-[input:focus]:border-gray-600'} mt-1 min-h-12 flex flex-wrap gap-2 rounded-md p-1 border`}>
                        {
                            features.map((item, index) => (
                                <span key={index} className="h-10 pl-3 pr-2 rounded-sm flex items-center justify-center gap-4 bg-gray-100 text-gray-800 has-[button:hover]:bg-red-100 has-[button:hover]:text-red-600">
                                    <span className="text-sm font-semibold whitespace-nowrap">{item}</span>
                                    <button type="button" onClick={() => removeFeatures(item, index)} className="text-gray-600 hover:text-red-600 flex items-center justify-center">
                                        <MdClose size={16} />
                                    </button>
                                </span>
                            ))
                        }
                        <input onKeyDown={addFeatures} type="text" id="features" name="features" placeholder="Feature" className={`${errors?.features ? 'text-red-600 placeholder:text-red-400' : 'text-gray-600'} h-10 flex-1 min-w-30 px-2 focus:outline-none`} />
                    </div>
                    { errors?.features ? <p className="text-xs text-red-500">{errors.features}</p> : null }
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-400">Location coordinates</span>
                    <div className="flex flex-wrap gap-4">
                        <div className={`${errors.longitude ? 'text-red-500' : 'text-gray-500'} flex-1 flex gap-2`}>
                            <label htmlFor="longitude" className="h-12 flex items-center text-sm font-semibold">Longitude</label>
                            <div className="flex-1 flex flex-col gap-1">
                                <input type="number" step=".001" name="longitude" id="longitude" onChange={handleChange} onKeyDown={handleKeyPress} data-next-field-id="latitude" className={`${errors?.longitude ? 'border-red-200 focus:outline-red-400 text-red-600 placeholder:text-red-400' : 'border-gray-200 text-gray-600'} flex-1 min-h-12 max-h-12 rounded-md px-4 border`} />
                                { errors?.longitude ? <p className="text-xs text-red-500">{errors.longitude}</p> : null }
                            </div>
                        </div>
                        <div className={`${errors.latitude ? 'text-red-500' : 'text-gray-500'} flex-1 flex gap-2`}>
                            <label htmlFor="latitude" className="h-12 flex items-center text-sm font-semibold">Latitude</label>
                            <div className="flex-1 flex flex-col gap-1">
                                <input type="number" step=".001" name="latitude" id="latitude" onChange={handleChange} onKeyDown={handleKeyPress} data-next-field-id="latitude" className={`${errors?.latitude ? 'border-red-200 focus:outline-red-400 text-red-600 placeholder:text-red-400' : 'border-gray-200 text-gray-600'} flex-1 min-h-12 max-h-12 rounded-md px-4 border`} />
                                { errors?.latitude ? <p className="text-xs text-red-500">{errors.latitude}</p> : null }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="images" className="text-sm text-gray-400">Apartment images</label>
                    <div className="flex flex-col gap-1">
                        <input type="file" onChange={addImage} multiple accept="image/*" id="images" name="images" className="hidden" />
                        <label htmlFor="images" className="cursor-pointer hover:bg-blue-100/50 hover:text-blue-600 w-fit h-10 rounded-md px-4 bg-blue-100 text-blue-700 flex gap-2 items-center justify-center">
                            <IoImagesOutline size={20} />
                            <span className="text-sm font-semibold">Choose image from files</span>
                        </label>
                        { errors?.images ? <p className="text-xs text-red-500">{errors.images}</p> : null }
                    </div>
                    <ul className="mt-2 grid lg:grid-cols-3 gap-4">
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
                                    <button onClick={() => removeImage(index, file_name)} type="button" className="hover:text-red-600 flex items-center justify-center">
                                        <MdClose size={16} />
                                    </button>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div className="mt-4 flex items-center justify-end gap-4">
                    <button className="flex items-center justify-center h-12 rounded-md px-8 bg-blue-600 text-white">
                        <span className="font-semibold">Submit details</span>
                    </button>
                </div>
            </form>
        </div>
    )
}