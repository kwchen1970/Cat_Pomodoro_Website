import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import catGif from "../assets/cat1.gif";
import Buttons from "../components/Start_Button";
import { auth } from "../../firebase";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string | null>(null);
  useEffect(() => {
    const user = auth.currentUser;
    if (user?.displayName) {
      const name = user.displayName.split(" ")[0];
      setFirstName(name);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out");
      navigate("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };
  

  return (
    <div className="home-container">
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        <h2 className="ready-text">Hello{firstName ? `, ${firstName}` : ""}!</h2>
        <h4 className="ready-text">Ready to Focus?</h4>
        <Buttons />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src={catGif} alt="focus animation" className="cat-image" />
      </div>
    </div>
  );
};

export default Home;
