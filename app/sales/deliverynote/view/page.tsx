"use client";

import "@mantine/core/styles.css";
import "mantine-react-table/styles.css";
import { useEffect, useState, useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import {
  Box,
  Button,
  Flex,
  Text,
  Group,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

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

const DeliveryNoteTable = () => {
  const [data, setData] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/toms/deliverynote/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestDelNote: "GetProcessed" }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const table = useMantineReactTable({
    columns,
    data,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableRowSelection: true,
    getRowId: (originalRow) => originalRow.DNN,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 10, pageIndex: 0 },
    },
  });

  return (
    <div>
      {error && <Text color="red">{error.message}</Text>}
      <Group>
        <Button onClick={fetchData} color="blue">
          Refresh
        </Button>
      </Group>
      <Box pos="relative" mt="md">
        <LoadingOverlay visible={loading} />
        <MantineReactTable table={table} />
      </Box>
    </div>
  );
};

export default DeliveryNoteTable;
