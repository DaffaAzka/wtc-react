import type { Module } from "@/types/model";
import ModalAdd from "./modal-add";
import TableInformation from "@/components/custom/table-information";
import type { TableInformationData } from "@/types/global";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router";

export default function Header({ module }: { module: Module }) {
  const data: TableInformationData[] = [
    {
      name: "Module",
      value: module.title,
    },
    {
      name: "Order",
      value: module.order?.toString() ?? "N/A",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Lessons</h1>

      <TableInformation data={data} />

      <div className="flex gap-2">
        <Link to={`create`}>
          <Button>Add Lesson</Button>
        </Link>
        {/* <ModalAdd moduleId={module.id} /> */}
      </div>
    </div>
  );
}
