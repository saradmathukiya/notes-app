const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const rateLimit = require("express-rate-limit");

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

// Input validation middleware
const validateInput = (req, res, next) => {
  const { email, password } = req.body;

  // Email validation - only allowing .com domains and dots between characters
  // Dots after @ are only allowed right before .com
  const emailRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9]+\.com$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      message:
        "Please provide a valid .com email address. Dots are only allowed between characters in the local part and right before .com in the domain part.",
    });
  }

  // Password validation for registration
  if (req.path === "/register") {
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter",
      });
    }

    if (!/\d/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one number" });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character",
      });
    }
  }

  next();
};

// Register
router.post("/register", validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Reduced token expiration time
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

// Login
router.post("/login", loginLimiter, validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" }); // Generic error message
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" }); // Generic error message
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Reduced token expiration time
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" }); // Generic error message
  }
});

module.exports = router;
