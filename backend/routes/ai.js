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

    // Check if content exists and is not just whitespace/HTML
    const strippedContent = content.replace(/<[^>]*>/g, "").trim();
    if (!strippedContent) {
      return res
        .status(400)
        .json({ message: "Content is required and cannot be empty" });
    }

    // Check minimum content length
    if (strippedContent.length < 10) {
      return res
        .status(400)
        .json({ message: "Content must be at least 10 characters long" });
    }

    // Count the number of words
    const wordCount = strippedContent.split(/\s+/).filter(Boolean).length;

    // If content has 10 or fewer words, return the original content as the summary
    if (wordCount <= 10) {
      return res.json({ summary: strippedContent });
    }

    // Proceed to summarize only if more than 10 words
    const result = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: strippedContent,
      parameters: {
        max_length: 130,
        min_length: 30,
        do_sample: false,
      },
    });

    if (!result || !result.summary_text) {
      throw new Error("Invalid response from AI model");
    }

    // Clean the summary of any HTML tags
    let cleanSummary = result.summary_text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/^```\w*\n?|\n?```$/g, "") // Remove code block markers
      .trim();

    res.json({ summary: cleanSummary });
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

    // Check if content exists and is not just whitespace/HTML
    const strippedContent = content.replace(/<[^>]*>/g, "").trim();
    if (!strippedContent) {
      return res
        .status(400)
        .json({ message: "Content is required and cannot be empty" });
    }

    // Count words
    const wordCount = strippedContent.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 10) {
      return res
        .status(400)
        .json({ message: "Content must be more than 10 words to transform" });
    }

    // Add maximum content length check
    const MAX_CONTENT_LENGTH = 5000; // characters
    if (strippedContent.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({
        message: `Content is too long. Maximum length is ${MAX_CONTENT_LENGTH} characters.`,
        maxLength: MAX_CONTENT_LENGTH,
      });
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
    const prompt = `Rewrite the following text in a ${style} style. Do not include any HTML tags or formatting in your response:\n\n${strippedContent}`;

    // Make request to OpenRouter AI with response size limits
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-prover-v2:free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that rewrites text in different styles. Never include HTML tags or formatting in your responses. Keep responses concise and within reasonable length.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000, // Limit response size
        presence_penalty: 0.6, // Encourage more concise responses
        frequency_penalty: 0.3, // Reduce repetition
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let transformedText = response.data.choices[0].message.content.trim();

    // Check if response is too large
    const MAX_RESPONSE_LENGTH = 4000; // characters
    if (transformedText.length > MAX_RESPONSE_LENGTH) {
      // Truncate the response and add an ellipsis
      transformedText =
        transformedText.substring(0, MAX_RESPONSE_LENGTH) + "...";
    }

    // Remove any HTML tags that might still be present
    transformedText = transformedText.replace(/<[^>]*>/g, "");

    // Remove code block markers (```) and backticks (`) from start and end
    transformedText = transformedText
      .replace(/^```\w*\n?|\n?```$/g, "") // Remove code block markers
      .replace(/^`|`$/g, "") // Remove single backticks at start/end
      .replace(/`/g, "'") // Replace any remaining backticks with single quotes
      .trim();

    res.json({ transformedText });
  } catch (error) {
    console.error(
      "Error in style transform:",
      error.response?.data || error.message
    );

    // Handle specific error cases
    if (error.response?.status === 413) {
      return res.status(413).json({
        message:
          "The response from the AI model was too large. Please try with a shorter text.",
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    res.status(500).json({
      message: "Error transforming text style",
      error: error.message,
    });
  }
});

module.exports = router;
