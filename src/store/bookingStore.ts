import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DeliverySpeed = "standard" | "express" | "fast-track";

interface Coordinates {
    lat: number;
    lng: number;
}

interface BookingFormData {
    // Sender
    senderName: string;
    senderPhone: string;
    pickupAddress: string;
    pickupCity: string;
    senderCity: string;
    pickupCoordinates?: Coordinates;

    // Receiver
    receiverName: string;
    receiverPhone: string;
    dropoffAddress: string;
    dropoffCity: string;
    receiverCity: string;
    dropoffCoordinates?: Coordinates;

    // Package
    packageType: string;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    deliverySpeed: DeliverySpeed;
    pickupDate: string;
    pickupTime: string;

    // Calculated
    distance?: number;
    estimatedCost?: number;
}

interface DeliveryFee {
    baseCharge: number;
    distanceCharge: number;
    pickupCharge: number;
    serviceMultiplier: number;
    subtotal: number;
    gst: number;
    total: number;
    estimatedTime: string;
}

interface BookingState {
    step: number;
    formData: BookingFormData;
    deliveryFee: DeliveryFee | null;
    isAutoMode: boolean;

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateFormData: (updates: Partial<BookingFormData>) => void;
    setDeliveryFee: (fee: DeliveryFee | null) => void;
    setAutoMode: (isAuto: boolean) => void;
    resetBooking: () => void;
}

const initialFormData: BookingFormData = {
    senderName: "",
    senderPhone: "",
    pickupAddress: "",
    pickupCity: "",
    senderCity: "",
    receiverName: "",
    receiverPhone: "",
    dropoffAddress: "",
    dropoffCity: "",
    receiverCity: "",
    packageType: "standard",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    deliverySpeed: "standard",
    pickupDate: "",
    pickupTime: "",
};

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            step: 1,
            formData: initialFormData,
            deliveryFee: null,
            isAutoMode: false,

            setStep: (step) => set({ step }),

            nextStep: () => set((state) => ({ step: state.step + 1 })),

            prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

            updateFormData: (updates) =>
                set((state) => ({
                    formData: { ...state.formData, ...updates },
                })),

            setDeliveryFee: (fee) => set({ deliveryFee: fee }),

            setAutoMode: (isAuto) => set({ isAutoMode: isAuto }),

            resetBooking: () => set({
                step: 1,
                formData: initialFormData,
                deliveryFee: null,
                isAutoMode: false
            }),
        }),
        {
            name: 'booking-storage',
        }
    )
);
