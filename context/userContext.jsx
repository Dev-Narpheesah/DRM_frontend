// import { createContext, useState, useEffect } from "react";

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem("user");
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   const API_URL =
//     window.location.hostname === "localhost" ||
//     window.location.hostname === "127.0.0.1"
//       ? "http://localhost:4000"
//       : "https://drm-backend.vercel.app";

//   // Save user data to localStorage
//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("user");
//     }
//   }, [user]);

//   // Check authentication status on mount
//   // useEffect(() => {
//   //   const checkAuth = async () => {
//   //     try {
//   //       const response = await fetch(`${API_URL}/api/user/me`, {
//   //         method: "GET",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         credentials: "include",
//   //       });

//   //       if (response.ok) {
//   //         const userData = await response.json();
//   //         // Validate userData
//   //         if (userData.email && typeof userData.isAdmin === "boolean") {
//   //           setUser(userData);
//   //         } else {
//   //           console.error("Invalid user data from /api/user/me:", userData);
//   //           setUser(null);
//   //         }
//   //       } else {
//   //         setUser(null);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error checking auth:", error);
//   //       setUser(null);
//   //     }
//   //   };

//   //   checkAuth();
//   // }, []);

//   // // Login function with validation
//   // const login = (userData) => {
//   //   if (!userData || !userData.email || typeof userData.isAdmin !== "boolean") {
//   //     console.error("Invalid user data for login:", userData);
//   //     return;
//   //   }
//   //   setUser(userData);
//   // };

//   // Logout function
//   const logout = async () => {
//     try {
//       await fetch(`${API_URL}/api/user/logout`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       });
//       setUser(null);
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   return (
//     <UserContext.Provider value={{ user,  logout ,  setUser}}>
//       {children}
//     </UserContext.Provider>
//   );
// };


import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // Login/Registration handler
  const loginUser = (userData) => {
    // store _id as id
    setUser({
      id: userData._id,
      username: userData.username,
      email: userData.email,
      token: userData.token,
    });
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, setUser: loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
