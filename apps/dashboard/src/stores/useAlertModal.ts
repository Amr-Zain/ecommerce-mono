"use client";

import { create } from "zustand";
interface ModalState {
    isOpen: boolean;
    variant: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' 
    title: string | null;
    desc: string | null;
    pending?: boolean
    handleConfirm?: () => Promise<void>;
}

interface ModalStore extends ModalState {
    setIsOpen: (value:boolean)=>void;
    setModel: (values: ModalState)=>void;
    setHandler:(fn:() => Promise<void>)=>void;
    setPending: (value: boolean)=>void;
}


export const useAlertModal = create<ModalStore>((set) => ({
    isOpen: false,
    variant: "default",
    title: null,
    desc: null,
    pending: false,
    handleConfirm: undefined,
    setIsOpen: (value) => set({ isOpen: value }),
    setModel: (values) =>
        set((state) => ({
        ...state,
        ...values,
        })),
    setPending:(pending)=>set({ pending }),
    setHandler: (fn) => set({ handleConfirm: fn }),
}));