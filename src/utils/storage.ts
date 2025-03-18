
import { Expense } from "../types/expense";
import { toast } from "sonner";

const STORAGE_KEY = "expense-tracker-data";
const COOKIE_KEY = "expense-tracker-session";
const DB_NAME = "expense-tracker-db";
const DB_VERSION = 1;
const STORE_NAME = "expenses";

/**
 * IndexedDB Operations
 */
const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open database");
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

/**
 * Save expenses to IndexedDB (primary) and localStorage (fallback)
 */
export const saveExpensesToStorage = async (expenses: Expense[]): Promise<void> => {
  try {
    // Try IndexedDB first
    try {
      const db = await initializeDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing data
      store.clear();
      
      // Add all expenses
      expenses.forEach(expense => {
        store.add(expense);
      });
      
      transaction.oncomplete = () => {
        db.close();
      };
    } catch (indexedDBError) {
      console.warn("IndexedDB save failed, using localStorage as fallback:", indexedDBError);
      // Fall back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  } catch (error) {
    console.error("Error saving expenses:", error);
    toast.error("Failed to save your expenses");
  }
};

/**
 * Load expenses from IndexedDB (primary) or localStorage (fallback)
 */
export const loadExpensesFromStorage = async (): Promise<Expense[]> => {
  try {
    // Try IndexedDB first
    try {
      const db = await initializeDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          db.close();
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          db.close();
          resolve([]);
        };
      });
    } catch (indexedDBError) {
      console.warn("IndexedDB load failed, using localStorage as fallback:", indexedDBError);
      // Fall back to localStorage
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    }
  } catch (error) {
    console.error("Error loading expenses:", error);
    toast.error("Failed to load your expenses");
    return [];
  }
};

/**
 * Set cookie with expiry date
 */
export const setCookie = (value: string, days: number): void => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);

  const cookieValue = encodeURIComponent(value) + 
    "; expires=" + expirationDate.toUTCString() + 
    "; path=/; SameSite=Strict";
  
  document.cookie = `${COOKIE_KEY}=${cookieValue}`;
};

/**
 * Get cookie value
 */
export const getCookie = (): string | null => {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(c => c.startsWith(`${COOKIE_KEY}=`));
  
  if (!cookie) return null;
  
  return decodeURIComponent(cookie.split('=')[1]);
};

/**
 * Save last activity timestamp to cookies
 */
export const saveActivityToCookie = (): void => {
  try {
    const timestamp = new Date().toISOString();
    setCookie(timestamp, 30); // Save for 30 days
  } catch (error) {
    console.error("Error saving activity to cookie:", error);
  }
};

/**
 * Format currency number
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date to readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};
