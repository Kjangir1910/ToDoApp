import React, { useState } from "react";
//import { auth, db } from "../firebase";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
//import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();



  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setError(""); // Clear error on successful signup
      if (userCredential?.user) navigate("/todolist", { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogin = async () => {
    navigate("/login", { replace: true });
  }

  return (
    <div style={styles.signupContainer}>
      <div style={styles.signupCard}>
        <h1 style={styles.title}>TodoList</h1>
        <h2 style={styles.subtitle}>Sign Up</h2>
        {error && <p style={styles.errorMessage}>{error}</p>}
        <input
          style={styles.inputField}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          style={styles.inputField}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <div style={styles.buttonContainer}>
          <button style={styles.signupButton} onClick={handleSignup}>Sign Up</button>
            <button style={styles.signupButton} onClick={handleLogin}>Login</button>
          {/* <a href="/login" style={styles.loginLink}>Login</a> */}
        </div>
      </div>
    </div>
  );
};

const styles = {
  signupContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f0f0',
    padding: '20px',
  },
  signupCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '2em',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.25em',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#555',
  },
  inputField: {
    width: 'calc(100% - 20px)',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
  },
  signupButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  signupButtonHover: {
    backgroundColor: '#0056b3',
  },
  loginLink: {
    color: '#007bff',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  loginLinkHover: {
    color: '#0056b3',
  },
  errorMessage: {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center',
  },
};

export default Signup;
