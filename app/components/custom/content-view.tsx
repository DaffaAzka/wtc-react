import { convertLexicalToHtml } from "@/utils/render-lexical-to-html";
import DOMPurify from "dompurify";

export default function ContentView({
  rawJsonData,
}: {
  rawJsonData: string | object;
}) {
  const rawHtml = convertLexicalToHtml({ jsonData: rawJsonData });
  // Sanitize as defence-in-depth; convertLexicalToHtml already escapes text
  // nodes but this catches any future node types that might slip through.
  const htmlContent =
    typeof window !== "undefined"
      ? DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } })
      : rawHtml;

  return (
    <div className="content-view">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
