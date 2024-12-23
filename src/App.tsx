// Import the whole React module
import React, { useState, useEffect } from 'react';

import ErrorBoundary from './ErrorBoundary';

// Static imports for smaller libraries (CSS and lightweight dependencies)
import 'katex/dist/katex.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/monokai.css';
import DOMPurify from 'dompurify';

let marked: any;
let katex: any;
let hljs: any;

const App = () => {
  const [content, setContent] = useState<string>('');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Dynamically import large libraries only when necessary
  useEffect(() => {
    const loadLibraries = async () => {
      if (!marked) marked = (await import('marked')).marked; // Fixed import
      if (!katex) katex = (await import('katex')).default;
      if (!hljs) hljs = (await import('highlight.js')).default;
    };

    loadLibraries();
  }, []); // Empty dependency array means it will run once after mount

  const renderMarkdown = (md: string): string => {
    try {
      if (!marked || !katex || !DOMPurify) return ''; // Ensure libraries are loaded
      let htmlContent = marked(md); // Render markdown

      if (typeof htmlContent === 'string') {
        htmlContent = htmlContent.replace(/(\$.*?\$)/g, (match: string) => {
          try {
            return katex.renderToString(match.slice(1, -1));
          } catch (err) {
            return match; // Return original if KaTeX fails
          }
        });

        const sanitizedHtml = DOMPurify.sanitize(htmlContent);
        return sanitizedHtml; // Return sanitized HTML content
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

  // Update the rendered HTML directly
  useEffect(() => {
    if (content && !errorMessage) {
      const htmlContent = renderMarkdown(content);
      setRenderedHtml(htmlContent);
    }
  }, [content, errorMessage]);

  const generateUrl = () => {
    const base64Content = btoa(content);
    const newUrl = `${window.location.origin}?content=${base64Content}`;
    setGeneratedUrl(newUrl);
  };

  const applySyntaxHighlighting = () => {
    if (hljs) {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  };

  useEffect(() => {
    if (renderedHtml) {
      applySyntaxHighlighting();
    }
  }, [renderedHtml]);

  if (errorMessage) {
    return (
      <ErrorBoundary>
        <div className="container text-center" style={{ padding: '50px' }}>
          <h1>Oops! Something went wrong.</h1>
          <pre>{errorMessage}</pre>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container">
        <h1 className="my-4 text-center">Welcome to MarkdownPages!</h1>
        <p className="text-center">
          Create your own markdown-based webpage and share it easily with others. <br />
          Please note: This is for documentation purposes only, and you are not allowed to modify the CSS.
        </p>

        <div className="alert alert-info">
          <h5>Available Functions:</h5>
          <ul>
            <li><strong>Code Blocks:</strong> Use <code>` ```code here``` `</code> to add code blocks.</li>
            <li><strong>Math Expressions:</strong> Use <code>`$E = mc^2$`</code> for inline equations, or <code>`$$E = mc^2$$`</code> for block equations.</li>
            <li><strong>Links:</strong> Use <code>`[Link Text](http://url.com)`</code> to add links.</li>
            <li><strong>Images:</strong> Use <code>`![Alt Text](http://url.com)`</code> to add images.</li>
            <li><strong>Lists:</strong> Use <code>`- Item`</code> or <code>`1. Item`</code> for unordered and ordered lists.</li>
          </ul>
        </div>

        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Markdown Editor</h5>
            <textarea
              className="form-control"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Rendered Page</h5>
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          </div>
        </div>

        <button className="btn btn-primary mt-4" onClick={generateUrl}>
          Generate URL
        </button>
        {generatedUrl && (
          <div className="mt-3">
            <h5>Share this URL:</h5>
            <input type="text" className="form-control" value={generatedUrl} readOnly />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
