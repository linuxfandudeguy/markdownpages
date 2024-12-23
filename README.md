
# MarkdownPages

MarkdownPages is a web-based markdown editor that allows you to create and preview markdown-based web pages. Once your page is ready, you can generate a URL for it. This URL includes the `?content` parameter, which contains the Base64 encoded markdown.

## Table of Contents
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Usage

To use Markdown Pages, visit [Markdown Pages](https://markdownpages.vercel.app/). The website provides a markdown editor where you can write and preview your markdown content. Once you are satisfied with your page, you can generate a URL that includes the `?content` parameter with your Base64 encoded markdown.

### Example

1. Go to [Markdown Pages](https://markdownpages.vercel.app/).
2. Write your markdown content in the editor.
3. Preview the content on the website.
4. Generate the URL, which will look something like this:
   ```
   https://markdownpages.vercel.app/?content=BASE64_ENCODED_MARKDOWN
   ```

## Features

- **Inline Equations:** To add inline equations, use `$math$`, where `math` is the equation. You must use KaTeX syntax as KaTeX is the TeX renderer used.

- **Syntax Highlighting:** When you make a code block it will add syntax highlighting. You might not think this is special, but the markdown renderer we used did not natively support syntax highlighting, so we count it as a special feature.

- **Markdown (in general):** This doesn't just include fancy features we also have the classic  **bold** text and the *italic* text and every single markdown feature ever

## Contributing

We welcome contributions to the MarkdownPages project! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b my-feature-branch
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Description of my changes"
   ```
4. Push to your branch:
   ```bash
   git push origin my-feature-branch
   ```
5. Create a pull request on GitHub.

## License

This project is licensed under the AGPL-3.0 License. See the [LICENSE](LICENSE) file for details.
