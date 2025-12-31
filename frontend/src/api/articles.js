import axios from "axios";

const API_BASE = "http://localhost:8080/articles";

export const fetchArticles = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};
