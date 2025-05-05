import { useEffect, useState } from "react";
import "./Timer.css";
import { useAuth } from "../auth/AuthUserProvider";
import lockIcon from "../assets/cute_lock.webp";
import timerBackground from "../assets/timerbackground.webp";
import { auth } from "../../firebase";

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
  const [hoursStudied, setHoursStudied]= useState<number | null>(null);
  const [secondsAccumulated, setSecondsAccumulated] = useState<number | null>(null);
  const [initialHours, setInitialHours] = useState<number | null>(null);
  const [isHoursLoaded, setIsHoursLoaded] = useState(false);
  const [hoursLoadedForUid, setHoursLoadedForUid] = useState<string | null>(null);


  //clicking logic
  const handleCatClick = async () => {
    if (!selectedCat) return;
  
    const updatedCat = {
      ...selectedCat,
      happiness: selectedCat.happiness + 1
    };
  
    setSelectedCat(updatedCat);
  
    if (isGuest) {
      // Update guest cat list and sessionStorage
      const updatedCats = cats.map(cat =>
        cat.id === selectedCat.id ? updatedCat : cat
      );
      setCats(updatedCats);
      sessionStorage.setItem("guestCats", JSON.stringify(updatedCats));
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
      const savedUnlocked = sessionStorage.getItem("guestUnlockedCats");
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

  useEffect(() => {
    if (isGuest && hoursStudied !== null) {
      sessionStorage.setItem("guestHoursStudied", hoursStudied.toString());
    }
  }, [hoursStudied, isGuest]);
  
  
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
                // Save to sessionStorage
                const updated = [...unlockedCatIds, randomCat.id];
                setUnlockedCatIds(updated);
                sessionStorage.setItem("guestUnlockedCats", JSON.stringify(updated));
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
          setHoursStudied(prev => (prev ?? 0) + 1 / 3600);
          setSecondsAccumulated(prev => (prev ?? 0) + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime, isBreak]);

  //load in the hours_studied
  useEffect(() => {
    if (checkingAuth || !user) return;
  
    const fetchHours = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`);
        const data = await res.json();
    
        if (user.uid !== auth.currentUser?.uid) {
          console.warn("Fetch race: loaded data doesn't match current user");
          return;
        }
    
        if (typeof data.hours_studied !== "number") {
          console.warn("❌ Backend returned invalid hours_studied");
          return;
        }
    
        setHoursStudied(data.hours_studied);
        setInitialHours(data.hours_studied);  // Track original value
        setSecondsAccumulated(Math.floor(data.hours_studied * 3600));
        setHoursLoadedForUid(user.uid);
        setIsHoursLoaded(true);
      } catch (err) {
        console.error("Failed to fetch initial hours_studied:", err);
      }
    };
    
  
    fetchHours();
  }, [checkingAuth, user?.uid]);

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
        setHoursStudied(prev => (prev ?? 0) + 1 / 3600);
        setSecondsAccumulated(prev => (prev ?? 0) + 1);
      
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
              sessionStorage.setItem("guestUnlockedCats", JSON.stringify(updated));
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
  
  //updates time studied to firestore
  useEffect(() => {
    if (
      !user ||
      checkingAuth ||
      !isHoursLoaded ||
      user.uid !== hoursLoadedForUid
    ) {
      return;
    }
  
    const sendStudyTime = () => {
      if (
        hoursStudied === null ||
        initialHours === null ||
        hoursStudied < initialHours
      ) {
        console.warn("⛔️ Skipping update — study time is lower than backend value");
        return;
      }
      if (
        !user ||
        checkingAuth ||
        hoursStudied === null ||
        secondsAccumulated === null ||
        user.uid !== hoursLoadedForUid ||
        auth.currentUser?.uid !== user.uid
      ) {
        console.warn("⛔️ Skipping update — not ready or UID mismatch");
        return;
      }
  
      const payload = JSON.stringify({
        uid: user.uid,
        hours_studied: hoursStudied,
      });
  
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch((err) =>
        console.error("Failed to update study time on visibility change:", err)
      );
    };
  
    const handleBeforeUnload = () => {
      if (
        hoursStudied === null ||
        initialHours === null ||
        hoursStudied < initialHours
      ) {
        console.warn("⛔️ Skipping update — study time is lower than backend value");
        return;
      }
      if (
        secondsAccumulated === 0 ||
        !auth.currentUser ||
        auth.currentUser.uid !== user.uid
      ) {
        return;
      }
      const calcHours = (secondsAccumulated ?? 0) / 3600;
      if (
        calcHours < (initialHours ?? 0)
      ) {
        console.warn(" Not sending — calculated study time is less than initial backend value");
        return;
      }
      const payload = JSON.stringify({
        uid: user.uid,
        hours_studied: calcHours,
      });
  
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_BASE_URL}/api/users`,
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendStudyTime();
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    user?.uid,
    checkingAuth,
    isHoursLoaded,
    hoursLoadedForUid,
    secondsAccumulated,
    hoursStudied,
  ]);
  

  const toggleIsRunning = () => {
    if (!isRunning) {
      setStartTime(Date.now());
      setTimeLeft(getInitialTime());
    }
    setIsRunning((prev) => !prev);
  };

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
