
// import path from "path";
// import express, { Express } from "express";
// import cors from "cors";
// import { UserData } from "../common/types";
// import fetch from "node-fetch";

// const app: Express = express();

// const hostname = "0.0.0.0";
// const port = 8080;

// app.use(cors());
// app.use(express.json());

// type UserData = {
//     latitude: number;
//     longitude: number;
//     timezone: string;
//     timezone_abbreviation: string;
//     current: {
//         time: string;
//         interval: number;
//         precipitation: number;
//     };
// };

// app.listen(port, hostname, () => {
//     console.log("Listening");
// });
import express, { Express } from "express";
import cors from "cors";

const app: Express = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.get("/api/", (req, res) => {
  res.send("hello world!");
});

app.post("/api/", async (req, res) => {
  const key = req.body.key;
  console.log(key);
  // Do something with the key
  res.json({ message: "Hello, world!" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
