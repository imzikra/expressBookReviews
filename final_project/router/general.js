const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register new user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   new Promise((resolve, reject) => {
    resolve(books);
  })
    .then(data => res.status(200).send(JSON.stringify(data, null, 4)))
    .catch(() => res.status(500).json({ message: "Error retrieving books" }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  })
    .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch(err => res.status(404).json({ message: err }));

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  try {
    // Simulate an HTTP call to self using Axios (for demonstration)
    // const response = await axios.get(`http://localhost:5000/author/${author}`);
    // return res.status(200).send(JSON.stringify(response.data, null, 4));

    // Since books is local, just filter locally
    const booksByAuthor = [];
    Object.keys(books).forEach(isbn => {
      if (books[isbn].author === author) {
        booksByAuthor.push({ isbn, ...books[isbn] });
      }
    });

    if (booksByAuthor.length > 0) {
      return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } else {
      return res.status(404).json({ message: "No books found for the given author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    const booksByTitle = [];
    Object.keys(books).forEach(isbn => {
      if (books[isbn].title === title) {
        booksByTitle.push({ isbn, ...books[isbn] });
      }
    });
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found for the given title");
    }
  })
    .then(data => res.status(200).send(JSON.stringify(data, null, 4)))
    .catch(err => res.status(404).json({ message: err }));
});

module.exports.general = public_users;
