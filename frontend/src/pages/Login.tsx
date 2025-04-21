import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "../App.css"; // or remove if not needed

const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`Logged in as: ${user.displayName} (${user.email})`);
      navigate("/home"); // make sure you have this route set up later
    } catch (err) {
      console.error("Login error", err);
    }
  };

  const handleGuestLogin = () => {
    navigate("/home"); // or whatever page you want
  };

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

