// Shared types across both frontend and backend!
export type User = {
    uid:string;
    name: string;
    username: string;
    profile_pic: string;
    hours_studied:number;
  };
  
export type Cat = {
  id:string;    //  comes from doc.id
  ownerId:string;
  accessories: string[];
  breed: string;
  happiness: number;
  name: string
};
export type AuthUser = {
    uid: string;
    name: string | null;
    email: string | null;
    profile_pic: string | null;
    token: string | null;
  };