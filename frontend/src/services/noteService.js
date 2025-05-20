import axios from "axios";

const API_URL = "https://notes-backend-aq02.onrender.com/api";

export const createNote = async (noteData) => {
  try {
    const response = await axios.post(`${API_URL}/notes`, noteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create note");
  }
};

export const getNotes = async () => {
  try {
    const response = await axios.get(`${API_URL}/notes`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch notes");
  }
};

export const updateNote = async (id, noteData) => {
  try {
    const response = await axios.put(`${API_URL}/notes/${id}`, noteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update note");
  }
};

export const deleteNote = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/notes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete note");
  }
};
