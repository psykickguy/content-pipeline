export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  const renderContent = (text) =>
    text.split("\n\n").map((block, i) => {
      if (block.startsWith("##")) {
        return <h4 key={i}>{block.replace("##", "").trim()}</h4>;
      }
      return <p key={i}>{block}</p>;
    });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2 className="modal-title">{article.title}</h2>

        <div className="comparison">
          <section className="content-box original">
            <h3>Original</h3>
            {renderContent(article.originalContent)}
          </section>

          {article.enhancedContent && (
            <section className="content-box enhanced">
              <h3>Enhanced</h3>
              {renderContent(article.enhancedContent)}
            </section>
          )}
        </div>

        {article.citations?.length > 0 && (
          <div className="references">
            <h3>References</h3>
            <div className="ref-grid">
              {article.citations.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="ref-card"
                >
                  {new URL(url).hostname}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
