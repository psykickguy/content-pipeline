import { useEffect, useState } from "react";
import { fetchArticles } from "../api/articles";
import ArticleCard from "../components/ArticleCard";
import ArticleModal from "../components/ArticleModal";
import Loader from "../components/Loader";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchArticles().then((fetchedArticles) => {
      setArticles(fetchedArticles);
      setLoading(false); // Set loading to false after data is fetched
    });
  }, []);

  return (
    <div className="container">
      <h1>AI Content Pipeline</h1>

      {/* Show loader if loading is true */}
      {loading ? (
        <Loader />
      ) : (
        <div className="grid">
          {articles.map((a) => (
            <ArticleCard
              key={a._id}
              article={a}
              onOpen={() => setSelected(a)}
            />
          ))}
        </div>
      )}

      <ArticleModal article={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
