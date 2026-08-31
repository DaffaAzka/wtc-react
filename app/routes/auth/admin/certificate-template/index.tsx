import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Save, Eye, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { useCertificateTemplate, useSaveTemplate } from "@/hooks/certificate";
import type { CertificateTemplate } from "@/types/certificate";

const DEFAULT_HTML = `<div class="certificate">
  <div class="cert-header">
    <img class="cert-logo" src="{{logo_url}}" alt="Logo" />
    <h1 class="cert-title">Certificate of Completion</h1>
  </div>
  <div class="cert-body">
    <p class="cert-label">This is to certify that</p>
    <h2 class="cert-name">{{student_name}}</h2>
    <p class="cert-label">has successfully completed</p>
    <h3 class="cert-track">{{track_title}}</h3>
    <div class="cert-grade">Grade: <strong>{{grade}}</strong> ({{grade_score}})</div>
    <p class="cert-date">Issued on {{issued_date}}</p>
  </div>
  <div class="cert-footer">
    <img class="cert-signature" src="{{signature_url}}" alt="Signature" />
    <div class="cert-number">Certificate No: {{certificate_number}}</div>
  </div>
</div>`;

const DEFAULT_CSS = `.certificate {
  width: 800px;
  min-height: 560px;
  padding: 60px;
  background: white;
  font-family: Georgia, serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}
.cert-header { margin-bottom: 32px; }
.cert-logo { height: 64px; margin-bottom: 16px; }
.cert-title { font-size: 32px; font-weight: bold; color: #1c3a5e; letter-spacing: 0.05em; margin: 0; }
.cert-body { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.cert-label { font-size: 14px; color: #666; margin: 0; }
.cert-name { font-size: 28px; font-weight: bold; color: #1c3a5e; margin: 0; }
.cert-track { font-size: 20px; color: #1c81ff; margin: 0; }
.cert-grade { font-size: 16px; color: #333; margin-top: 8px; }
.cert-date { font-size: 13px; color: #999; margin-top: 4px; }
.cert-footer { margin-top: 40px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.cert-signature { height: 48px; }
.cert-number { font-size: 11px; color: #bbb; font-family: monospace; }`;

export default function CertificateTemplateDesigner() {
  const { template, loading: templateLoading } = useCertificateTemplate();
  const saveTemplate = useSaveTemplate();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("Default Template");
  const [htmlTemplate, setHtmlTemplate] = useState(DEFAULT_HTML);
  const [cssStyles, setCssStyles] = useState(DEFAULT_CSS);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Populate from loaded template
  useEffect(() => {
    if (template) {
      setName(template.name || "Default Template");
      setHtmlTemplate(template.html_template || DEFAULT_HTML);
      setCssStyles(template.css_styles || DEFAULT_CSS);
      setBackgroundUrl(template.background_url || "");
      setLogoUrl(template.logo_url || "");
      setSignatureUrl(template.signature_url || "");
    }
  }, [template]);

  const buildPreviewDoc = () => {
    const bgStyle = backgroundUrl
      ? `body { background-image: url('${backgroundUrl}'); background-size: cover; background-position: center; }`
      : "";
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; ${backgroundUrl ? "" : "background: #f1f5f9;"} }
${bgStyle}
${cssStyles}
</style></head><body>${htmlTemplate}</body></html>`;
  };

  const handlePreview = () => setPreviewKey((k) => k + 1);

  const handleSave = () => {
    const data: CertificateTemplate = {
      name: name || "Default Template",
      html_template: htmlTemplate,
      css_styles: cssStyles,
      background_url: backgroundUrl || null,
      logo_url: logoUrl || null,
      signature_url: signatureUrl || null,
    };
    saveTemplate.mutate(data, {
      onSuccess: () => toast.success("Template saved as active"),
      onError: (err) => toast.error(err?.message || "Failed to save template"),
    });
  };

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Admin
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Certificate Template
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Design the HTML/CSS template used to generate all certificates.
          </p>
        </div>
        <div className="shrink-0 mt-1 flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold px-4 py-2.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Refresh Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saveTemplate.isPending}
            className="flex items-center gap-2 rounded-xl bg-[#1c81ff] text-white font-bold px-5 py-2.5 text-[13px] hover:bg-[#1c81ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
          >
            {saveTemplate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save as Active
          </button>
        </div>
      </div>

      {templateLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-6 space-y-3">
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg" />
              <div className="h-64 bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ── Left: Editor panel ── */}
          <div className="space-y-5">
            {/* Template Name */}
            <div className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-5 space-y-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Template Name
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Default Template"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>

            {/* Asset URLs */}
            <div className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-5 space-y-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" />
                Asset URLs
              </p>
              {[
                { label: "Background Image URL", value: backgroundUrl, set: setBackgroundUrl, placeholder: "https://..." },
                { label: "Logo URL", value: logoUrl, set: setLogoUrl, placeholder: "https://..." },
                { label: "Signature URL", value: signatureUrl, set: setSignatureUrl, placeholder: "https://..." },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-600 pointer-events-none" />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-9 pr-4 py-2 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* HTML Template */}
            <div className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  HTML Template
                </p>
                <span className="text-[11px] text-gray-400 dark:text-gray-600">
                  Use &#123;&#123;student_name&#125;&#125;, &#123;&#123;track_title&#125;&#125;, &#123;&#123;grade&#125;&#125;, etc.
                </span>
              </div>
              <textarea
                value={htmlTemplate}
                onChange={(e) => setHtmlTemplate(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#0d0d0d] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[13px] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-y leading-relaxed"
              />
            </div>

            {/* CSS Styles */}
            <div className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-5 space-y-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                CSS Styles
              </p>
              <textarea
                value={cssStyles}
                onChange={(e) => setCssStyles(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#0d0d0d] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[13px] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* ── Right: Live preview ── */}
          <div className="xl:sticky xl:top-6 xl:self-start space-y-3">
            <div className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-[12px] font-bold text-gray-400 dark:text-gray-600 ml-2">
                  Live Preview
                </span>
              </div>
              <iframe
                key={previewKey}
                srcDoc={buildPreviewDoc()}
                title="Certificate Preview"
                sandbox="allow-same-origin"
                className="w-full"
                style={{ height: "480px", border: "none", display: "block" }}
              />
            </div>
            <p className="text-[12px] text-gray-400 dark:text-gray-600 text-center">
              Click "Refresh Preview" to apply latest changes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
