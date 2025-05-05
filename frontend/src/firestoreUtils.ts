import { Cat } from "@full-stack/types";
import { AuthUser,User } from "@full-stack/types";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    query, where,
    deleteDoc,
    updateDoc,
    arrayUnion
  } from "firebase/firestore";
  import { db } from "../firebase";

//get all the users
export const fetchAllUsers = async (): Promise<User[]> => {
try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
    uid: doc.data().uid,
    name: doc.data().name,
    username: doc.data().username,
    profile_pic: doc.data().profile_pic,
    hours_studied: doc.data().hours_studied,
    unlocked: doc.data().unlocked,
    }));
} catch (error) {
    console.error("Error fetching users:", error);
    return [];
}
};

//get all the cats
export const fetchAllCats = async (): Promise<Cat[]> => {
  try {
    const catsRef = collection(db, "cats");
    const snapshot = await getDocs(catsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      ownerId: doc.data().ownerId,
      breed: doc.data().breed,
      accessories: doc.data().accessories,
      happiness: doc.data().happiness,
    }));
  } catch (error) {
    console.error("Error fetching cats:", error);
    return [];
  }
};
//get a user
export const fetchUserById = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn(`User with UID ${uid} not found`);
      return null;
    }
    const data = userSnap.data();
    const user: User = {
      uid: uid,
      name: data.name,
      username: data.username,
      profile_pic: data.profile_pic,
      hours_studied: data.hours_studied,
      unlocked: data.unlocked
    };
    return user;
  } catch (error) {
    console.error(`Error fetching user with UID ${uid}:`, error);
    return null;
  }
};
// Get all cats of a user
export const fetchCatsForUser = async (ownerId: string): Promise<Cat[]> => {
    try {
        const catsRef = collection(db, "cats");
        const q = query(catsRef, where("ownerId", "==", ownerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        })) as Cat[];
    } catch (error) {
        console.error(`Error fetching cats for user ${ownerId}:`, error);
        return [];
    }
};
type CatInput = Omit<Cat, "id">;

//add a cat to a user aka add cat to database.
export const addCatToUser = async (
    catData: CatInput // don't include 'id' since Firestore will generate it
  ): Promise<string | null> => {
    try {
      const docRef = await addDoc(collection(db, "cats"), catData);
      await updateDoc(docRef, { id: docRef.id }); // sets the id field equal to docid
      return docRef.id;
    } catch (error) {
      console.error(`Error adding cat for user ${catData.ownerId}:`, error);
      return null;
    }
};
// adds a user. Create or overwrite a user where doc ID == user.uid
export const addUser = async (user: User): Promise<string | null> => {
    try {
      await setDoc(doc(db, "users", user.uid), user); // uses UID as document ID
      return user.uid;
    } catch (error) {
      console.error("Error adding user:", error);
      return null;
    }
}; 

//update a cat
export const updateCat = async (cat: Cat): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "cats", cat.id), {
        name: cat.name,
        breed: cat.breed,
        happiness: cat.happiness,
        accessories: cat.accessories,
        ownerId: cat.ownerId,
      });
      return true;
    } catch (error) {
      console.error(`Error updating cat with ID ${cat.id}:`, error);
      return false;
    }
};

//update a user
export const updateUser = async (user: User): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: user.name,
        username: user.username,
        profile_pic: user.profile_pic,
        hours_studied: user.hours_studied,
      });
      return true;
    } catch (error) {
      console.error(`Error updating user with ID ${user.uid}:`, error);
      return false;
    }
};

//delete a cat aka delete cat from user
export const deleteCatFromUser = async (catId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "cats", catId));
      return true;
    } catch (error) {
      console.error(`Error deleting cat with ID ${catId}:`, error);
      return false;
    }
};

//delete a user
export const deleteUser = async (uid: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "users", uid));
      return true;
    } catch (error) {
      console.error(`Error deleting user with ID ${uid}:`, error);
      return false;
    }
};
// add a acessory to a cat id
export const addAccessoryToCat = async (
  catId: string,
  accessory: string
): Promise<void> => {
  const catRef = doc(db, "cats", catId);
  await updateDoc(catRef, {
    accessories: arrayUnion(accessory)
  });
  console.log(` Added accessory "${accessory}" to cat with ID ${catId}`);
};
//call right after signing in with authentication
export const createUserIfNotExists = async (authUser: AuthUser) => {
  const userRef = doc(db, "users", authUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser: User = {
      uid: authUser.uid ?? "No uid",
      name: authUser.name ?? "No Name",
      username: authUser.email?.split("@")[0] ?? "unknown",
      profile_pic: authUser.profile_pic ?? "",
      hours_studied: 0,
      unlocked: []
    };

    await setDoc(userRef, newUser);
    console.log("New Firestore user created:", authUser.uid);
  } else {
    console.log("Firestore user already exists:", authUser.uid);
  }
};

