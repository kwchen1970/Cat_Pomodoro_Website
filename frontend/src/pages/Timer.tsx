import { useEffect, useState } from "react";
import "./Timer.css";
import { useAuth } from "../auth/AuthUserProvider";
import lockIcon from "../assets/cute_lock.png";
import timerBackground from "../assets/timerbackground.png";

export type Cat = {
  id: string;
  ownerId: string;
  accessories: string[];
  breed: string;
  happiness: number;
  name: string;
};

const Timer = () => {
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const { user,checkingAuth } = useAuth();
  const isGuest = !user;
  const getInitialTime = () => (isBreak ? 5 * 60 : 25 * 60);
  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [unlockedCatIds, setUnlockedCatIds] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [heartAnimating, setHeartAnimating] = useState(false);
  //clicking logic
  const handleCatClick = async () => {
    if (!selectedCat) return;
  
    const updatedCat = {
      ...selectedCat,
      happiness: selectedCat.happiness + 1
    };
  
    setSelectedCat(updatedCat);
  
    if (isGuest) {
      // Update guest cat list and localStorage
      const updatedCats = cats.map(cat =>
        cat.id === selectedCat.id ? updatedCat : cat
      );
      setCats(updatedCats);
      localStorage.setItem("guestCats", JSON.stringify(updatedCats));
    } else {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cats`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCat),
        });
  
        setCats(prev =>
          prev.map(cat => (cat.id === selectedCat.id ? updatedCat : cat))
        );
      } catch (err) {
        console.error("Failed to update cat happiness:", err);
      }
    }
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 400); 
  };
  // Guest logic
  useEffect(() => {
    if (isGuest && cats.length > 0) {
      const savedUnlocked = localStorage.getItem("guestUnlockedCats");
      if (savedUnlocked) {
        try {
          const parsed = JSON.parse(savedUnlocked);
          if (Array.isArray(parsed)) {
            setUnlockedCatIds(parsed);
          }
        } catch (e) {
          console.error("Failed to parse guestUnlockedCats:", e);
        }
      }
    }
  }, [isGuest, cats]);  // Wait for cats to be loaded
  
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const sessionLength = getInitialTime(); 
        const remaining = sessionLength - elapsed;
        if (remaining <= 0) {
          setTimeLeft(0);
          setIsRunning(false); 
          const nextBreakState = !isBreak;
          setIsBreak(nextBreakState);
          setTimeLeft(nextBreakState ? 5 * 60 : 25 * 60);


          //cat logic 
          if (!isBreak && cats.length > 0) {
            const lockedCats = cats.filter(
              (cat) => !unlockedCatIds.includes(cat.id)
            );
          
            if (lockedCats.length > 0) {
              const randomCat =
                lockedCats[Math.floor(Math.random() * lockedCats.length)];
          
              if (isGuest) {
                // Save to localStorage
                const updated = [...unlockedCatIds, randomCat.id];
                setUnlockedCatIds(updated);
                localStorage.setItem("guestUnlockedCats", JSON.stringify(updated));
              } else {
                //Normal user logic
                fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}/unlocked`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ catId: randomCat.id, action: "add" }),
                })
                  .then((res) => res.json())
                  .then(() => {
                    setUnlockedCatIds((prev) => [...prev, randomCat.id]);
                  })
                  .catch((err) => console.error("Failed to unlock cat:", err));
              }
            }
          }
          
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime, isBreak]);

// 1. Fetch user data and unlocked cat IDs
useEffect(() => {
  if (checkingAuth || !user) return;

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`);
      const data = await res.json();
      setUnlockedCatIds(data.unlocked || []);
    } catch (err) {
      console.error("Error fetching user data", err);
    }
  };

  fetchUserData();
}, [checkingAuth, user]);


// 2. Fetch all cats
useEffect(() => {
  const fetchCats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cats`);
      const data = await res.json();
      setCats(data);
    } catch (err) {
      console.error("Failed to fetch cats", err);
    }
  };

  fetchCats();
  }, []);

  //Demo shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") {
        console.log("Demo key pressed");
      
        // Simulate the end of a session
        setTimeLeft(0);
        setIsRunning(false);
      
        const nextBreakState = !isBreak;
        setIsBreak(nextBreakState);
        setTimeLeft(nextBreakState ? 5 * 60 : 25 * 60);
      
        // Cat unlock logic (if just finished work session)
        if (!isBreak && cats.length > 0) {
          const lockedCats = cats.filter(cat => !unlockedCatIds.includes(cat.id));
      
          if (lockedCats.length > 0) {
            const randomCat = lockedCats[Math.floor(Math.random() * lockedCats.length)];
      
            if (!user) {
              const updated = [...unlockedCatIds, randomCat.id];
              setUnlockedCatIds(updated);
              localStorage.setItem("guestUnlockedCats", JSON.stringify(updated));
              console.log("Unlocked cat via demo key (guest):", randomCat.id);
            } else {
              fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}/unlocked`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ catId: randomCat.id, action: "add" }),
              })
                .then((res) => res.json())
                .then(() => {
                  setUnlockedCatIds((prev) => [...prev, randomCat.id]);
                  console.log("Unlocked cat via demo key (user):", randomCat.id);
                })
                .catch((err) => console.error("Failed to unlock cat:", err));
            }
          }
        }
      }
    };
  
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isBreak, user, cats, unlockedCatIds]);
  

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (!startTime) return 0;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const progress = Math.min(elapsed / getInitialTime(), 1);
    return progress;
  };

  const toggleIsRunning = () => {
    if (!isRunning) {
      setStartTime(Date.now());
      setTimeLeft(getInitialTime());
    }
    setIsRunning((prev) => !prev);
  };

return (
    <div
      className="timer-background"
      style={{
        backgroundImage: `url(${timerBackground})`,
      }}
    >
      <div className="background-overlay" />
  
      <div className="timer-content-wrapper">
        <div className="timer-page">
          {/* Left - Timer */}
          <div className="timer-left">
            <div className="timer-center">
              <div className="circle-wrapper">
                <svg className="progress-ring" width="300" height="300">
                  <circle className="ring-bg" cx="150" cy="150" r="130" />
                  <circle
                    className="ring-progress"
                    cx="150"
                    cy="150"
                    r="130"
                    strokeDasharray="816.8"
                    strokeDashoffset={816.8 * (1 - getProgress())}
                  />
                </svg>
                <div className="timer-circle-background" />
                <div className="time-overlay">{formatTime(timeLeft)}</div>
              </div>
              <button className="timer-button" onClick={toggleIsRunning}>
                {isRunning ? "Restart" : "Start"}
              </button>
            </div>
          </div>
  
              {/* Middle - Big Cat */}
              <div className="timer-cat">
                {selectedCat && (
                  <div className="big-cat-wrapper">
                    <div className={`cat-happiness ${heartAnimating ? "heart-bounce" : ""}`}>
                      ❤️ {selectedCat.happiness}
                    </div>
                    {selectedCat.accessories.length > 0 && (
                      <img
                        src={`/grey_cream_cat/${selectedCat.accessories[0]}`}
                        alt={selectedCat.accessories[0]}
                        className="cat-accessory-img"
                        onClick={handleCatClick}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </div>
                )}
              </div>

  
          {/* Right - Sidebar */}
          <div className="timer-sidebar">
            <div className="cat-sidebar">
              {cats.map((cat) => {
                const isUnlocked = unlockedCatIds.includes(cat.id);
  
                return (
                  <button
                    key={cat.id}
                    className={`cat-card ${!isUnlocked ? "locked" : ""}`}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && setSelectedCat(cat)}
                  >
                    <div className="cat-card-inner">
                      {cat.accessories.length > 0 ? (
                        <img
                          src={`/grey_cream_cat/${cat.accessories[0]}`}
                          alt={cat.accessories[0]}
                          className="cat-accessory-img"
                        />
                      ) : (
                        <div className="cat-placeholder">{cat.name}</div>
                      )}

                      {/* Show name below the image */}
                      <div className="cat-name-label">{cat.name}</div>

                      {!isUnlocked && (
                        <div className="lock-overlay">
                          <img src={lockIcon} alt="Locked" className="lock-icon" />
                        </div>
                      )}
                    </div>

                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default Timer;
