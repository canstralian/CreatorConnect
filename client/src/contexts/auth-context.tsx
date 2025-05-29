import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface AuthContextProps {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  isLoading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getToken = () => localStorage.getItem('auth_token');
  const setToken = (token: string) => localStorage.setItem('auth_token', token);
  const removeToken = () => localStorage.removeItem('auth_token');

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        removeToken(); // Remove invalid token
      }
    } catch (error) {
      setUser(null);
      removeToken();
      console.error("Error checking authentication:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await response.json();
      
      // Store token and set user
      setToken(data.token);
      setUser(data.user);
      
      // Invalidate any cached queries that might depend on auth state
      queryClient.invalidateQueries();
      
      toast({
        title: "Welcome back!",
        description: `You're now logged in as ${data.user.displayName}`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const data = await response.json();
      
      // Store token and set user
      setToken(data.token);
      setUser(data.user);
      
      // Invalidate any cached queries that might depend on auth state
      queryClient.invalidateQueries();
      
      toast({
        title: "Account created",
        description: `Welcome to AdultConnect, ${data.user.displayName}!`,
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      removeToken();
      
      // Invalidate any cached queries that might depend on auth state
      queryClient.invalidateQueries();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Could not log out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        checkAuth,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
