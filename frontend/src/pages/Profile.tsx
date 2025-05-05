import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthUserProvider";
import defaultProfile from "../assets/defaultProfile.png";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "./Profile.css";
import {Cat} from "@full-stack/types";
import catBackground from "../assets/cats_backgrond.webp";
import studyBackground from "../assets/classroom_background.webp";
import profileBackground from "../assets/library_background.webp";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [fetchedName, setFetchedName] = useState<string | null>(null);
  const [fetchedPhoto, setFetchedPhoto] = useState<string | null>(null);
  const { user, checkingAuth } = useAuth();
  const navigate = useNavigate();
  const [cats, setCats] = useState<Cat[]>([]);
  const [studyTime, setStudyTime] = useState(0);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        let unlockedIds: string[] = [];
  
        if (user?.uid) {
          // Fetch user object to get `unlocked` cat IDs
          const userRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`);
          const userData = await userRes.json();
          unlockedIds = userData.unlocked || [];
  
        } else {
          //Guest: get from sessionStorage
          unlockedIds = JSON.parse(sessionStorage.getItem("guestUnlockedCats") || "[]");
        }
  
        // Step 2: Fetch all cats and filter to unlocked
        const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cats`);
        const allCats = await catRes.json();
        const filteredCats = allCats.filter((cat: Cat) => unlockedIds.includes(cat.id));
  
        setCats(filteredCats);
      } catch (error) {
        console.error("Failed to fetch cats:", error);
      }
    };
  
    if (!checkingAuth) {
      fetchCats();
    }
  }, [checkingAuth, user]);
  useEffect(() => {
    if (!checkingAuth && user?.uid) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          setStudyTime(data.hours_studied || 0);
        })
        .catch((err) => console.error("Failed to fetch study time", err));
    } else {
      const guestTime = parseFloat(sessionStorage.getItem("guestHoursStudied") || "0");
      setStudyTime(guestTime);
    }
  }, [checkingAuth, user]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user?.uid}`);
        const data = await res.json();
        setFetchedName(data.name);
        setFetchedPhoto(data.photoURL);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if (!checkingAuth && user?.uid) {
      fetchUserProfile();
    }
  }, [checkingAuth, user]);

  const handleDeleteAccount = async () => {
    if (!user?.uid) return;
  
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmDelete) return;
  
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`, {
        method: "DELETE",
      });
      await auth.signOut();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };
  

  const profilePic = user?.uid
    ? fetchedPhoto ?? user?.photoURL ?? defaultProfile
    : defaultProfile;
  const displayName = fetchedName || user?.displayName || "Guest";

  const formatStudyTime = (hours: number) => {
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };
  
const tabStyles: Record<string, React.CSSProperties> = {
  cats: {
    backgroundImage: `linear-gradient(rgba(255, 248, 225, 0.7), rgba(255, 248, 225, 0.7)), url(${catBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  study: {
    backgroundImage: `linear-gradient(rgba(235, 250, 255, 0.7), rgba(235, 250, 255, 0.7)), url(${studyBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  profile: {
    backgroundImage: `linear-gradient(to bottom,rgba(255, 240, 245, 0.98), rgba(255, 240, 245, 0.8)), url(${profileBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
};

  return (
    <div className="profile-container">
      <div className="sidebar">
        <ul className="menu-list">
          <li className={`menu-item ${activeTab === "profile" ? "active-tab" : ""}`} onClick={() => setActiveTab("profile")}>
            Profile
          </li>
          <li className={`menu-item ${activeTab === "cats" ? "active-tab" : ""}`} onClick={() => setActiveTab("cats")}>
            Cats
          </li>
          <li className={`menu-item ${activeTab === "study" ? "active-tab" : ""}`} onClick={() => setActiveTab("study")}>
            Study Time
          </li>
        </ul>
      </div>

      <div
        className="profile-right"
          style={tabStyles[activeTab] ?? {}}
      >
        {activeTab === "profile" && (
          <div className="profile-left">
            <img src={profilePic} alt="Profile" className="profile-pic" />
            <h1 className="readytext">{displayName}</h1>
              <p className="email-text">Email: {user?.email}</p>
              <p className="uid-text">UID: {user?.uid}</p>

            {user?.uid && (
              <button className="delete-button" onClick={handleDeleteAccount}>
                Delete My Account
              </button>
            )}
          </div>
        )}
         {activeTab === "cats" && (
            <div className="cats-foreground">
              <h2 className="readytext">Cats</h2>
              <div className="cat-grid_profile">
                {cats.length === 0 ? (
                  <p>No cats found.</p>
                ) : (
                  cats.map((cat) => (
                    <div key={cat.id} className="cat-card_profile">
                      <img
                        src={`/grey_cream_cat/${cat.accessories[0]}`}
                        alt={cat.accessories[0]}
                        className="cat-image_profile"
                      />
                      <p className="cat-name_profile">{cat.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === "study" && (
            <div className="study-section">
              <h2 className="readytext">Total Study Time</h2>
              <div className="study-info-box">
                <p className="study-time-value">{formatStudyTime(studyTime)}</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ProfilePage;
