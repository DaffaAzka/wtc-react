import ModalAdd from "./modal-add";

export default function Header() {
  return (
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold">Tracks</h1>
      <ModalAdd />
    </div>
  );
}
