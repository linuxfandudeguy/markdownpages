import { useState, useEffect } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/monokai.css';
import ErrorBoundary from './ErrorBoundary';

const App = () => {
  const [content, setContent] = useState<string>('');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const base64Content = urlParams.get('content');

    if (base64Content) {
      try {
        const decodedContent = atob(base64Content);
        setContent(decodedContent);
        setIsViewMode(true);
      } catch (error: unknown) {
        console.error('Failed to decode content from URL:', error);
        if (error instanceof Error) {
          setErrorMessage(`Failed to decode content from URL: ${error.message}`);
        } else {
          setErrorMessage('An unknown error occurred.');
        }
        setContent('');
      }
    }
  }, []);

  const renderMarkdown = (md: string): string => {
    try {
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
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
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
        {!isViewMode ? (
          <>
            <h1 className="my-4 text-center">Welcome to MarkdownPages!</h1>
            <p className="text-center">
              Create your own markdown-based webpage and share it easily with others. <br />
              Please note: This is for documentation purposes only, and you are not allowed to modify the CSS.
            </p>

            <div className="alert alert-info">
              <h5>Special Functions:</h5>
              <ul>
                <li><strong>Code Blocks:</strong> Use <code>` ```code here``` `</code> to add code blocks.</li>
                <li><strong>Math Expressions:</strong> Use <code>`$E = mc^2$`</code> for equations.</li>
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
          </>
        ) : (
          <div className="mt-5">
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
