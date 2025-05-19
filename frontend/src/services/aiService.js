import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const summarizeNote = async (content) => {
  try {
    const response = await axios.post(`${API_URL}/ai/summarize`, { content });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to summarize note"
    );
  }
};

export const checkGrammar = async (content) => {
  try {
    const response = await axios.post(`${API_URL}/ai/check`, { content });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to check grammar and spelling"
    );
  }
};
