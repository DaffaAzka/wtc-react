import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent } from "@/components/ui/card";
import type { Track } from "@/types/model";
import { useState } from "react";
import ModalEdit from "./modal-edit";
import { EllipseIcon, EllipsisIcon } from "lucide-react";

export default function TracksTable({ data }: { data: Track[] }) {
  const [editModal, setEditModal] = useState<{
    data: Track | null;
    isOpen: boolean;
  }>({
    data: null,
    isOpen: false,
  });

  return (
    <>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="hidden lg:inline-block">
                  Description
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((track, index) => (
                <TableRow key={track.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{track.title}</TableCell>
                  <TableCell>{track.slug}</TableCell>
                  <TableCell className="hidden lg:inline-block">
                    {track.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <EllipsisIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditModal({
                              data: track,
                              isOpen: true,
                            });
                          }}>
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editModal.data !== null && (
        <ModalEdit
          key={editModal.data.id}
          data={editModal.data}
          isOpen={editModal.isOpen}
          onOpenChange={(open) =>
            setEditModal((prev) => ({ ...prev, isOpen: open }))
          }
        />
      )}
    </>
  );
}
