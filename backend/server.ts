import express from "express";
import cors from "cors";
import {  fetchAllUsers, fetchAllCats, fetchCatsForUser, addCatToUser, 
  addUser,fetchUserById,fetchCatById,createUserIfNotExists} from "./firestoreUtils";
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
app.get("/api/users/:ownerId/cats", async (req, res) => {
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
app.put('/api/cats', (req, res) => {
  const cat = req.body; // assumes this matches your User type
  const id = cat.id;
  
  console.log("Received PUT request to update cat:", cat);
  res.send(`This is a PUT request for cat ${id}`);
});

//update user
app.put('/api/users', (req, res) => {
  const user = req.body; // assumes this matches your User type
  const uid = user.uid;
  
  console.log("Received PUT request to update user:", user);
  res.send(`This is a PUT request for user ${uid}`);
});

//delete a cat from a user
app.delete('/api/user/cats/:id', (req, res) => {
  res.send(`This is a delete request for cats id ${req.params.id}`);
});

//delete a user
app.delete('/api/user/users/:id', (req, res) => {
  res.send(`This is a delete request for user id ${req.params.id}`);
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
//create a user if they don't exist just after logging in


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

