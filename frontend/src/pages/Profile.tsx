import { useState } from "react";
import { useAuth } from "../auth/AuthUserProvider";
import defaultProfile from "../assets/defaultProfile.png";
import "./Profile.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const profilePic = user?.photoURL || defaultProfile;
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="profile-container">
      {/* Sidebar - 25% width */}
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

      {/* Content Panel - 75% width */}
      <div className="profile-right">
        {activeTab === "profile" && (
          <div className="profile-left">
            <img
              src={profilePic}
              alt="Profile"
              className="profile-pic"
            />
            <h1 className="readytext">
              {user ? `Welcome, ${user.displayName}` : "Guest"}
            </h1>
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
