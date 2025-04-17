import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc
  } from "firebase/firestore";
  import { db } from "./firebase";

// Get all semesters and their courses
export const fetchAllUsers = async (): Promise<{
    name: string;
    id: string;
  }[]> => {
    try {
      const semestersRef = collection(db, "semesters");
      const snapshot = await getDocs(semestersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return [];
    }
  };