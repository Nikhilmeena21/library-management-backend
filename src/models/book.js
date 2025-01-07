const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  name: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  borrowedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Assuming your User model is named "User"
}, { collection: 'books' }); // Explicitly set collection name to "books"

// ... (rest of your schema definition)

const BookModel = mongoose.model('BookModel', bookSchema); // Model name: BookModel

module.exports = { BookModel }; // Export as BookModel