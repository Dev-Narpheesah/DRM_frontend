import React, { useState } from "react";
import PropTypes from "prop-types"; // For prop validation
import "./passwordInput.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const PasswordInput = ({
  placeholder,
  value,
  onChange,
  name,
  onPaste,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="passwordInput">
      <div className="passwordInput__wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          required
          name={name}
          value={value} // Add value prop
          onChange={onChange}
          onPaste={onPaste}
          className={`passwordInput__input ${error ? "passwordInput__input--error" : ""}`}
        />
        <div
          className="passwordInput__icon"
          onClick={togglePassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
          role="button"
          tabIndex={0}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </div>
      </div>
      {error && <p className="passwordInput__error">{error}</p>}
    </div>
  );
};

// Prop validation
PasswordInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  onPaste: PropTypes.func,
  error: PropTypes.string,
};

export default PasswordInput;