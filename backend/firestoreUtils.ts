import { db } from "./firebase"; // backend/firebase.ts using firebase-admin
import { FieldValue } from "firebase-admin/firestore";
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

//Add a new user (doc ID = uid) do it after login so you can set uid to authUser.uid
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
    await ref.update({ id: ref.id }); // manually sets the id field
    return ref.id;
  } catch (err) {
    console.error("Error adding cat:", err);
    return null;
  }
};

//update a cat
export const updateCatById = async (updatedCat: Cat): Promise<void> => {
  try {
    if (!updatedCat.id) throw new Error("Missing cat ID");

    const { id, ...fieldsToUpdate } = updatedCat;
    const catRef = db.collection("cats").doc(id);

    await catRef.update(fieldsToUpdate); // Updates only provided fields

    console.log(`Successfully updated cat with ID: ${id}`);
  } catch (error) {
    console.error("Error updating cat:", error);
    throw error; // So server.ts can handle it
  }
};

//update a user
export const updateUserById = async (updatedUser: User): Promise<void> => {
  try {
    if (!updatedUser.uid) throw new Error("Missing user UID");

    const { uid, ...fieldsToUpdate } = updatedUser;
    const userRef = db.collection("users").doc(uid);

    await userRef.update(fieldsToUpdate); // Updates only the provided fields

    console.log(`Successfully updated user with UID: ${uid}`);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

//adds accessory to cat
export const addAccessoryToCat = async (
  catId: string,
  accessory: string
): Promise<void> => {
  const catRef = db.collection("cats").doc(catId);
  const catSnap = await catRef.get();

  if (!catSnap.exists) {
    throw new Error(`Cat with ID ${catId} not found`);
  }

  const existingAccessories = catSnap.data()?.accessories || [];
  const updatedAccessories = [...existingAccessories, accessory];

  await catRef.update({ accessories: updatedAccessories });
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
