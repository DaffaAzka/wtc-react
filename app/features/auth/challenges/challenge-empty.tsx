import { Plus, FileQuestion } from "lucide-react";

type Props = {
  onAddClick: () => void;
  contextType?: "lesson" | "module";
};

export default function ChallengeEmpty({
  onAddClick,
  contextType = "lesson",
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8 text-gray-400 dark:text-gray-600" />
      </div>
      <h3
        className="text-xl font-extrabold text-gray-900 dark:text-white mb-2"
        style={{ letterSpacing: "-0.02em" }}>
        No challenges yet
      </h3>
      <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        This {contextType} doesn't have any challenges yet. Create your first
        challenge to get started.
      </p>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-[14px]">
        <Plus className="h-4 w-4" />
        Add Challenge
      </button>
    </div>
  );
}
