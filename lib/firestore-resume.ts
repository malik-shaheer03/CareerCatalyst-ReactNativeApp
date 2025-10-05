import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

const RESUME_COLLECTION = 'resumes';

// Create Resume
export async function createResume(data: any, userId: string) {
  return await addDoc(collection(db, RESUME_COLLECTION), {
    ...data,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Get All Resumes for User
export async function getAllResumes(userId: string) {
  const q = query(collection(db, RESUME_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get Single Resume by ID
export async function getResumeById(id: string) {
  const docRef = doc(db, RESUME_COLLECTION, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Update Resume
export async function updateResume(id: string, data: any) {
  const docRef = doc(db, RESUME_COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
}

// Delete Resume
export async function deleteResume(id: string) {
  const docRef = doc(db, RESUME_COLLECTION, id);
  await deleteDoc(docRef);
}
