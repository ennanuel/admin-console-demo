
import { useState, useRef, useMemo } from "react";

import { BiHash, BiSearch } from "react-icons/bi";
import { BsFillGrid3X2GapFill } from "react-icons/bs";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

import APARTMENTS from "./assets/APARTMENTS.json";

import AddApartmentModal from "./components/AddApartmentModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import ApartmentDetailsModal from "./components/ApartmentDetailsModal";
import { IoLogoPolymer } from "react-icons/io";


type Apartment = {
  city: string;
  address: string;
  status: string;
  created_at: string;
}

const LIMIT = 20;

function App() {
  const addApartmentRef = useRef<HTMLDialogElement>(null);
  const removeApartmentRef = useRef<HTMLDialogElement>(null);
  const apartmentDetailsRef = useRef<HTMLDialogElement>(null);

  const [selectedApartments, setSelectedApartments] = useState(0);

  const [page, setPage] = useState(0);
  const start = useMemo(() => page * LIMIT, [page]);
  const canNext = useMemo(() => (start + LIMIT) < APARTMENTS.length,[start]);
  const canPrev = useMemo(() => start > 0, [start]);

  const apartments = useMemo(() => APARTMENTS.slice(start, start + LIMIT), [start]);
  const [apartment, setApartment] = useState<Apartment | null>(null);

  const nextPage = () => canNext && setPage(page + 1);
  const prevPage = () => canPrev && setPage(page - 1);

  const showApartment = (value: Apartment) => {
    setApartment(value);
    showModal(apartmentDetailsRef);
  }

  const hideApartment = () => {
    setApartment(null);
    hideModal(apartmentDetailsRef)
  }

  const showModal = (modalRef: React.RefObject<HTMLDialogElement | null>) => {
    modalRef.current?.show();

    const container = document.querySelector('#body');

    container?.classList?.remove("overflow-auto");
    container?.classList?.add("overflow-hidden");
  };

  const hideModal = (modalRef: React.RefObject<HTMLDialogElement | null>) => {
    modalRef.current?.close();

    const container = document.querySelector('#body');

    container?.classList?.add("overflow-auto");
    container?.classList?.remove("overflow-hidden");
  }

  const selectAll: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if(!event.target) return;
    const selectInputElements = document.getElementsByClassName('select-apartment');
    const checkValue = event.target.checked;
    
    ([...selectInputElements] as HTMLInputElement[]).forEach((element) => {
      element.checked = checkValue;
    });
    
    const selectedApartments = document.querySelectorAll('.select-apartment:checked');
    setSelectedApartments(selectedApartments.length);
  }

  const selectApartment = () => {
    const selectedApartments = document.querySelectorAll('.select-apartment:checked');
    setSelectedApartments(selectedApartments.length);

    const selectAllCheckBox = (document.getElementById('select-all') as HTMLInputElement);
    selectAllCheckBox.checked = selectedApartments.length === apartments.length;
  }
  
  return (
    <div className="bg-gray-100 text-gray-900">
      <ApartmentDetailsModal closeModal={hideApartment} modalRef={apartmentDetailsRef} apartment={apartment} />
      <ConfirmDeleteModal closeModal={() => hideModal(removeApartmentRef)} modalRef={removeApartmentRef} />
      <AddApartmentModal closeModal={() => hideModal(addApartmentRef)} modalRef={addApartmentRef} />
      <header className="sticky top-0 z-10 px-10 bg-white border-b border-gray-200">
        <div className="max-w-[var(--max-width)] mx-auto h-16 flex items-center justify-between gap-4">
          <a href="#!" className="flex items-center gap-2">
            <IoLogoPolymer size={32} />
            <span className="tracking-tight text-2xl font-bold">Logo</span>
          </a>
          <button onClick={() => showModal(addApartmentRef)} className="flex items-center justify-center bg-blue-600 h-10 px-6 rounded-md">
            <span className="font-semibold text-sm text-white">Add apartment / room</span>
          </button>
        </div>
      </header>
      <div className="mt-2 p-10">
        <section className="mx-auto max-w-[var(--max-width)] bg-white border border-gray-200 rounded-xl">
          <div className="px-6 pt-6 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold">Apartments</h2>
            <form action="" className="has-[input:focus]:border-black w-full max-w-[400px] overflow-hidden flex items-center text-gray-600 rounded-md bg-white border border-gray-200">
              <input type="text" className="flex-1 h-10 bg-transparent pl-4 pr-2 placeholder:text-gray-400 outline-none focus:outline-none" placeholder="Search apartment..." />
              <button className="w-10 aspect-square hover:bg-gray-100 flex items-center justify-center bg-transparent">
                <BiSearch size={20} />
              </button>
            </form>
          </div>
          <div className="sticky top-16 mt-2 py-4 px-6 bg-white border-b border-gray-200 flex items-center gap-4">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={prevPage} className={`${canPrev ? '' : 'pointer-events-none opacity-70'} hover:bg-gray-100 text-gray-600 flex gap-1 items-center justify-center border border-gray-200 rounded-md h-8 px-2`}>
                  <FaAnglesLeft size={12} />
                  <span className="text-xs font-semibold">Prev</span>
                </button>
                <div className="flex gap-1 items-center justify-center px-2 h-8 rounded-md border border-gray-200">
                  <span className="font-semibold text-sm text-gray-600">{page + 1}</span>
                  <span>/</span>
                  <span className="font-semibold text-sm text-gray-500">{Math.ceil(APARTMENTS.length / LIMIT)}</span>
                </div>
                <button onClick={nextPage} className={`${canNext ? '' : 'pointer-events-none opacity-70'} hover:bg-gray-100 text-gray-600 flex gap-1 items-center justify-center border border-gray-200 rounded-md h-8 px-2`}>
                  <span className="text-xs font-semibold">Next</span>
                  <FaAnglesRight size={12} />
                </button>
              </div>
            </div>
            <div>
              {
                Boolean(selectedApartments) ?
                  <button onClick={() => showModal(removeApartmentRef)} className="flex items-center justify-center gap-1 px-4 rounded-md h-10 bg-red-100 text-red-600 border border-red-100 hover:border-red-300">
                    <MdDelete size={18} />
                    <span className="font-semibold text-sm">Remove</span>
                  </button> :
                  null
              }
            </div>
          </div>
          <div className="px-6 border-b border-gray-200 grid grid-cols-[40px_60px_3fr_1fr_1fr_40px] items-center gap-2 h-10">
            <span />
            <div className="flex items-center justify-start">
              <BiHash size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold">Name</span>
            </div>
            <div className="flex justify-center">
              <span className="text-sm font-semibold">Status</span>
            </div>
            <div>
              <span className="text-sm font-semibold whitespace-nowrap">Date created</span>
            </div>
            <div className="flex items-center justify-start">
              <input onChange={selectAll} id="select-all" type="checkbox" className="cursor-pointer" />
            </div>
          </div>
          <div>
            <ul className="flex flex-col">
              {
                apartments.map(({ id, city, address, status, created_at }, index) => (
                  <li key={id} className="w-full px-6 grid grid-cols-[40px_60px_3fr_1fr_1fr_40px] items-center gap-2 h-12 border-b last:border-transparent border-gray-200">
                    <div className="">
                      <button className="cursor-[grab_!important] text-gray-400 hover:text-gray-600 flex items-center justify-center">
                        <BsFillGrid3X2GapFill size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-start pl-1">
                      <span className="text-sm font-semibold text-gray-500">
                        {index + 1}.
                      </span>
                    </div>
                    <button onClick={() => showApartment({ city, address, status, created_at })} className="group text-left">
                      <span className="text font-semibold text-blue-500 group-hover:underline">{city}, {address}</span>
                    </button>
                    <div className="flex justify-center">
                      <span className={`w-fit min-w-20 px-2 flex items-center justify-center rounded-sm h-6 ${status === 'on_sale' ? 'bg-yellow-100 text-yellow-500' : 'bg-green-100 text-green-500'}`}>
                        <span className="text-sm font-semibold">{status === "on_sale" ? "On sale" : "Sold"}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{(new Date(created_at)).toLocaleDateString()}</span>
                    </div>
                    <div className="">
                      <input type="checkbox" className="select-apartment cursor-pointer" onChange={selectApartment} />
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
};

export default App
