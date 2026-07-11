import {
  Table,
  TableBody,
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
import type { Lesson } from "@/types/model";
import { useState } from "react";
import ModalEdit from "./modal-edit";
import { EllipsisIcon } from "lucide-react";
import ModalDelete from "./modal-delete";

export default function LessonsTable({ data }: { data: Lesson[] }) {
  const [editModal, setEditModal] = useState<{
    data: Lesson | null;
    isOpen: boolean;
  }>({
    data: null,
    isOpen: false,
  });

  const [deleteModal, setDeleteModal] = useState<{
    data: Lesson | null;
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
                <TableHead>Title</TableHead>
                <TableHead className="hidden lg:table-cell">Content</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lesson, index) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{lesson.title}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-xs truncate">
                    {lesson.content}
                  </TableCell>
                  <TableCell>{lesson.order}</TableCell>
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
                              data: lesson,
                              isOpen: true,
                            });
                          }}>
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteModal({
                              data: lesson,
                              isOpen: true,
                            });
                          }}>
                          Delete
                        </DropdownMenuItem>
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

      {deleteModal.data !== null && (
        <ModalDelete
          key={deleteModal.data.id}
          data={deleteModal.data}
          isOpen={deleteModal.isOpen}
          onOpenChange={(open) =>
            setDeleteModal((prev) => ({ ...prev, isOpen: open }))
          }
        />
      )}
    </>
  );
}
