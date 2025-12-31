export default function ArticleCard({ article, onOpen }) {
  return (
    <div className="card" onClick={onOpen}>
      <h3>{article.title}</h3>
      <p className="status">
        Status: <strong>{article.isEnhanced ? "Enhanced" : "Original"}</strong>
      </p>
    </div>
  );
}
