import { useEffect, useState } from "react";
import "./Timer.css";

const Timer = () => {
  const initialTime = 25 * 60; // pomodoro time
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

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
      <div className="timer-left">
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
  
      <div className="timer-right">
        {/* Add a cat or image here later */}
      </div>
    </div>
  );
};

export default Timer;
