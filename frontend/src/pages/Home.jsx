import { useEffect, useState } from "react";
import { fetchArticles } from "../api/articles";
import ArticleCard from "../components/ArticleCard";
import ArticleModal from "../components/ArticleModal";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchArticles().then(setArticles);
  }, []);

  return (
    <div className="container">
      <h1>AI Content Pipeline</h1>

      <div className="grid">
        {articles.map((a) => (
          <ArticleCard key={a._id} article={a} onOpen={() => setSelected(a)} />
        ))}
      </div>

      <ArticleModal article={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
