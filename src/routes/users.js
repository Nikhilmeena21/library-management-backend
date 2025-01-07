const router = require("express").Router();
const { BookModel } = require("../models/book");
const { UserModel } = require("../models/user");
const bcrypt = require("bcrypt");

const omitPassword = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// GET all users
router.get("/", async (req, res, next) => {
  console.log("GET /v1/users: Called"); // Debugging log
  try {
    const users = await UserModel.find({});
    console.log("GET /v1/users: Users fetched:", users); // Debugging log
    return res.status(200).json({ users: users.map((user) => omitPassword(user.toJSON())) });
  } catch (err) {
    console.error("GET /v1/users: Error:", err); // Debugging log
    next(err);
  }
});

// POST borrow a book
router.post("/borrow", async (req, res, next) => {
  console.log("POST /v1/users/borrow: Called"); // Debugging log
  console.log("POST /v1/users/borrow: Request body:", req.body); // Debugging log
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.borrowedBy.length === book.quantity) {
      return res.status(400).json({ error: "Book is not available" });
    }
    const user = await UserModel.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "You've already borrowed this book" });
    }

    const updatedBook = await BookModel.findByIdAndUpdate(
      book._id,
      { $push: { borrowedBy: user.id } },
      { new: true }
    );

    console.log("POST /v1/users/borrow: Book updated:", updatedBook); // Debugging log

    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    });
  } catch (err) {
    console.error("POST /v1/users/borrow: Error:", err); // Debugging log
    next(err);
  }
});

// POST return a book
router.post("/return", async (req, res, next) => {
  console.log("POST /v1/users/return: Called"); // Debugging log
  console.log("POST /v1/users/return: Request body:", req.body); // Debugging log
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    const user = await UserModel.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "You need to borrow this book first!" });
    }

    const updatedBook = await BookModel.findByIdAndUpdate(
      book._id,
      { $pull: { borrowedBy: user.id } },
      { new: true }
    );

    console.log("POST /v1/users/return: Book updated:", updatedBook); // Debugging log

    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    });
  } catch (err) {
    console.error("POST /v1/users/return: Error:", err); // Debugging log
    next(err);
  }
});

// GET borrowed books (for the logged-in user)
router.get("/borrowed-books", async (req, res, next) => {
  console.log("GET /v1/users/borrowed-books: Called"); // Debugging log
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await BookModel.find({ borrowedBy: req.session.userId });
    console.log("GET /v1/users/borrowed-books: Borrowed books:", result); // Debugging log
    return res.status(200).json({ books: result });
  } catch (err) {
    console.error("GET /v1/users/borrowed-books: Error:", err); // Debugging log
    next(err);
  }
});

// GET user profile (for the logged-in user)
router.get("/profile", async (req, res, next) => {
  console.log("GET /v1/users/profile: Called"); // Debugging log
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await UserModel.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("GET /v1/users/profile: User found:", user); // Debugging log
    return res.status(200).json({ user: omitPassword(user.toJSON()) });
  } catch (err) {
    console.error("GET /v1/users/profile: Error:", err); // Debugging log
    next(err);
  }
});

// POST user login
router.post("/login", async (req, res, next) => {
  console.log("POST /v1/users/login: Called"); // Debugging log
  console.log("POST /v1/users/login: Request body:", req.body); // Debugging log
  try {
    const user = await UserModel.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    console.log("POST /v1/users/login: User ID:", user.id); // Debugging log

    // Set the user ID in the session
    req.session.userId = user.id;

    console.log("POST /v1/users/login: Session after login:", req.session);

    return res.status(200).json({ user: omitPassword(user.toJSON()) });
  } catch (err) {
    console.error("POST /v1/users/login: Error:", err); // Debugging log
    next(err);
  }
});

// GET user logout
router.get("/logout", (req, res) => {
  console.log("GET /v1/users/logout: Called"); // Debugging log
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    console.log("GET /v1/users/logout: Session destroyed"); // Debugging log
    return res.status(200).json({ success: true });
  });
});

module.exports = { router };