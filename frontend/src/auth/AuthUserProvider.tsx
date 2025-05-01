import { User, onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from "../../firebase";

type AuthContext = {
  user: User | null;
  checkingAuth: boolean;
};

const AuthUserContext = createContext<AuthContext>({
  user: null,
  checkingAuth: true,
});

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("🔥 Firebase auth state changed:", firebaseUser);
      setUser(firebaseUser ?? null);
      setCheckingAuth(false); // ✅ Always flip to false
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthUserContext.Provider value={{ user, checkingAuth }}>
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuth = () => useContext(AuthUserContext);

