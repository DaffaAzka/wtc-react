import ModalAdd from "./modal-add";

export default function Header({ count }: { count?: number }) {
  return (
    <div className="flex items-center gap-3">
      <ModalAdd />
      {typeof count === "number" && count > 0 && (
        <div className="hidden lg:flex items-center gap-2 bg-[#31c7c8]/10 rounded-xl px-3 py-1.5">
          <span className="font-extrabold text-[#31c7c8]">{count}</span>
          <span className="text-[12px] font-bold text-[#31c7c8]/70">
            {count === 1 ? "class" : "classes"}
          </span>
        </div>
      )}
    </div>
  );
}
