"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { useState, useMemo, useEffect } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
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
import { DateInput } from "@mantine/dates";

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
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (!initialData || !Array.isArray(initialData)) {
      setError("Invalid or missing initial data.");
    }
  }, [initialData]);

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
              if (value) {
                const updatedData = data.map((note) =>
                  note.DNN === row.original.DNN
                    ? { ...note, DelMethod: parseInt(value, 10) }
                    : note
                );
                setData(updatedData);
              }
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
            data={[
              { value: "1", label: "Low" },
              { value: "2", label: "Medium" },
              { value: "3", label: "High" },
            ]}
            value={row.original.Priority.toString()}
            onChange={(value) => {
              if (value) {
                const updatedData = data.map((note) =>
                  note.DNN === row.original.DNN
                    ? { ...note, Priority: parseInt(value, 10) }
                    : note
                );
                setData(updatedData);
              }
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
      {error ? (
        <Text color="red">{error}</Text>
      ) : (
        <>
          <Group>
            <Button onClick={() => setData(initialData)} color="blue">
              Reset
            </Button>
          </Group>
          <Box pos="relative" mt="md">
            <LoadingOverlay visible={loading} />
            <MantineReactTable
              columns={columns}
              data={data || []}
              enableColumnFilterModes
              enableColumnOrdering
              enableFacetedValues
              enableGrouping
              enableColumnPinning
              enableRowSelection
              mantineSelectCheckboxProps={{
                color: "red",
              }}
              getRowId={(originalRow: DeliveryNote) => originalRow.DNN}
              initialState={{
                showColumnFilters: true,
                showGlobalFilter: true,
                columnPinning: {
                  left: ["mrt-row-expand", "mrt-row-select"],
                },
                pagination: { pageSize: 10, pageIndex: 0 },
              }}
              paginationDisplayMode="pages"
              positionToolbarAlertBanner="bottom"
              mantinePaginationProps={{
                radius: "xl",
                size: "sm",
              }}
              mantineSearchTextInputProps={{
                placeholder: "Search Delivery Notes",
              }}
              renderTopToolbar={({ table }) => (
                <Flex p="md" justify="space-between" align="center">
                  <DateInput
                    value={selectedDate}
                    onChange={setSelectedDate}
                    label="Select Date"
                    placeholder="Select Date"
                  />
                  <Flex gap="xs">
                    <MRT_GlobalFilterTextInput table={table} />
                    <MRT_ToggleFiltersButton table={table} />
                  </Flex>
                  <Button
                    color="blue"
                    onClick={() => console.log("Action button clicked!")}
                  >
                    Action
                  </Button>
                </Flex>
              )}
            />
          </Box>
        </>
      )}
    </div>
  );
};

export default DeliveryNoteTable;
