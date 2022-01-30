const express = require("express");
const router = express.Router();
const usersLogic = require("../bll/auth-logic");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/auth-middleware");
const getNewToken = require("../helpers/auth-helper");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    let user = new User(
      undefined,
      firstName,
      lastName,
      username,
      password,
      undefined
    );
    const error = user.validatePost();
    if (error) {
      return res.status(400).json({ errors: [{ msg: error }] });
    }
    const isUsernameExists = await usersLogic.getUser(username);
    if (isUsernameExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Username is already taken" }] });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // Create a user
    const createAUser = await usersLogic.asyncRegisterUser(user);
    console.log(user);
    // If sign up fails
    if (!createAUser) {
      return res.status(400).json({ errors: [{ msg: "Sign up failed!" }] });
    }
    // Create Token
    const token = await getNewToken(user);
    if (!token) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Failed, Could not generate a token" }] });
    }
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ errors: [{ msg: "Username required!" }] });
    }
    if (!password) {
      return res.status(400).json({ errors: [{ msg: "Password required!" }] });
    }
    const user = await usersLogic.getUser(username);
    if (user.username !== username) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    delete user.password;
    // Create token
    const token = await getNewToken(user);
    if (!token) {
      return res.status(400).json({ errors: [{ msg: "Sign in failed!" }] });
    }
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).send("Some error occurred.");
  }
});
// Logged user
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await usersLogic.getAuthUser(req.user.userId);
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User is not found" }] });
    }
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).send("server error");
  }
});

module.exports = router;
