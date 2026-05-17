export default function CodeBlock({ code, language = 'code' }) {
  return (
    <div className="code-frame">
      <div className="code-toolbar">
        <span></span>
        <span></span>
        <span></span>
        <strong>{language}</strong>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
