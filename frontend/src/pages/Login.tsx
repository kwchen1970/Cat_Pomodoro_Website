import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "../App.css"; // optional
import "./Login.css";
import peekingCat from "../assets/crouching.png" ;
import loginBackground from "../assets/login_background.png";

const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!checkingAuth && user) {
        navigate("/home");
      } else {
        setCheckingAuth(false);
      }
    });
  
    return unsubscribe;
  }, [navigate, checkingAuth]);

  const handleGoogleLogin = async () => {
    try {
      localStorage.removeItem("guestUnlockedCats");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const authUser = {
        uid: user.uid,
        name: user.displayName || "No Name",
        username: user.email?.split("@")[0] || `user_${user.uid}`,
        profile_pic: user.photoURL || "", // fallback if no image
        hours_studied: 0, // default starting value
      };
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/auth_create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authUser),
      });

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
    return <div>Loading...</div>;
  }

  return (
    <div
      className="login-background"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="background-overlay" />
      
      <div className="login-content">
        <div className="login-box">
          <h1 className="welcome-text">Welcome to Cat Pomodoro!</h1>
  
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
      </div>
  
      <img src={peekingCat} alt="cat" className="crouching-cat" />
    </div>
  );
  
};

export default Login;
