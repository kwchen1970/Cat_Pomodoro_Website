import { useEffect, useState } from "react";
import "./Timer.css";

export type Cat = {
  id: string;
  ownerId: string;
  accessories: string[];
  breed: string;
  happiness: number;
  name: string;
};

const Timer = () => {
  const initialTime = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = initialTime - elapsed;
        setTimeLeft(remaining > 0 ? remaining : 0);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Fetch all cats
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cats`);
        const data = await res.json();
        setCats(data);
      } catch (error) {
        console.error("Failed to fetch cats", error);
      }
    };

    fetchCats();
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (!startTime) return 0;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const progress = Math.min(elapsed / initialTime, 1);
    return progress;
  };

  const toggleIsRunning = () => {
    if (!isRunning) {
      setStartTime(Date.now());
    }
    setIsRunning((prev) => !prev);
  };

  return (
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
      <div className="time-overlay">{formatTime(timeLeft)}</div>
    </div>
    <button className="timer-button" onClick={toggleIsRunning}>
            {isRunning ? "Restart" : "Start"}
        </button>
    </div>
  </div>

  {/* Middle - Big Cat */}
  <div className="timer-cat">
    <img src="/your_cat_image.png" alt="Big Cat" className="big-cat" />
  </div>

  {/* Right - Sidebar */}
  <div className="timer-sidebar">
    <div className="cat-sidebar">
      {cats.map((cat) => (
        <button key={cat.id} className="cat-card">
          {cat.accessories.length > 0 ? (
            <img
              src={`/grey_cream_cat/${cat.accessories[0]}`}
              alt={cat.accessories[0]}
              className="cat-accessory-img"
            />
          ) : (
            <div className="cat-placeholder">{cat.name}</div>
          )}
        </button>
      ))}
    </div>
  </div>
</div>
  );
  
};

export default Timer;
