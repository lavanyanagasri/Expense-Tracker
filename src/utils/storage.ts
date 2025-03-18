
import { Expense } from "../types/expense";
import { toast } from "@/components/ui/sonner";

const STORAGE_KEY = "expense-tracker-data";
const COOKIE_KEY = "expense-tracker-session";

/**
 * Save expenses to local storage
 */
export const saveExpensesToStorage = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Error saving expenses to local storage:", error);
    toast.error("Failed to save your expenses");
  }
};

/**
 * Load expenses from local storage
 */
export const loadExpensesFromStorage = (): Expense[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Error loading expenses from local storage:", error);
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
