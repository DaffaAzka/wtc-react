import ModalAdd from "./modal-add";

export default function Header({ count }: { count?: number }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Study Classes</h1>
        {typeof count === "number" && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {count} {count === 1 ? "class" : "classes"} in the system
          </p>
        )}
      </div>
      <ModalAdd />
    </div>
  );
}
