import React from "react";
import "./Emergency.css";

const Emergency = () => {
  const emergencies = [
    { type: "Fire", icon: "🔥", number: "911" },
    { type: "Flood", icon: "🌊", number: "912" },
    { type: "Tornado", icon: "🌪️", number: "913" },
    { type: "Hurricane", icon: "🌀", number: "914" },
  ];

  // Function to handle the emergency call
  const handleEmergencyCall = (number) => {
    const confirmCall = window.confirm(`Are you sure you want to call ${number}?`);
    if (confirmCall) {
      window.location.href = `tel:${number}`;
    }
  };

  return (
    <div className="emergency-page">
      {/* Header */}
      <header className="header">
        <h1>Emergency Services 🚨</h1>
        <p>Call the numbers below for immediate assistance.</p>
      </header>

      {/* Emergency Cards */}
      <div className="emergency-grid">
        {emergencies.map((emergency, index) => (
          <div key={index} className={`emergency-card ${emergency.type.toLowerCase()}`}>
            <div className="icon">{emergency.icon}</div>
            <h2>{emergency.type}</h2>
            {/* Clickable phone number with confirmation */}
            <p className="number" onClick={() => handleEmergencyCall(emergency.number)}>
              {emergency.number}
            </p>
            <p className="description">
              In case of {emergency.type.toLowerCase()}, dial {emergency.number} for help.
            </p>
          </div>
        ))}
      </div>

      {/* Footer
      <footer className="footer">
        <p>Stay safe! For non-emergencies, contact local authorities.</p>
      </footer> */}
    </div>
  );
};

export default Emergency;