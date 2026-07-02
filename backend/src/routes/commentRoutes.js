import express from "express";
import Comment from "../models/comment.js";
import protectRoute from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get comments for a book
router.get("/:bookId", protectRoute, async (req, res) => {
  try {
    const comments = await Comment.find({ book: req.params.bookId })
      .sort({ createdAt: 1 })
      .populate("user", "username profileImage");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a comment to a book
router.post("/:bookId", protectRoute, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = new Comment({
      text,
      user: req.user._id,
      book: req.params.bookId,
    });
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "username profileImage"
    );
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
