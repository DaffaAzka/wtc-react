import type { Module } from "@/types/model";
import ModalAdd from "./modal-add";
import TableInformation from "@/components/custom/table-information";
import type { TableInformationData } from "@/types/global";

export default function Header({ module }: { module: Module }) {
  const data: TableInformationData[] = [
    {
      name: "Module",
      value: module.title,
    },
    {
      name: "Order",
      value: module.order.toString(),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Lessons</h1>

      <TableInformation data={data} />
      <ModalAdd moduleId={module.id} />
    </div>
  );
}
