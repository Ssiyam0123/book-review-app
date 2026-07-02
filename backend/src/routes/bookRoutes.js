import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/book.js";
import Like from "../models/like.js";
import Comment from "../models/comment.js";
import protectRoute from "../middlewares/auth.middleware.js";
import multer from "multer";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", protectRoute, upload.single("image"), async (req, res) => {
  try {
    const { title, caption, rating, details } = req.body;
    const file = req.file;

    if (!file || !title || !caption || !rating || !details) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    if (process.env.CLOUDINARY_CLOUD_NAME === "dummy" || !process.env.CLOUDINARY_CLOUD_NAME) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const newBook = new Book({
        title,
        caption,
        rating: Number(rating),
        details,
        image: base64Image,
        user: req.user._id,
      });
      await newBook.save();
      return res.status(201).json(newBook);
    }

    // upload file to cloudinary
    const uploadResponse = await cloudinary.uploader.upload_stream(
      { folder: "books" },
      async (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        const newBook = new Book({
          title,
          caption,
          rating: Number(rating),
          details,
          image: result.secure_url,
          user: req.user._id,
        });
       // console.log(newBook);
        await newBook.save();
        res.status(201).json(newBook);
      }
    );
    uploadResponse.end(file.buffer);
  } catch (error) {
   // console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    // Map likes
    const bookIds = books.map((b) => b._id);
    const likes = await Like.find({ book: { $in: bookIds } });

    const booksWithLikes = books.map((book) => {
      const bookLikes = likes
        .filter((l) => l.book.toString() === book._id.toString())
        .map((l) => l.user);
      return {
        ...book.toObject(),
        likes: bookLikes,
      };
    });

    res.send({
      books: booksWithLikes,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const bookIds = books.map((b) => b._id);
    const likes = await Like.find({ book: { $in: bookIds } });

    const booksWithLikes = books.map((book) => {
      const bookLikes = likes
        .filter((l) => l.book.toString() === book._id.toString())
        .map((l) => l.user);
      return {
        ...book.toObject(),
        likes: bookLikes,
      };
    });

    res.json(booksWithLikes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// get single book by ID
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("user", "username profileImage");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const likes = await Like.find({ book: book._id });
    const formattedBook = {
      ...book.toObject(),
      likes: likes.map((l) => l.user),
    };

    res.json(formattedBook);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // check if user is the creator of the book
    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        const res =await cloudinary.uploader.destroy(publicId);
       // console.log(res)
      } catch (deleteError) {
       // console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
   // console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", protectRoute, upload.single("image"), async (req, res) => {
  try {
    const { title, caption, rating, details } = req.body;
    const file = req.file;

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // check if user is the creator of the book
    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    // Update basic details
    book.title = title || book.title;
    book.caption = caption || book.caption;
    book.details = details || book.details;
    if (rating) book.rating = Number(rating);

    // If new image is provided
    if (file) {
      if (process.env.CLOUDINARY_CLOUD_NAME === "dummy" || !process.env.CLOUDINARY_CLOUD_NAME) {
        book.image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        await book.save();
        return res.json(book);
      }

      // upload file to cloudinary
      const uploadResponse = await cloudinary.uploader.upload_stream(
        { folder: "books" },
        async (error, result) => {
          if (error) return res.status(500).json({ message: error.message });
          
          // Optionally delete old image from cloudinary here
          
          book.image = result.secure_url;
          await book.save();
          res.json(book);
        }
      );
      uploadResponse.end(file.buffer);
    } else {
      await book.save();
      res.json(book);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
