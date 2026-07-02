import express from "express";
import { prisma } from "../index.js";
import protectRoute from "../middlewares/auth.middleware.js";
import crypto from "crypto";

const router = express.Router();

// Get comments using raw SQL
router.get("/:bookId", protectRoute, async (req, res) => {
  try {
    const comments = await prisma.$queryRawUnsafe(
      `SELECT c.*, u.id as user_id, u.username as user_username, u.profileImage as user_profileImage
       FROM "Comment" c
       JOIN "User" u ON c.userId = u.id
       WHERE c.bookId = ?
       ORDER BY c.createdAt ASC`,
      req.params.bookId
    );

    const formattedComments = comments.map(c => ({
      id: c.id,
      _id: c.id,
      text: c.text,
      userId: c.userId,
      bookId: c.bookId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: {
        id: c.user_id,
        _id: c.user_id,
        username: c.user_username,
        profileImage: c.user_profileImage
      }
    }));

    res.json(formattedComments);
  } catch (error) {
    console.log("Error fetching comments", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add comment using raw SQL
router.post("/:bookId", protectRoute, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const commentId = crypto.randomUUID();
    const createdAt = new Date();
    const updatedAt = createdAt;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Comment" (id, text, userId, bookId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
      commentId, text, req.user.id, req.params.bookId, createdAt, updatedAt
    );

    const commentRows = await prisma.$queryRawUnsafe(
      `SELECT c.*, u.id as user_id, u.username as user_username, u.profileImage as user_profileImage
       FROM "Comment" c
       JOIN "User" u ON c.userId = u.id
       WHERE c.id = ?`,
      commentId
    );
    const comment = commentRows[0];

    res.status(201).json({
      id: comment.id,
      _id: comment.id,
      text: comment.text,
      userId: comment.userId,
      bookId: comment.bookId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user_id,
        _id: comment.user_id,
        username: comment.user_username,
        profileImage: comment.user_profileImage
      }
    });
  } catch (error) {
    console.log("Error adding comment", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
