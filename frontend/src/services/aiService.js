import axios from "axios";

// const API_URL = "https://notes-backend-aq02.onrender.com/api";
const API_URL = "https://notes-backend-aq02.onrender.com/api";

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

export const transformStyle = async (content, style) => {
  try {
    console.log("api url: ", `${API_URL}/ai/style-transform`);
    const response = await axios.post(`${API_URL}/ai/style-transform`, {
      content,
      style,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to transform text style"
    );
  }
};
