import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Get user skills from Firestore
export const getEmployeeSkills = async (userId: string): Promise<string[]> => {
  try {
    const profileRef = doc(db, "employees", userId, "employee data", "profile");
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      throw new Error("Profile not found");
    }

    const data = profileSnap.data();
    return data.skills || [];
  } catch (error) {
    console.error("Error fetching employee skills:", error);
    throw error;
  }
};

// Get user job title from Firestore
export const getEmployeeJobTitle = async (userId: string): Promise<string> => {
  try {
    const profileRef = doc(db, "employees", userId, "employee data", "profile");
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      throw new Error("Profile not found");
    }

    const data = profileSnap.data();
    return data.personalInfo?.jobTitle || "";
  } catch (error) {
    console.error("Error fetching employee job title:", error);
    throw error;
  }
};

// Get user display name from Firestore
export const getEmployeeDisplayName = async (userId: string): Promise<string> => {
  try {
    const profileRef = doc(db, "employees", userId, "employee data", "profile");
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      throw new Error("Profile not found");
    }

    const data = profileSnap.data();
    return data.personalInfo?.displayName || data.personalInfo?.fullName || "";
  } catch (error) {
    console.error("Error fetching employee display name:", error);
    throw error;
  }
};
