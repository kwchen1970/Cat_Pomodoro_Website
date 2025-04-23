import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "../App.css"; // optional

const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      } else {
        setCheckingAuth(false); // ✅ only show login UI if NOT logged in
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`Logged in as: ${user.displayName} (${user.email})`);
      navigate("/home");
    } catch (err) {
      console.error("Login error", err);
    }
  };

  const handleGuestLogin = () => {
    navigate("/home");
  };

  if (checkingAuth) {
    return <div>Loading...</div>; // or a spinner/loading UI
  }

  return (
    <div style={{ textAlign: "center", marginTop: "20vh", fontFamily: "Roboto, sans-serif" }}>
      <h1 style={{ fontSize: "2rem" }}>Welcome to Cat Pomodoro!</h1>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          margin: "10px",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
      <br />
      <button
        onClick={handleGuestLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          marginTop: "10px",
          backgroundColor: "#999",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Continue as Guest
      </button>
    </div>
  );
};

export default Login;
