import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ConsentStatus = "pending" | "accepted" | "declined";

interface CookieConsentContextType {
  consent: ConsentStatus;
  acceptCookies: () => void;
  declineCookies: () => void;
  resetConsent: () => void;
  hasConsented: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_KEY = "dj-lobo-cookie-consent";

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<ConsentStatus>(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "declined") return stored;
    return "pending";
  });

  const acceptCookies = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
  };

  const declineCookies = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setConsent("declined");
  };

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
    setConsent("pending");
  };

  return (
    <CookieConsentContext.Provider
      value={{ consent, acceptCookies, declineCookies, hasConsented: consent === "accepted" }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
};
