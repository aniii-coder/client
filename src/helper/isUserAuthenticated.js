import { useEffect, useState } from "react";

export function useAuthCheck(cookieName = "user") {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const cookieValue = getCookie(cookieName);

    if (!cookieValue) {
      setAuthStatus({ isAuthenticated: false, user: null, isLoading: false });
    } else {
      try {
        const decodedValue = decodeURIComponent(cookieValue);
        const userData = JSON.parse(decodedValue);
        
        setAuthStatus({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
        });
      } catch (error) {
        // Fallback if cookie value is a string token instead of JSON string
        setAuthStatus({
          isAuthenticated: true,
          user: cookieValue, 
          isLoading: false,
        });
      }
    }
  }, [cookieName]); 

  return authStatus;
}