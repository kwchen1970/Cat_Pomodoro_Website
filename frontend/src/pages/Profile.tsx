import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthUserProvider";
import defaultProfile from "../assets/defaultProfile.png";
import "./Profile.css";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [fetchedName, setFetchedName] = useState<string | null>(null);
  const [fetchedPhoto, setFetchedPhoto] = useState<string | null>(null);
  const { user,checkingAuth } = useAuth();
  useEffect(() => {
    console.log("🧪 useEffect running");
    console.log("🔍 checkingAuth:", checkingAuth);
    console.log("🔍 user:", user);
  
    const fetchUserProfile = async () => {
      try {
        console.log("📡 Fetching user profile for UID:", user?.uid);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user?.uid}`);
        const data = await res.json();
        console.log("✅ Data from backend:", data);
        setFetchedName(data.name);
        setFetchedPhoto(data.photoURL);
      } catch (error) {
        console.error("❌ Failed to fetch user data:", error);
      }
    };
  
    if (!checkingAuth) {
      if (user?.uid) {
        fetchUserProfile();
      } else {
        console.log("👻 No user logged in — showing guest profile.");
      }
    }
  }, [checkingAuth, user]);
  

  const profilePic: string = user?.uid
  ? fetchedPhoto ?? user?.photoURL ?? defaultProfile
  : defaultProfile;
  const displayName = fetchedName || user?.displayName || "Guest";

  return (
    <div className="profile-container">
      <div className="sidebar">
        <ul className="menu-list">
          <li
            className={`menu-item ${activeTab === "profile" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </li>
          <li
            className={`menu-item ${activeTab === "cats" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("cats")}
          >
            Cats
          </li>
          <li
            className={`menu-item ${activeTab === "study" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("study")}
          >
            Study Sessions
          </li>
        </ul>
      </div>

      <div className="profile-right">
        {activeTab === "profile" && (
          <div className="profile-left">
            <img src={profilePic} alt="Profile" className="profile-pic" />
            <h1 className="readytext">{displayName}</h1>
          </div>
        )}

        {activeTab === "cats" && (
          <div>
            <h2 className="readytext">Cats</h2>
            <p>Show cat-related data here.</p>
          </div>
        )}

        {activeTab === "study" && (
          <div>
            <h2 className="readytext">Study Sessions</h2>
            <p>Show study sessions here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
