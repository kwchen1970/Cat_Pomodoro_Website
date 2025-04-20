import express from "express";
import { db } from "./firebase";
import cors from "cors";
import {  fetchAllUsers, fetchAllCats, fetchCatsForUser, addCatToUser, 
  addUser,fetchUserById,fetchCatById,updateCatById,updateUserById,addAccessoryToCat,createUserIfNotExists} from "./firestoreUtils";
import {Cat,AuthUser} from "@full-stack/types";
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

//getting all the users
app.get("/api/users", async (req, res) => {
  try {
    const users = await fetchAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

//getting all the cats
app.get("/api/cats", async (req, res) => {
  try {
    const cats = await fetchAllCats();
    res.status(200).json(cats);
  } catch (error) {
    console.error("Failed to fetch cats:", error);
    res.status(500).json({ error: "Failed to fetch cats" });
  }
});

//adding a cat
app.post("/api/cats", async (req, res) => {
  const cat = req.body; // must include ownerId, name,
  const id = await addCatToUser(cat);
  res.status(id ? 200 : 500).json({ id });
});

// Adding a user
app.post("/api/users", async (req, res) => {
  const user = req.body;
  const uid = await addUser(user); 
  res.status(uid ? 200 : 500).json({ uid });
});

//fetch cats for user
app.get("/api/cats/:ownerId", async (req, res) => {
  const { ownerId } = req.params;

  try {
    const cats = await fetchCatsForUser(ownerId);
    res.status(200).json(cats);
  } catch (error) {
    console.error(`API error fetching cats for user ${ownerId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//update cat
app.put("/api/cats", async (req, res) => {
  const updatedCat: Cat = req.body;

  if (!updatedCat.id) {
    res.status(400).json({ error: "Missing cat ID in request body" });
  }

  try {
    await updateCatById(updatedCat);
    res.status(200).json({ message: `Cat ${updatedCat.id} updated successfully` });
  } catch (error) {
    console.error("Error in PUT /api/cats:", error);
    res.status(500).json({ error: "Failed to update cat" });
  }
});


//update user
app.put("/api/users", async (req, res) => {
  const updatedUser = req.body;

  if (!updatedUser.uid) {
    res.status(400).json({ error: "Missing user UID in request body" });
  }

  try {
    await updateUserById(updatedUser);
    res.status(200).json({ message: `User ${updatedUser.uid} updated successfully` });
  } catch (error) {
    console.error("Error in PUT /api/users:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

//delete a cat from a user
app.delete('/api/cats/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection("cats").doc(id).delete();
    res.status(200).json({ message: `Cat ${id} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting cat ${id}:`, error);
    res.status(500).json({ error: "Failed to delete cat" });
  }
});

//delete a user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection("users").doc(id).delete();
    res.status(200).json({ message: `User ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//fetch a user by id
app.get("/api/users/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await fetchUserById(uid);
    res.status(200).json(user);
  } catch (error) {
    console.error(`API error fetching user ${uid}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//fetch a cat by its own id 
app.get("/api/cats/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const cat = await fetchCatById(id);
    res.status(200).json(cat);
  } catch (error) {
    console.error(`API error fetching cat ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// only add accessory to a cat
app.put("/api/cats/:id/accessories", async (req, res) => {
  const { id } = req.params;
  const { accessory } = req.body;

  if (!accessory) {
    res.status(400).json({ error: "Missing accessory in request body" });
  }

  try {
    await addAccessoryToCat(id, accessory);
    res.status(200).json({ message: `Accessory "${accessory}" added to cat ${id}` });
  } catch (error) {
    const err = error as Error;
    console.error("Error updating cat:", err.message);
    res.status(500).json({ error: "Failed to update cat" });
  }
});
//create a user if they don't exist just after logging in
app.post("/api/users/auth_create", async (req, res) => {
  const authUser: AuthUser = req.body;

  if (!authUser?.uid) {
    res.status(400).json({ error: "Missing authUser UID" });
  }

  try {
    await createUserIfNotExists(authUser);
    res.status(200).json({ message: `User ${authUser.uid} ensured in Firestore.` });
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    res.status(500).json({ error: "Failed to ensure user exists" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

