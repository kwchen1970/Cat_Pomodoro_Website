import { useEffect } from "react";
import { useState } from "react";


const Timer = () => {

    const [startTime, setStartTime] = useState(0);
    // const [timerDuration, setTimerDuration] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    const toggleIsRunning = () => {
        setIsRunning((currState) => (!currState));
    }

    return(
        <div>
            <button onClick={toggleIsRunning}>Start/Stop</button>
            <p>{startTime}</p>
            <p>{isRunning}</p>
        </div>
    );
}

export default Timer;