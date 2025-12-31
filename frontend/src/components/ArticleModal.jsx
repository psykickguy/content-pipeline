export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{article.title}</h2>

        <h3>Original Content</h3>
        <p>{article.originalContent}</p>

        {article.enhancedContent && (
          <>
            <h3>Enhanced Content</h3>
            <p>{article.enhancedContent}</p>
          </>
        )}

        {article.citations?.length > 0 && (
          <>
            <h3>References</h3>
            <ul>
              {article.citations.map((c, i) => (
                <li key={i}>
                  <a href={c} target="_blank" rel="noreferrer">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
