import { useState, useEffect, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

// Top-level imports (not dynamic)
import 'katex/dist/katex.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/monokai.css';

const App = () => {
  const [content, setContent] = useState<string>('');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Dynamically import the libraries only when needed
  const marked = React.lazy(() => import('marked'));
  const katex = React.lazy(() => import('katex'));
  const DOMPurify = React.lazy(() => import('dompurify'));
  const hljs = React.lazy(() => import('highlight.js'));

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
      let htmlContent = '';
      // Wait until libraries are loaded before using them
      Promise.all([marked, katex, DOMPurify]).then(([markedLib, katexLib, domPurifyLib]) => {
        htmlContent = markedLib(md); // Render markdown

        if (typeof htmlContent === 'string') {
          htmlContent = htmlContent.replace(/(\$.*?\$)/g, (match: string) => {
            try {
              return katexLib.renderToString(match.slice(1, -1));
            } catch (err) {
              return match; // Return original if KaTeX fails
            }
          });

          const sanitizedHtml = domPurifyLib.sanitize(htmlContent);
          setRenderedHtml(sanitizedHtml); // Return sanitized HTML content
        } else {
          throw new Error('Rendered markdown is not a string.');
        }
      });
      return htmlContent; // Return empty string if there's an error
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
      renderMarkdown(content);
    }
  }, [content, errorMessage]);

  const generateUrl = () => {
    const base64Content = btoa(content);
    const newUrl = `${window.location.origin}?content=${base64Content}`;
    setGeneratedUrl(newUrl);
  };

  const applySyntaxHighlighting = () => {
    // Dynamically import and apply syntax highlighting
    hljs.then((hljsLib) => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljsLib.highlightElement(block as HTMLElement);
      });
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
      <Suspense fallback={<div>Loading...</div>}>
        <div className="container">
          {!isViewMode ? (
            <>
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
            </>
          ) : (
            <div className="mt-5">
              <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            </div>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
