"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; // if using Mantine date picker features
import "mantine-react-table/styles.css"; // make sure MRT styles are imported
import { useMemo, useEffect, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  type MRT_TableOptions,
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
import { debounce } from "lodash";

interface Order {
  AutoIndex: number;
  OrderNum: string;
  Priority: number;
  CurrentStatus: number;
  Customer_Name: string | null;
  Delivery_Method: string | null;
  isEditing: boolean;
}

interface Status {
  StatusNum: number;
  StatusText: string;
}

const statuses: Status[] = [
  { StatusNum: 11, StatusText: "Sent To Dispatch" },
  { StatusNum: 21, StatusText: "Sent To Collections" },
  { StatusNum: 12, StatusText: "Recieved In Dispatch" },
  { StatusNum: 13, StatusText: "Printed In Dispatch" }
];



  

const fetchUser = async (
  setCurrentUser: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> => {
  try {
    const response = await fetch("/api/fetchUser");
    const result = await response.json();
    if (response.ok) {
      console.log("User data:", result.user);
      setCurrentUser(result.user.email);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const fetchData = async (
  setData: React.Dispatch<React.SetStateAction<Order[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<Error | null>>
): Promise<void> => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/sales/fetchcaptured",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestOrders: "fetchcaptured" }),
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const result = await response.json();
    setData(
      result.unmatchedOrders.map((order: any) => ({
        AutoIndex: order.AutoIndex,
        OrderNum: order.OrderNum,
        Priority: order.Priority,
        CurrentStatus: 1,
        Customer_Name: order.AccountName ?? "",
        Delivery_Method: order.Delivery_Method ?? "",
        isEditing: false,
      }))
    );
    console.log("Fetched data:", result.unmatchedOrders);
  } catch (error) {
    setError(error as Error);
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};

const Example: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUser(setCurrentUser);
  }, []);

  useEffect(() => {
    fetchData(setData, setLoading, setError);
  }, []);

  const setStatuses = async (selectedOrders: Order[]): Promise<void> => {
    const ordersToUpdate = selectedOrders.map((order) => ({
      AutoIndex: order.AutoIndex,
      OrdNum: order.OrderNum,
      Priority: order.Priority,
      User: currentUser,
      Status: order.CurrentStatus,
    }));

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/sales/changestatus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ordersToUpdate),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      notifications.show({
        title: "Update Successful",
        message: "Order statuses updated successfully.",
        color: "green",
        radius: "md",
      });

      setTimeout(() => {
        fetchData(setData, setLoading, setError);
      }, 2000);
    } catch (error) {
      console.error("Error updating order statuses:", error);
      notifications.show({
        title: "Update Failed",
        message: "An error occurred while updating order statuses.",
        color: "red",
        radius: "md",
      });
    }
  };

  const toggleEdit = (index: number): void => {
    setData((prevData) =>
      prevData.map((order, i) =>
        i === index ? { ...order, isEditing: !order.isEditing } : order
      )
    );
  };

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "Customer_Name",
        header: "Customer Name",
        filterVariant: "text",
      },
      {
        accessorKey: "OrderNum",
        header: "Order Number",
        filterVariant: "text",
      },
      {
        accessorKey: "Priority",
        header: "Priority",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: ["Normal", "High"],
        },
        Cell: ({ row }) =>
          row.original.isEditing ? (
            <Select
              data={["Normal", "High"]}
              value={row.original.Priority === 1 ? "High" : "Normal"}
              onChange={(value) => {
                const updatedData = data.map((order) =>
                  order.AutoIndex === row.original.AutoIndex
                    ? { ...order, Priority: value === "High" ? 1 : 0 }
                    : order
                );
                setData(updatedData);
              }}
            />
          ) : (
            <Text>{row.original.Priority === 1 ? "High" : "Normal"}</Text>
          ),
        filterFn: (row, _columnId, filterValue) => {
          const priorityText =
            row.getValue<number>("Priority") === 1 ? "High" : "Normal";
          return priorityText === filterValue;
        },
      },
      {
        accessorKey: "CurrentStatus",
        header: "Current Status",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: statuses.map((status) => status.StatusText),
        },
        Cell: ({ row }) =>
          row.original.isEditing ? (
            <Select
              data={statuses.map((status) => ({
                value: status.StatusNum.toString(),
                label: status.StatusText,
              }))}
              value={row.original.CurrentStatus.toString()}
              onChange={(value) => {
                const updatedData = data.map((order) =>
                  order.AutoIndex === row.original.AutoIndex
                    ? { ...order, CurrentStatus: parseInt(value || "0") }
                    : order
                );
                setData(updatedData);
              }}
            />
          ) : (
            <Text>
              {statuses.find(
                (status) => status.StatusNum === row.original.CurrentStatus
              )?.StatusText || "Unknown"}
            </Text>
          ),
      },
      {
        accessorKey: "Delivery_Method",
        header: "Delivery Method",
        filterVariant: "text",
      },
      {
        id: "edit",
        header: "Edit",
        Cell: ({ row }) => (
          <Button onClick={() => toggleEdit(row.index)}>
            {row.original.isEditing ? "Save" : "Edit"}
          </Button>
        ),
      },
    ],
    [data]
  );

  const tableOptions: MRT_TableOptions<Order> = {
    columns,
    data: useMemo(() => data, [data]),
    enableRowSelection: true,
    mantineSelectCheckboxProps: {
      color: "red",
    },
    getRowId: (originalRow) => originalRow.AutoIndex.toString(),
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
      },
      pagination: { pageSize: 25, pageIndex: 0 },
    },
    renderTopToolbar: ({ table }) => {
      const handleSetStatuses = () => {
        const selectedRows = table
          .getSelectedRowModel()
          .flatRows.map((row) => row.original);
        console.log("Selected Rows:", selectedRows);
        if (selectedRows.length > 0) {
          setStatuses(selectedRows);
        }
      };

      return (
        <Flex p="md" justify="space-between" align="center">
          <Flex gap="xs">
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Button
            color="blue"
            disabled={table.getSelectedRowModel().flatRows.length === 0}
            onClick={handleSetStatuses}
          >
            Set Statuses
          </Button>
        </Flex>
      );
    },
  };

  const table = useMantineReactTable<Order>(tableOptions);

  return (
    <div>
      {error && <Text color="red">{error.message}</Text>}
      <Group>
        <Button
          onClick={() => fetchData(setData, setLoading, setError)}
          color="blue"
        >
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

export default Example;
