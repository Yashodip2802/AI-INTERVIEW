import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import gsap from "gsap";

const Register = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const {loading, handleRegister} = useAuth()

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await handleRegister({ username: username.trim(), email, password });
      navigate("/");
    } catch {
      setErrors({ general: "Registration failed. Please try again." });
    }
  };

  return (
    <main>
      <div className="form-container" ref={formRef}>
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit}>
          {errors.general && <p className="error">{errors.general}</p>}
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button className="button primary-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
