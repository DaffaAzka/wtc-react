import { useState } from "react";
import { useInView } from "./use-in-view";
import { Plus } from "lucide-react";

const copy = {
  tag: "FAQ",
  heading1: "Frequently asked",
  heading2: "questions.",
  faqs: [
    {
      q: "Is WTC LMS free?",
      a: "Yes! We provide free access to core materials and video content. Premium features like certificates and assignment reviews are available for those who want more.",
    },
    {
      q: "What tracks are available?",
      a: "We offer Frontend (React, Vue), Backend (Node.js, Laravel, Python), Mobile (Flutter, Kotlin), and DevOps tracks. New content is added regularly.",
    },
    {
      q: "Can I learn at my own pace?",
      a: "Absolutely! All courses are self-paced. Learn whenever it fits your schedule with lifetime access to all materials.",
    },
    {
      q: "Do I get a certificate after completing a track?",
      a: "Yes, upon completing a track you receive a certificate you can share on LinkedIn and in your professional portfolio.",
    },
    {
      q: "What if I need help?",
      a: "You can discuss in the community forum, join live Q&A sessions, or reach a mentor directly through our platform.",
    },
  ],
};

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, inView } = useInView();

  return (
    <section
      id="faq"
      ref={ref}
      className="min-h-screen flex flex-col justify-center w-full pt-20 pb-16 px-6 lg:px-20"
      style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div
          className={`mb-16 text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
          <p
            className="text-[13px] font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: "#1c81ff" }}>
            {copy.tag}
          </p>
          <h2
            className="font-extrabold m-0"
            style={{
              color: "#0b1215",
              fontSize: "clamp(36px, 4vw, 48px)",
              lineHeight: "1.05",
              letterSpacing: "-0.02em",
            }}>
            {copy.heading1}{" "}
            <span style={{ color: "#1c81ff" }}>{copy.heading2}</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col">
          <div style={{ borderTop: "1px solid #eaeaea" }} />

          {copy.faqs.map((item, i) => (
            <div
              key={i}
              className="transition-all duration-700 ease-out"
              style={{
                borderBottom: "1px solid #eaeaea",
                transitionDelay: `${i * 100}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
              }}>
              {/* Tombol Pertanyaan */}
              <button
                className="group flex w-full items-center justify-between py-6 text-left gap-4 transition-colors duration-200 hover:text-blue-600"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}>
                <span
                  className="text-[17px] md:text-[19px] font-bold transition-colors duration-200"
                  style={{ color: open === i ? "#1c81ff" : "#0b1215" }}>
                  {item.q}
                </span>

                {/* Icon Plus/Cross dari Lucide */}
                <div
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300"
                  style={{
                    background: open === i ? "#1c81ff" : "transparent",
                    color: open === i ? "#ffffff" : "#0b1215",
                  }}>
                  <Plus
                    className="w-5 h-5 transition-transform duration-300"
                    style={{
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  />
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  open === i
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}>
                <div className="overflow-hidden">
                  <p
                    className="pb-8 pr-12 text-[16px] leading-relaxed"
                    style={{ color: "#757575" }}>
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
