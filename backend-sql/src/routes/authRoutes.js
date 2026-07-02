import express from "express";
import { prisma } from "../index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username || !email || !password) {
      console.log("Missing fields", { username, email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      console.log("Password too short");
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    if (username.length < 3) {
      console.log("Username too short");
      return res.status(400).json({ message: "Username should be at least 3 characters long" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      console.log("Email exists");
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      console.log("Username exists");
      return res.status(400).json({ message: "Username already exists" });
    }

    // get random avatar
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        profileImage,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        _id: user.id, // mapped for frontend
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Login: missing fields", { email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("Login: user not found", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log("Login: password incorrect for", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      token,
      user: {
        _id: user.id, // mapped for frontend
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
