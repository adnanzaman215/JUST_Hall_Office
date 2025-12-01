// src/context/ui-store.tsx
"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

// Define the context type
type UIContextType = {
  isSignupOpen: boolean;
  openSignup: () => void;
  closeSignup: () => void;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

// Create the UI Context
const UIContext = createContext<UIContextType | null>(null);

// UIProvider component
export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openSignup = useCallback(() => setIsSignupOpen(true), []);
  const closeSignup = useCallback(() => setIsSignupOpen(false), []);
  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isSignupOpen || isLoginOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isSignupOpen, isLoginOpen]);

  return (
    <UIContext.Provider value={{ isSignupOpen, openSignup, closeSignup, isLoginOpen, openLogin, closeLogin }}>
      {children}
    </UIContext.Provider>
  );
}

// Custom hook to use the UI context
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIProvider>");
  return ctx;
}
