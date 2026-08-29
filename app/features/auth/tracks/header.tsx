import ModalAdd from "./modal-add";

export default function Header({ count }: { count?: number }) {
  return (
    <div className="shrink-0 mt-1">
      <ModalAdd />
    </div>
  );
}
