import { db } from "./firebase"; // backend/firebase.ts using firebase-admin
import { AuthUser,User, Cat } from "@full-stack/types";

// Fetch all users
export const fetchAllUsers = async (): Promise<User[]> => {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map(doc => doc.data() as User);
};

// Fetch all cats
export const fetchAllCats = async (): Promise<Cat[]> => {
  const snapshot = await db.collection("cats").get();
  return snapshot.docs.map(doc => ({
    ...(doc.data() as Omit<Cat, "id">),
    id: doc.id,
  }));
};

//Fetch a user by UID
export const fetchUserById = async (uid: string): Promise<User | null> => {
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) return null;
  
    const data = userSnap.data();
    if (!data) return null;
  
    return {
      uid, 
      name: data.name,
      username: data.username,
      profile_pic: data.profile_pic,
      hours_studied: data.hours_studied,
    };
  };
// Fetch a cat by ID
export const fetchCatById = async (id: string): Promise<Cat | null> => {
    const catSnap = await db.collection("cats").doc(id).get();
    if (!catSnap.exists) return null;
  
    const data = catSnap.data();
    if (!data) return null;
  
    return {
      id, 
      name: data.name,
      ownerId: data.ownerId,
      breed: data.breed,
      accessories: data.accessories,
      happiness: data.happiness,
    };
};

//Fetch cats for a specific user by ownerId
export const fetchCatsForUser = async (ownerId: string): Promise<Cat[]> => {
  const snapshot = await db
    .collection("cats")
    .where("ownerId", "==", ownerId)
    .get();

  return snapshot.docs.map(doc => ({
    ...(doc.data() as Omit<Cat, "id">),
    id: doc.id,
  }));
};

//Add a new user (doc ID = uid)
export const addUser = async (user: User): Promise<string | null> => {
  try {
    await db.collection("users").doc(user.uid).set(user);
    return user.uid;
  } catch (err) {
    console.error("Error adding user:", err);
    return null;
  }
};

// Add a new cat
export const addCatToUser = async (
  cat: Omit<Cat, "id">
): Promise<string | null> => {
  try {
    const ref = await db.collection("cats").add(cat);
    return ref.id;
  } catch (err) {
    console.error("Error adding cat:", err);
    return null;
  }
};

// call after signing in using auth creates a user if it doesn't exist
export const createUserIfNotExists = async (authUser: AuthUser): Promise<void> => {
    const userRef = db.collection("users").doc(authUser.uid);
    const userSnap = await userRef.get();
  
    if (!userSnap.exists) {
      const newUser: User = {
        uid: authUser.uid ?? "No uid",
        name: authUser.name ?? "No Name",
        username: authUser.email?.split("@")[0] ?? "unknown",
        profile_pic: authUser.profile_pic ?? "",
        hours_studied: 0,
      };
  
      await userRef.set(newUser);
      console.log("New Firestore user created:", authUser.uid);
    } else {
      console.log("Firestore user already exists:", authUser.uid);
    }
  };
