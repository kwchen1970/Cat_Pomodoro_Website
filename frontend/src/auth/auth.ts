import { auth } from "../../firebase";
import {AuthUser} from "../../../lib/types";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();

//does the google sign in
export const signIn = async (): Promise<AuthUser | null> => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken ?? null;
      const user = result.user;
  
      return {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        profile_pic: user.photoURL,
        token,
      };
    } catch (err: any) {
      const code = err.code;
      const message = err.message;
      const email = err.customData?.email;
  
      console.error(
        `An error ${code} occurred when logging in user with email: ${email} — ${message}`
      );
      return null;
    }
  };

export const signOut = async () => {
  await auth.signOut();
};