import { Platform, PermissionsAndroid } from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { marked } from "marked";

export const generatePDF = async (articleData) => {
  try {
    // Request storage permission for Android
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Storage permission denied");
      }
    }

    // Convert markdown to HTML
    const body = marked(articleData.body);

    // Create HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${articleData.title}</title>
          <style>
            * { print-color-adjust:exact !important; }
            body {
              font-family: 'Nunito', sans-serif;
              color: #333;
            }
            .header {
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .category {
              display: inline-block;
              background-color: rgba(32, 128, 158, 0.3);
              width: fit-content;
              padding: 4px 12px;
              border-radius: 25px;
              color: #3d527b;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .content {
              line-height: 1.6;
              font-size: 18px;
              margin-top:20px;
              padding: 20px;
            }
            .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
              color: #333;
              margin-top: 24px;
              margin-bottom: 16px;
              font-weight: 600;
              line-height: 1.25;
            }
            .content h1 { font-size: 2em; }
            .content h2 { font-size: 1.5em; }
            .content h3 { font-size: 1.25em; }
            .content p {
              margin-bottom: 16px;
            }
            .content ul, .content ol {
              padding-left: 2em;
              margin-bottom: 16px;
            }
            .content li {
              margin-bottom: 8px;
            }
            .content blockquote {
              padding: 0 1em;
              color: #6a737d;
              border-left: 0.25em solid #dfe2e5;
              margin-bottom: 16px;
            }
            .content code {
              padding: 0.2em 0.4em;
              margin: 0;
              font-size: 85%;
              background-color: rgba(27,31,35,0.05);
              border-radius: 3px;
            }
            .content pre {
              padding: 16px;
              overflow: auto;
              font-size: 85%;
              line-height: 1.45;
              background-color: #f6f8fa;
              border-radius: 3px;
              margin-bottom: 16px;
            }
            .content pre code {
              padding: 0;
              margin: 0;
              background-color: transparent;
            }
            .content a {
              color: #0366d6;
              text-decoration: none;
            }
            .content a:hover {
              text-decoration: underline;
            }
            .content img {
              max-width: 100%;
              box-sizing: border-box;
              margin: 16px 0;
            }
            .labels {
              margin-top: 20px;
            }
            .label {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 20px;
              margin-right: 8px;
              margin-bottom: 8px;
              font-size: 12px;
              color: #20809e;
              border: 1px solid #20809e;
            }
            img {
              width: 100%;
              height: auto;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${articleData.imageMedium ? `<img src="${articleData.imageMedium}" alt="Article Image" />` : ""}
            <h1 class="title">${articleData.title}</h1>
            <div class="category">${articleData.categoryName}</div>
            <div class="meta">
              By ${articleData.creator} • ${articleData.readingTime} min read
            </div>
          </div>
          <div class="labels">
            ${articleData.labels
              .map((label) => `<span class="label">${label.name}</span>`)
              .join("")}
          </div>
          <div class="content">
            ${body}
          </div>
        </body>
      </html>
    `;

    // Generate PDF
    const options = {
      html: htmlContent,
      fileName: `${articleData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`,
      directory: Platform.OS === "ios" ? "Documents" : "Download",
      base64: false,
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
