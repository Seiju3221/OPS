import axios from 'axios';

const API_URL = '/api/plagiarism';

export const checkPlagiarism = async (article) => {
  try {
    const response = await axios.post(`${API_URL}/check`, {
      title: article.title,
      text: extractTextContent(article.content)
    });

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check plagiarism');
  }
};