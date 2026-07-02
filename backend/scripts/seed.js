import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user.js";
import Book from "../src/models/book.js";
import Like from "../src/models/like.js";
import Comment from "../src/models/comment.js";

dotenv.config();

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/library";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    // Delete existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    console.log("Cleared existing users, books, likes, and comments");

    // Create 10 Fake Users
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const user = new User({
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: "password123",
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`
      });
      users.push(await user.save());
    }
    console.log("Created 10 fake users");

    // Create 50 Fake Books
    const books = [];
    const adjectives = ["Great", "Dark", "Silent", "Hidden", "Secret", "Lost", "Final", "Golden", "Broken", "Crystal"];
    const nouns = ["Kingdom", "Forest", "Ocean", "Mountain", "Shadow", "Light", "City", "Star", "Heart", "Soul"];

    for (let i = 1; i <= 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const title = `The ${adj} ${noun} ${i}`;
      const rating = Math.floor(Math.random() * 5) + 1;
      
      books.push({
        title,
        caption: `An amazing book about the ${adj.toLowerCase()} ${noun.toLowerCase()}. Highly recommended read #${i}.`,
        details: `This is a detailed description and key information for the book "${title}". It covers the core narrative, style of writing, and why it has a rating of ${rating} stars. Highly recommended for readers interested in the ${adj.toLowerCase()} ${noun.toLowerCase()} genre.`,
        image: `https://picsum.photos/400/600?random=${i}`,
        rating,
        user: randomUser._id
      });
    }

    const insertedBooks = await Book.insertMany(books);
    console.log("Created 50 fake books");

    // Create random likes and comments
    const commentsList = [
      "Wow, this looks like an amazing read!",
      "I read this last month and absolutely loved it.",
      "Added to my to-read list. Thanks for the recommendation!",
      "The plot twist in this book was unbelievable.",
      "Totally agree with the rating, a must-read!"
    ];

    console.log("Seeding likes and comments...");
    for (const book of insertedBooks) {
      // Seed 2-5 random likes
      const numLikes = Math.floor(Math.random() * 4) + 2;
      const shuffedUsers = [...users].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numLikes; j++) {
        await new Like({ user: shuffedUsers[j]._id, book: book._id }).save();
      }

      // Seed 1-3 random comments
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let k = 0; k < numComments; k++) {
        const commenter = users[Math.floor(Math.random() * users.length)];
        const text = commentsList[Math.floor(Math.random() * commentsList.length)];
        await new Comment({ text, user: commenter._id, book: book._id }).save();
      }
    }

    console.log("Database seeded successfully with likes and comments!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
