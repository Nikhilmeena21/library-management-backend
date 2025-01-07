const express = require("express");
const router = express.Router();
const { BookModel } = require("../models/book"); // Assuming you have a Book model

// GET all books
router.get("/", async (req, res, next) => {
  console.log("GET /v1/books: Called"); // Debugging log
  try {
    const books = await BookModel.find({});
    console.log("GET /v1/books: Books fetched:", books); // Debugging log
    return res.status(200).json({
      books: books.map((book) => ({
        ...book.toJSON(),
        availableQuantity: book.quantity - book.borrowedBy.length,
      })),
    });
  } catch (err) {
    console.error("GET /v1/books: Error:", err); // Debugging log
    next(err);
  }
});

// GET book by ISBN
router.get("/:bookIsbn", async (req, res, next) => {
  console.log(`GET /v1/books/${req.params.bookIsbn}: Called`); // Debugging log
  try {
    const book = await BookModel.findOne({ isbn: req.params.bookIsbn });
    console.log(`GET /v1/books/${req.params.bookIsbn}: Book fetched:`, book); // Debugging log
    if (book == null) {
      return res.status(404).json({ error: "Book not found with the provided ISBN" });
    }
    return res.status(200).json({
      book: {
        ...book.toJSON(),
        availableQuantity: book.quantity - book.borrowedBy.length,
      },
    });
  } catch (err) {
    console.error(`GET /v1/books/${req.params.bookIsbn}: Error:`, err); // Debugging log
    next(err);
  }
});

// POST create a new book
router.post("/", async (req, res, next) => {
  console.log("POST /v1/books: Called"); // Debugging log
  console.log("POST /v1/books: Request body:", req.body); // Debugging log
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn });
    if (book != null) {
      return res.status(400).json({ error: "Book with same ISBN already exists" });
    }

    // Create a new BookModel instance
    const newBook = new BookModel(req.body);

    // Validate the new book
    const validationError = newBook.validateSync();
    if (validationError) {
      console.error("POST /v1/books: Validation error:", validationError); // Debugging log
      return res.status(400).json({ error: validationError.message });
    }

    // Save the new book
    await newBook.save();

    console.log("POST /v1/books: Book created:", newBook); // Debugging log
    return res.status(201).json({ book: newBook }); // 201 Created
  } catch (err) {
    console.error("POST /v1/books: Error:", err); // Debugging log
    next(err);
  }
});

// PATCH update a book by ISBN
router.patch("/:bookIsbn", async (req, res, next) => {
  console.log(`PATCH /v1/books/${req.params.bookIsbn}: Called`); // Debugging log
  console.log(`PATCH /v1/books/${req.params.bookIsbn}: Request body:`, req.body); // Debugging log
  try {
    const { _id, isbn, ...rest } = req.body; // Exclude _id and isbn from update
    const updatedBook = await BookModel.findOneAndUpdate(
      { isbn: req.params.bookIsbn },
      rest,
      { new: true } // Return the updated document
    );

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found with the provided ISBN" });
    }

    console.log(`PATCH /v1/books/${req.params.bookIsbn}: Book updated:`, updatedBook); // Debugging log
    return res.status(200).json({ book: updatedBook });
  } catch (err) {
    console.error(`PATCH /v1/books/${req.params.bookIsbn}: Error:`, err); // Debugging log
    next(err);
  }
});

// DELETE a book by ISBN
router.delete("/:bookIsbn", async (req, res, next) => {
  console.log(`DELETE /v1/books/${req.params.bookIsbn}: Called`); // Debugging log
  try {
    const deletedBook = await BookModel.findOneAndDelete({ isbn: req.params.bookIsbn });

    if (!deletedBook) {
      return res.status(404).json({ error: "Book not found with the provided ISBN" });
    }

    console.log(`DELETE /v1/books/${req.params.bookIsbn}: Book deleted:`, deletedBook); // Debugging log
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`DELETE /v1/books/${req.params.bookIsbn}: Error:`, err); // Debugging log
    next(err);
  }
});

module.exports = { router };