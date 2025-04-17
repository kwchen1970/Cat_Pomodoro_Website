import { DocumentReference } from "firebase-admin/firestore";
export type UserData = {
    name: string;
    username: string;
    password: string;
    hours_studied:number;
    cats: DocumentReference<CatData>[];

  };
  
export type CatData = {
  accessories: string[];
  breed: string;
  happiness: number;
  name: string
};