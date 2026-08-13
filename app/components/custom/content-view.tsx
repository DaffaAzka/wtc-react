import { convertLexicalToHtml } from "@/utils/render-lexical-to-html";

export default function ContentView({
  rawJsonData,
}: {
  rawJsonData: string | object;
}) {
  const htmlContent = convertLexicalToHtml({ jsonData: rawJsonData });

  return (
    <div className="content-view">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
