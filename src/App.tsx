import { useState, useEffect } from 'react';
import { marked } from 'marked'; // Import marked for markdown rendering
import katex from 'katex';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitizing HTML
import hljs from 'highlight.js'; // Import highlight.js for syntax highlighting
import 'katex/dist/katex.min.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Always include Bootstrap CSS
import 'highlight.js/styles/monokai.css'; // Import the monokai dark theme for highlight.js
import ErrorBoundary from './ErrorBoundary'; // Import the ErrorBoundary

const App = () => {
  const [content, setContent] = useState<string>(''); // State for markdown content
  const [renderedHtml, setRenderedHtml] = useState<string>(''); // State for rendered HTML
  const [generatedUrl, setGeneratedUrl] = useState<string>(''); // State for generated URL
  const [isViewMode, setIsViewMode] = useState<boolean>(false); // State to check if in view-only mode
  const [errorMessage, setErrorMessage] = useState<string>(''); // State for the error message

  // Global error handler for unhandled JavaScript errors
  useEffect(() => {
    const handleError = (event: any, source: string, lineno: number, colno: number, error: Error) => {
      const errorDetails = `${error.message} at ${source}:${lineno}:${colno}`;
      setErrorMessage(errorDetails); // Display the actual error message in the UI
      console.error(errorDetails);
      return true; // Prevent default handling (e.g., browser-specific error dialogs)
    };

    window.onerror = handleError;

    return () => {
      window.onerror = null; // Clean up error handler on component unmount
    };
  }, []);

  // Fetch Base64 encoded content from the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const base64Content = urlParams.get('content');
    
    if (base64Content) {
      try {
        const decodedContent = atob(base64Content); // Decode the Base64 content
        setContent(decodedContent); // Set content from URL
        setIsViewMode(true); // Set to view-only mode if content parameter exists
      } catch (error) {
        // If decoding fails, set error state
        setErrorMessage(`Failed to decode content from URL: ${error.message}`);
        setContent(''); // Clear content to ensure error state is shown
      }
    }
  }, []);

  // Function to render markdown with KaTeX support and syntax highlighting
  const renderMarkdown = (md: string) => {
    try {
      let htmlContent = marked(md); // Render the Markdown using marked

      // Render KaTeX math expressions
      htmlContent = htmlContent.replace(/(\$.*?\$)/g, (match) => {
        try {
          return katex.renderToString(match.slice(1, -1)); // Remove $ symbols for KaTeX
        } catch (err) {
          return match; // Return original if KaTeX fails
        }
      });

      // Sanitize the HTML content to avoid XSS vulnerabilities
      const sanitizedHtml = DOMPurify.sanitize(htmlContent);

      return sanitizedHtml; // Return sanitized HTML content
    } catch (error) {
      // If rendering markdown fails, set error state
      setErrorMessage(`Error rendering the markdown: ${error.message}`);
      return ""; // Return empty string if error occurs
    }
  };

  // Update the rendered HTML when content changes
  useEffect(() => {
    if (content && !errorMessage) {
      setRenderedHtml(renderMarkdown(content));
    }
  }, [content, errorMessage]); // Avoid rendering if errorMessage is set

  // Generate Base64 URL with markdown content
  const generateUrl = () => {
    const base64Content = btoa(content); // Base64 encode the content
    const newUrl = `${window.location.origin}?content=${base64Content}`;
    setGeneratedUrl(newUrl);
  };

  // Function to apply syntax highlighting
  const applySyntaxHighlighting = () => {
    // Highlight all <code> blocks in the rendered HTML
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement); // Apply highlighting
    });
  };

  // Trigger syntax highlighting after the HTML is rendered
  useEffect(() => {
    if (renderedHtml) {
      applySyntaxHighlighting();
    }
  }, [renderedHtml]); // Run on renderedHtml change

  // If there is an error message, we show the error page with the error message in a <pre> tag
  if (errorMessage) {
    return (
      <ErrorBoundary>
        <div className="container text-center" style={{ padding: '50px' }}>
          <h1>Oops! Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', textAlign: 'left' }}>
            {errorMessage}
          </pre>
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

            {/* Show Available Functions */}
            <div className="alert alert-info">
              <h5>Special Functions:</h5>
              <ul>
                <li><strong>Code Blocks:</strong> Use <code>` ```code here``` `</code> to add code blocks.</li>
                <li><strong>Math Expressions:</strong> Use <code>`$E = mc^2$`</code> for equations.</li>
              </ul>
            </div>

            {/* Markdown Editor */}
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Markdown Editor</h5>
                <textarea
                  className="form-control"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)} // Update content state on change
                ></textarea>
              </div>
            </div>

            {/* Rendered Content */}
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Rendered Page</h5>
                {/* Directly render the content inside the container */}
                <div className="markdown-output" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              </div>
            </div>

            {/* URL Generation */}
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Generated URL</h5>
                <p className="text-muted">Click the button below to generate the Base64 encoded URL for your content:</p>
                <button className="btn btn-primary" onClick={generateUrl}>
                  Generate URL
                </button>
                {generatedUrl && (
                  <div className="mt-3">
                    <p><strong>Share this URL:</strong></p>
                    <a href={generatedUrl} target="_blank" rel="noopener noreferrer">{generatedUrl}</a>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // Render the page content directly if content is passed via the URL
          <div className="content markdown-output" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
