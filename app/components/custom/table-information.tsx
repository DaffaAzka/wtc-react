import type { TableInformationData } from "@/types/global";

export default function TableInformation({
  data,
}: {
  data: TableInformationData[];
}) {
  return (
    <div className="flex">
      <table className="border-collapse">
        <tbody>
          {data.map((v, index) => (
            <tr key={index}>
              <td className="py-1 pr-2 text-sm font-medium text-muted-foreground align-top whitespace-nowrap">
                {v.name}
              </td>
              <td className="py-1 pr-2 text-sm text-muted-foreground align-top">
                :
              </td>
              <td className="py-1 text-sm text-foreground align-top">
                {v.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
