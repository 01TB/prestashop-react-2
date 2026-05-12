/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { listCustomers } from '../../resources/customers/customers.service';
import { createGuest } from '../../resources/guests/guests.service';
import type { CustomerOutput } from '../../resources/customers/customers.types';
import { setStoredGuestId } from './cartService';

interface FrontofficeAuthContextType {
  isAuthenticated: boolean;
  customer: CustomerOutput | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = 'frontofficeCustomer';

const loadStoredCustomer = (): CustomerOutput | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerOutput;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const getDefaultAcceptLanguage = (): string => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.toLowerCase();
  }
  return 'fr-fr';
};

const FrontofficeAuthContext = createContext<FrontofficeAuthContextType | undefined>(undefined);

export const FrontofficeAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerOutput | null>(() => loadStoredCustomer());
  const isAuthenticated = Boolean(customer);

  const login = async (email: string): Promise<boolean> => {
    const normalized = email.trim();
    if (!normalized) return false;

    try {
      const customers = await listCustomers({
        'filter[email]': `[${normalized}]`,
      });
      const found = customers[0] ?? null;
      if (!found) return false;

      setCustomer(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      try {
        const guestId = await createGuest({
          id_customer: found.id,
          javascript: true,
          accept_language: getDefaultAcceptLanguage(),
        });
        setStoredGuestId(guestId);
      } catch {
        // Ne bloque pas la connexion si la creation du guest echoue.
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FrontofficeAuthContext.Provider value={{ isAuthenticated, customer, login, logout }}>
      {children}
    </FrontofficeAuthContext.Provider>
  );
};

export const useFrontofficeAuth = () => {
  const context = useContext(FrontofficeAuthContext);
  if (!context) throw new Error('useFrontofficeAuth doit etre utilise dans un FrontofficeAuthProvider');
  return context;
};
