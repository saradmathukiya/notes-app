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

// Transform text style
router.post("/style-transform", auth, async (req, res) => {
  try {
    const { content, style } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (!style) {
      return res.status(400).json({ message: "Style is required" });
    }

    const supportedStyles = [
      "casual",
      "professional",
      "creativity",
      "friendly",
    ];
    if (!supportedStyles.includes(style.toLowerCase())) {
      return res.status(400).json({
        message: `Style must be one of: ${supportedStyles.join(", ")}`,
      });
    }

    // Create prompt for OpenRouter API
    const prompt = `Rewrite the following text in a ${style} style. Do not include any HTML tags or formatting in your response:\n\n${content}`;

    // Make request to OpenRouter AI
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-prover-v2:free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that rewrites text in different styles. Never include HTML tags or formatting in your responses.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let transformedText = response.data.choices[0].message.content.trim();

    // Remove any HTML tags that might still be present
    transformedText = transformedText.replace(/<[^>]*>/g, "");

    // Remove code block markers (```) from start and end
    transformedText = transformedText.replace(/^```\w*\n?|\n?```$/g, "");

    res.json({ transformedText });
  } catch (error) {
    console.error(
      "Error in style transform:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Error transforming text style",
      error: error.message,
    });
  }
});

module.exports = router;
