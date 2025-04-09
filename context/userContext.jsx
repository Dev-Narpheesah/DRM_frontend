import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
   

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");
        return savedUser && savedToken ? { user: JSON.parse(savedUser), token: savedToken } : null;
    });

   

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user.user));
            localStorage.setItem("token", user.token);
        } else {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }, [user]);

  

    const login = (userData, token) => {
        setUser({ user: userData, token });
    };

   

    const logout = () => {
        setUser(null);
    };

    

    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1])); 
            return decodedToken.exp * 1000 < Date.now(); 
        } catch (error) {
            return true;
        }
    };

    
    
    useEffect(() => {
        if (user && isTokenExpired(user.token)) {
            logout();
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};