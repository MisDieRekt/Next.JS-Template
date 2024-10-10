"use client";

import { useState, useMemo } from "react";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import {
  Box,
  Button,
  Text,
  Group,
  LoadingOverlay,
  Select,
} from "@mantine/core";

interface DeliveryNote {
  DNN: string;
  Chrono: string;
  CustomerName: string;
  AccCode: string | null;
  DelMethod: number;
  CreatedBy: string;
  Priority: number;
  CurrentStatus: number | null;
}

interface DeliveryNoteTableProps {
  initialData: DeliveryNote[];
}

const DeliveryNoteTable = ({ initialData }: DeliveryNoteTableProps) => {
  const [data, setData] = useState<DeliveryNote[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const columns = useMemo<MRT_ColumnDef<DeliveryNote>[]>(
    () => [
      {
        accessorKey: "DNN",
        header: "DNN",
      },
      {
        accessorKey: "Chrono",
        header: "Chrono",
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: "CustomerName",
        header: "Customer Name",
      },
      {
        accessorKey: "AccCode",
        header: "Account Code",
      },
      {
        accessorKey: "DelMethod",
        header: "Delivery Method",
        Cell: ({ row }) => (
          <Select
            data={[
              { value: "1", label: "Method 1" },
              { value: "2", label: "Method 2" },
              { value: "3", label: "Method 3" },
            ]}
            value={row.original.DelMethod.toString()}
            onChange={(value) => {
              const updatedData = data.map((note) =>
                note.DNN === row.original.DNN
                  ? { ...note, DelMethod: parseInt(value || "1", 10) }
                  : note
              );
              setData(updatedData);
            }}
          />
        ),
      },
      {
        accessorKey: "CreatedBy",
        header: "Created By",
      },
      {
        accessorKey: "Priority",
        header: "Priority",
        Cell: ({ row }) => (
          <Select
            data={["1", "2", "3"]}
            value={row.original.Priority.toString()}
            onChange={(value) => {
              const updatedData = data.map((note) =>
                note.DNN === row.original.DNN
                  ? { ...note, Priority: parseInt(value || "1", 10) }
                  : note
              );
              setData(updatedData);
            }}
          />
        ),
      },
      {
        accessorKey: "CurrentStatus",
        header: "Current Status",
      },
    ],
    [data]
  );

  return (
    <div>
      {error && <Text color="red">{error.message}</Text>}
      <Group>
        <Button onClick={() => setData(initialData)} color="blue">
          Reset
        </Button>
      </Group>
      <Box pos="relative" mt="md">
        <LoadingOverlay visible={loading} />
        <MantineReactTable columns={columns} data={data} />
      </Box>
    </div>
  );
};

export default DeliveryNoteTable;
