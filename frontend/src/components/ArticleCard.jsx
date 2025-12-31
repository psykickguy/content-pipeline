export default function ArticleCard({ article, onOpen }) {
  return (
    <div className="card">
      <h3>{article.title}</h3>
      <p>
        Status: <strong>{article.isEnhanced ? "Enhanced" : "Original"}</strong>
      </p>
      <button onClick={() => onOpen(article)}>View</button>
    </div>
  );
}
