const express = require("express");
const router = express.Router();
const { HfInference } = require("@huggingface/inference");
const auth = require("../middleware/auth");
const axios = require("axios");

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Summarize note
router.post("/summarize", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Count the number of words
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    // If content has 10 or fewer words, return the original content as the summary
    if (wordCount <= 10) {
      return res.json({ summary: content });
    }

    // Proceed to summarize only if more than 10 words
    const result = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: content,
      parameters: {
        max_length: 130,
        min_length: 30,
        do_sample: false,
      },
    });

    if (!result || !result.summary_text) {
      throw new Error("Invalid response from AI model");
    }

    res.json({ summary: result.summary_text });
  } catch (error) {
    console.error("Error in summarize:", error);
    res.status(500).json({
      message: "Error summarizing note",
      error: error.message,
    });
  }
});

// Check grammar and spelling
router.post("/check", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const response = await axios.post(
      "https://api.languagetool.org/v2/check",
      `text=${encodeURIComponent(content)}&language=en-US`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const matches = response.data.matches.map((match) => ({
      message: match.message,
      context: match.context,
      offset: match.offset,
      length: match.length,
      replacements: match.replacements,
    }));

    res.json({ matches });
  } catch (error) {
    console.error("Error in grammar check:", error);
    res.status(500).json({
      message: "Error checking grammar and spelling",
      error: error.message,
    });
  }
});

module.exports = router;
