
import React, { createContext, useState, useEffect, useContext } from 'react';
import { setCookie, getCookie } from '@/utils/storage';

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "expense-tracker-users";
const CURRENT_USER_KEY = "expense-tracker-current-user";
const AUTH_COOKIE_KEY = "expense-tracker-auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage and cookie
    const loadUser = () => {
      setIsLoading(true);
      try {
        // Check for auth cookie first
        const authCookie = getCookie();
        if (!authCookie) {
          setIsLoading(false);
          return;
        }
        
        // Get current user from localStorage
        const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
        if (!currentUserId) {
          setIsLoading(false);
          return;
        }
        
        // Get users from localStorage
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        const users = usersJson ? JSON.parse(usersJson) : [];
        
        const foundUser = users.find((u: User) => u.id === currentUserId);
        if (foundUser) {
          setUser(foundUser);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login user
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Simple check - in a real app you'd need to hash passwords
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (foundUser) {
        // Create a cleaned version of the user without the password
        const userWithoutPassword = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name
        };
        
        setUser(userWithoutPassword);
        localStorage.setItem(CURRENT_USER_KEY, foundUser.id);
        setCookie(JSON.stringify({ userId: foundUser.id }), 7); // 7 days
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Signup user
  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Check if user already exists
      const userExists = users.some((u: any) => u.email === email);
      
      if (userExists) {
        return false;
      }
      
      // Create new user
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // In a real app, this should be hashed!
        name
      };
      
      // Save to localStorage
      const updatedUsers = [...users, newUser];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      // Log user in automatically
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      };
      
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, newUser.id);
      setCookie(JSON.stringify({ userId: newUser.id }), 7); // 7 days
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    document.cookie = `${AUTH_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
