import { useNavigate } from "react-router-dom";

const Buttons = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/timer"); // 👈 this redirects to Timer.tsx
  };

  return (
    <button
      onClick={handleStart}
      style={{
        padding: "12px 24px",
        fontSize: "16px",
        backgroundColor: "#4caf50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Start Timer
    </button>
  );
};

export default Buttons;
