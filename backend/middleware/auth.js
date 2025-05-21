const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication required. Please log in." });
    }

    try {
      const verified = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      req.user = verified;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      }
      return res
        .status(401)
        .json({ message: "Invalid token. Please log in again." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during authentication" });
  }
};

module.exports = auth;
