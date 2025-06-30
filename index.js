const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "../public")));

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin@123", // Your MySQL password
  database: "ecommerce"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to DB");
});

// Get all products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Register a new user
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "User already registered" });
      }
      console.error("DB error:", err);
      return res.status(500).json({ message: "Something went wrong" });
    }

    res.json({ success: true, message: "Registration successful" });
  });
});


app.post("/login", (req, res) => {
  let { email, password } = req.body;

  // Trim inputs to avoid trailing/leading whitespace issues
  email = email.trim();
  password = password.trim();

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    // User not found
    if (result.length === 0) {
      return res.status(404).json({ message: "User not registered" });
    }

    // Password mismatch
    if (result[0].password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Successful login
    res.json({
      message: "Login successful",
      userId: result[0].id,
      name: result[0].name
    });
  });
});




// Start server
app.listen(3000, () => console.log("Server started on port 3000"));
