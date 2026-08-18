"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import BookingFlow from "./BookingFlow";
import { trackEvent } from "@/lib/analytics";

interface BookingContextValue {
  isOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

export default function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openBooking = useCallback(() => {
    setIsOpen(true);
    trackEvent("booking_started");
  }, []);

  const closeBooking = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, openBooking, closeBooking }), [isOpen, openBooking, closeBooking]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingFlow isOpen={isOpen} onClose={closeBooking} />
    </BookingContext.Provider>
  );
}
