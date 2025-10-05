import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'employee' or 'employer'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if user is an employer or employee
        try {
          // Check employers collection
          const employerQuery = query(collection(db, "employers"), where("uid", "==", user.uid));
          const employerSnapshot = await getDocs(employerQuery);
          
          if (!employerSnapshot.empty) {
            setUserType('employer');
          } else {
            // Check employees collection
            const employeeQuery = query(collection(db, "employees"), where("uid", "==", user.uid));
            const employeeSnapshot = await getDocs(employeeQuery);
            
            if (!employeeSnapshot.empty) {
              setUserType('employee');
            } else {
              setUserType(null); // User exists in auth but not in our collections
            }
          }
        } catch (error) {
          console.error("Error checking user type:", error);
          setUserType(null);
        }
      } else {
        setUserType(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserType(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    currentUser,
    userType,
    loading,
    signOut,
    isAuthenticated: !!currentUser,
    isEmployer: userType === 'employer',
    isEmployee: userType === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};