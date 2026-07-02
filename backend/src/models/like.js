import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only like a book once
likeSchema.index({ user: 1, book: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;
