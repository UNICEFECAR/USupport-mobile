import { Platform } from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { marked } from "marked";

export const generatePDF = async ({ articleData, t }) => {
  try {
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
          ${t("by", { creator: articleData.creator })} • ${articleData.readingTime} ${t("min_read")}
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
    const fileName = `${articleData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.pdf`;
    const options = {
      html: htmlContent,
      fileName: fileName,
      directory: Platform.OS === "ios" ? "Documents" : "Download",
      base64: true,
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

export const generateBaselineAssessmentResultPDF = async ({
  result,
  assessmentData,
  t,
  logoUri,
}) => {
  try {
    const summarySource =
      assessmentData?.summary ||
      assessmentData?.summaryText ||
      assessmentData?.summary_md ||
      "";
    const summaryHtml = summarySource ? marked.parse(summarySource) : "";

    const listItems = (items) =>
      (items || [])
        .slice(0, 10)
        .map(
          (i) =>
            `<li><span class="liTitle">${escapeHtml(i.title || "")}</span>${
              i.creator
                ? `<span class="liMeta"> — ${escapeHtml(i.creator)}</span>`
                : ""
            }</li>`
        )
        .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(
            t?.("assessment_completed") || "Assessment completed"
          )}</title>
          <style>
            * { print-color-adjust:exact !important; }
            body {
              font-family: 'Nunito', sans-serif;
              color: #333;
              padding: 16px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              margin-bottom: 16px;
            }
            .logo {
              width: 120px;
              height: auto;
              object-fit: contain;
              margin-left: auto;
            }
            .title {
              font-size: 22px;
              font-weight: bold;
              margin: 0 0 6px 0;
            }
            .meta {
              color: #666;
              font-size: 12px;
            }
            .section {
              margin-top: 18px;
              padding-top: 12px;
              border-top: 1px solid #eee;
            }
            .sectionTitle {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 10px;
              color: #3d527b;
            }
            .subtitle {
              font-size: 13px;
              color: #555;
              margin-bottom: 10px;
            }
            .stats {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
            }
            .stat {
              background: #f6f8fa;
              border-radius: 10px;
              padding: 10px 12px;
              min-width: 160px;
              flex: 1;
            }
            .statLabel {
              font-size: 12px;
              color: #66768d;
              margin-bottom: 6px;
              font-weight: 700;
            }
            .statValue {
              font-size: 20px;
              font-weight: 800;
              color: #111;
            }
            .markdown {
              line-height: 1.6;
              font-size: 15px;
            }
            .markdown h1, .markdown h2, .markdown h3, .markdown h4, .markdown h5, .markdown h6 {
              color: #333;
              margin-top: 18px;
              margin-bottom: 12px;
              font-weight: 700;
              line-height: 1.25;
            }
            .markdown p { margin: 0 0 12px 0; }
            .list { padding-left: 18px; margin: 0; }
            .list li { margin-bottom: 8px; }
            .liTitle { font-weight: 700; }
            .liMeta { color: #666; font-size: 12px; }
            .footer {
              margin-top: 18px;
              padding-top: 12px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">${escapeHtml(
                t?.("assessment_completed") || "Assessment completed"
              )}</div>
              <div class="meta">${escapeHtml(
                t?.("download_pdf_footer") || "Generated by USupport client app"
              )}</div>
            </div>
            ${
              logoUri
                ? `<img class="logo" src="${escapeHtml(
                    logoUri
                  )}" alt="USupport" />`
                : ""
            }
          </div>

          ${
            result
              ? `<div class="section">
                  <div class="sectionTitle">${escapeHtml(
                    t?.("summary_heading") || "Summary"
                  )}</div>
                  ${
                    result?.comparePreviousText
                      ? `<div class="subtitle">${escapeHtml(
                          result.comparePreviousText
                        )}</div>`
                      : ""
                  }
                  <div class="stats">
                    <div class="stat">
                      <div class="statLabel">${escapeHtml(
                        t?.("psychological") || "Psychological"
                      )}</div>
                      <div class="statValue">${escapeHtml(
                        result.psychologicalScore
                      )}</div>
                    </div>
                    <div class="stat">
                      <div class="statLabel">${escapeHtml(
                        t?.("biological") || "Biological"
                      )}</div>
                      <div class="statValue">${escapeHtml(
                        result.biologicalScore
                      )}</div>
                    </div>
                    <div class="stat">
                      <div class="statLabel">${escapeHtml(
                        t?.("social") || "Social"
                      )}</div>
                      <div class="statValue">${escapeHtml(
                        result.socialScore
                      )}</div>
                    </div>
                  </div>
                </div>`
              : ""
          }

          ${
            summaryHtml
              ? `<div class="section">
                  <div class="sectionTitle">${escapeHtml(
                    t?.("summary_heading") || "Summary"
                  )}</div>
                  <div class="markdown">${summaryHtml}</div>
                </div>`
              : ""
          }

          ${
            assessmentData?.articles?.length
              ? `<div class="section">
                  <div class="sectionTitle">${escapeHtml(
                    t?.("recommended_articles") || "Recommended articles"
                  )}</div>
                  <ul class="list">${listItems(assessmentData.articles)}</ul>
                </div>`
              : ""
          }
          ${
            assessmentData?.videos?.length
              ? `<div class="section">
                  <div class="sectionTitle">${escapeHtml(
                    t?.("recommended_videos") || "Recommended videos"
                  )}</div>
                  <ul class="list">${listItems(assessmentData.videos)}</ul>
                </div>`
              : ""
          }
          ${
            assessmentData?.podcasts?.length
              ? `<div class="section">
                  <div class="sectionTitle">${escapeHtml(
                    t?.("recommended_podcasts") || "Recommended podcasts"
                  )}</div>
                  <ul class="list">${listItems(assessmentData.podcasts)}</ul>
                </div>`
              : ""
          }

          <div class="footer">${escapeHtml(
            t?.("download_pdf_footer") || "Generated by USupport client app"
          )}</div>
        </body>
      </html>
    `;

    const fileName = `baseline_assessment_result_${Date.now()}.pdf`;
    const options = {
      html: htmlContent,
      fileName,
      directory: Platform.OS === "ios" ? "Documents" : "Download",
      base64: true,
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file;
  } catch (error) {
    console.error("Error generating baseline assessment PDF:", error);
    throw error;
  }
};
