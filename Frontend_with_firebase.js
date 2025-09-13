import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const API_URL = "https://your-backend-url.com"; // <-- Replace with your deployed backend

const FrontEndFirebase = () => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const token = await u.getIdToken();
        setIdToken(token);
        fetchItems(token);
      } else {
        setUser(null);
        setIdToken(null);
        setItems([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Register
  const register = async (email, password) => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      alert("Registration successful!");
    } catch (err) {
      alert(err.message);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert("Login successful!");
    } catch (err) {
      alert(err.message);
    }
  };

  // Logout
  const logout = async () => {
    await firebase.auth().signOut();
    alert("Logged out!");
  };

  // Add item
  const addData = async () => {
    if (!name || !value || !description) {
      alert("Please fill all fields");
      return;
    }

    try {
      await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, value, description }),
      });

      setName("");
      setValue("");
      setDescription("");
      fetchItems(idToken); // Refresh items
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch items for logged-in user
  const fetchItems = async (token) => {
    try {
      const res = await fetch(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    // Auth form
    return (
      <div className="form-container" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input type="email" id="email" placeholder="Email" />
        <input type="password" id="password" placeholder="Password" />
        <button onClick={() => register(document.getElementById("email").value, document.getElementById("password").value)}>
          Register
        </button>
        <button onClick={() => login(document.getElementById("email").value, document.getElementById("password").value)}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={logout} style={{ marginBottom: "20px", padding: "8px 16px", background: "#f44336", color: "white", border: "none", borderRadius: "6px" }}>
        Logout
      </button>

      {/* Add Item Form */}
      <div className="form-container" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Enter value" value={value} onChange={(e) => setValue(e.target.value)} />
        <input type="text" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={addData} style={{ padding: "8px 16px", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px" }}>
          Add Data
        </button>
      </div>

      {/* Items Display */}
      <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {items.map((item) => (
          <div key={item._id} className="data-card" style={{ background: "#fff", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h3>{item.name}</h3>
            <p>Value: {item.value}</p>
            <small>{item.description}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrontEndFirebase;
