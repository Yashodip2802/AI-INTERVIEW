import React, { useState, useEffect, useRef } from "react";
import "../auth.form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import gsap from "gsap";

const Login = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const {loading, handleLogin} = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

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
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
          await handleLogin({ email, password });
          navigate("/");
        } catch {
          setErrors({ general: "Login failed. Please check your credentials." });
        }
    }

  return (
    <main>
      <div className="form-container" ref={formRef}>
        <h1>Sign In</h1>

        <form onSubmit={handleSubmit}>
          {errors.general && <p className="error">{errors.general}</p>}
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
              placeholder="Enter password"
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button className="button primary-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

          <p>
          Dont have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
