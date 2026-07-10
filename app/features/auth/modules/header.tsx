import type { Track } from "@/types/model";
import ModalAdd from "./modal-add";
import TableInformation from "@/components/custom/table-information";
import type { TableInformationData } from "@/types/global";

export default function Header({ track }: { track: Track }) {
  const data: TableInformationData[] = [
    {
      name: "Title",
      value: track.title,
    },
    {
      name: "Description",
      value: track.description,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Modules</h1>

      <TableInformation data={data} />
      {/* <ModalAdd /> */}
    </div>
  );
}
