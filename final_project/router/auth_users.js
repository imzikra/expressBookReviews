const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Username is valid if it is a non-empty string and not already taken
  if (!username || typeof username !== "string" || username.trim() === "") {
    return false;
  }
  // Check if username already exists
  const userExists = users.some(user => user.username === username);
  return !userExists;
}

const authenticatedUser = (username, password) => {
  // Check if username and password match any user in the users array
  return users.some(user => user.username === username && user.password === password);
}

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const accessToken = jwt.sign(
      { username: username },
      "access", // Secret key
      { expiresIn: '1h' }
    );

    // Save token in session
    req.session.accessToken = accessToken;
    req.session.username = username;

    return res.status(200).json({ message: "Login successful", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username;

  // Check if user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Check if review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  // Check if user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user's review exists
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "Review by this user not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
