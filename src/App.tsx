import React, { useState, useEffect, Suspense } from 'react';

const Marked = React.lazy(() => import('marked'));
const KaTeX = React.lazy(() => import('katex'));
const Hljs = React.lazy(() => import('highlight.js'));
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/monokai.css';

const App = () => {
  const [content, setContent] = useState<string>('');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ... other logic

  const renderMarkdown = (md: string): string => {
    try {
      const marked = require('marked');  // Dynamically load `marked` when needed
      let htmlContent = marked(md); // Render markdown

      if (typeof htmlContent === 'string') {
        htmlContent = htmlContent.replace(/(\$.*?\$)/g, (match: string) => {
          try {
            const katex = require('katex');  // Dynamically load `katex` when needed
            return katex.renderToString(match.slice(1, -1));
          } catch (err) {
            return match; // Return original if KaTeX fails
          }
        });

        const sanitizedHtml = DOMPurify.sanitize(htmlContent);  // DOMPurify can stay static
        return sanitizedHtml;
      } else {
        throw new Error('Rendered markdown is not a string.');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(`Error rendering the markdown: ${error.message}`);
      }
      return ''; // Return empty string if there's an error
    }
  };

  // ... other hooks and logic

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container">
        {/* Content rendering */}
        <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>
    </Suspense>
  );
};

export default App;
