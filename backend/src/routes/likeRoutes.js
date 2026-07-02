import express from "express";
import Book from "../models/book.js";
import Like from "../models/like.js";
import protectRoute from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toggle like
router.put("/:bookId", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const userId = req.user._id;
    const existingLike = await Like.findOne({ user: userId, book: book._id });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
    } else {
      // Like
      const newLike = new Like({ user: userId, book: book._id });
      await newLike.save();
    }

    // Return the book with updated likes array
    const bookLikes = await Like.find({ book: book._id });
    const formattedBook = {
      ...book.toObject(),
      likes: bookLikes.map((l) => l.user),
    };
    res.json(formattedBook);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
