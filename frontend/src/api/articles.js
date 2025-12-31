import axios from "axios";

const API_BASE = "http://content-pipeline.up.railway.app/articles";

export const fetchArticles = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};
