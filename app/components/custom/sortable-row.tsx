import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow } from "@/components/ui/table";
import { GripVerticalIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function SortableRow({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <td className="w-8 cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVerticalIcon className="size-4 text-muted-foreground" />
      </td>
      {children}
    </TableRow>
  );
}
