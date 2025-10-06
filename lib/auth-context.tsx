import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, Unsubscribe } from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  userType: 'employee' | 'employer';
  // Add other profile fields as needed
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userType: 'employee' | 'employer' | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isEmployer: boolean;
  isEmployee: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'employee' | 'employer' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let profileUnsubscribe: Unsubscribe | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Clean up previous listener
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }
      
      if (user) {
        // Set up real-time listener for user profile
        try {
          // First check if user is an employer
          const employerQuery = query(collection(db, "employers"), where("uid", "==", user.uid));
          const employerSnapshot = await getDocs(employerQuery);
          
          if (!employerSnapshot.empty) {
            // User is an employer - listen to employer document
            const employerDocRef = doc(db, 'employers', user.uid);
            profileUnsubscribe = onSnapshot(
              employerDocRef,
              (doc) => {
                if (doc.exists()) {
                  const data = doc.data();
                  setUserProfile({
                    uid: user.uid,
                    email: user.email || '',
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    userType: 'employer'
                  });
                  setUserType('employer');
                }
              },
              (error) => {
                console.error("Error listening to employer profile:", error);
                setUserProfile(null);
                setUserType(null);
              }
            );
          } else {
            // Check if user is an employee
            const employeeQuery = query(collection(db, "employees"), where("uid", "==", user.uid));
            const employeeSnapshot = await getDocs(employeeQuery);
            
            if (!employeeSnapshot.empty) {
              // User is an employee - listen to employee document
              const employeeDocRef = doc(db, 'employees', user.uid);
              profileUnsubscribe = onSnapshot(
                employeeDocRef,
                (doc) => {
                  if (doc.exists()) {
                    const data = doc.data();
                    setUserProfile({
                      uid: user.uid,
                      email: user.email || '',
                      displayName: data.displayName,
                      photoURL: data.photoURL,
                      firstName: data.firstName,
                      lastName: data.lastName,
                      userType: 'employee'
                    });
                    setUserType('employee');
                  }
                },
                (error) => {
                  console.error("Error listening to employee profile:", error);
                  setUserProfile(null);
                  setUserType(null);
                }
              );
            } else {
              setUserProfile(null);
              setUserType(null);
            }
          }
        } catch (error) {
          console.error("Error setting up profile listener:", error);
          setUserProfile(null);
          setUserType(null);
        }
      } else {
        setUserProfile(null);
        setUserType(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setUserType(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    currentUser,
    userProfile,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};