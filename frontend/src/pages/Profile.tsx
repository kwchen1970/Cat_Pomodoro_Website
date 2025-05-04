import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthUserProvider";
import defaultProfile from "../assets/defaultProfile.png";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "./Profile.css";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [fetchedName, setFetchedName] = useState<string | null>(null);
  const [fetchedPhoto, setFetchedPhoto] = useState<string | null>(null);
  const { user, checkingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user?.uid}`);
        const data = await res.json();
        setFetchedName(data.name);
        setFetchedPhoto(data.photoURL);
      } catch (error) {
        console.error("❌ Failed to fetch user data:", error);
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
            Study Sessions
          </li>
        </ul>
      </div>

      <div className="profile-right">
        {activeTab === "profile" && (
          <div className="profile-left">
            <img src={profilePic} alt="Profile" className="profile-pic" />
            <h1 className="readytext">{displayName}</h1>

            {user?.uid && (
              <button className="delete-button" onClick={handleDeleteAccount}>
                Delete My Account
              </button>
            )}
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
