"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; // if using mantine date picker features
import "mantine-react-table/styles.css"; // make sure MRT styles were imported in your app root (once)
import { useMemo, useEffect, useState, useCallback } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
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
import { notifications } from "@mantine/notifications"; // Import notifications object directly

interface Order {
  AutoIndex: number;
  OrderNum: string;
  Priority: number;
  CurrentStatus: number;
  Customer_Name: string | null;
  Delivery_Method: string | null;
}

const statuses = [
  { StatusNum: 1, StatusText: "Order Captured" },
  { StatusNum: 2, StatusText: "Order At Finance" },
  { StatusNum: 3, StatusText: "Returned From Finance" },
  { StatusNum: 4, StatusText: "Incorrect Pricing" },
  { StatusNum: 5, StatusText: "New Month Orders" },
  { StatusNum: 6, StatusText: "Back Order" },
  { StatusNum: 7, StatusText: "Pending Order - Custom" },
  { StatusNum: 8, StatusText: "Awaiting Finance Approval" },
  { StatusNum: 9, StatusText: "Awaiting Confirmation" },
  { StatusNum: 10, StatusText: "Awaiting Payment" },
  { StatusNum: 11, StatusText: "Sent To Dispatch" },
];

const Example = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/fetchUser");
      const result = await response.json();
      if (response.ok) {
        console.log("User data:", result.user); // Log user data for debugging
        setCurrentUser(result.user.email);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchData = useCallback(async () => {
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
          CurrentStatus: 1, // Assuming a default status if not provided
          Customer_Name: order.AccountName,
          Delivery_Method: null, // Assuming Delivery Method is not provided
        }))
      );
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setStatuses = async (selectedOrders: Order[]) => {
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

      const result = await response.json();
      console.log("Update result:", result);

      notifications.show({
        title: "Update Successful",
        message: "Order statuses updated successfully.",
        color: "green",
        radius: "md",
      });

      setTimeout(() => {
        fetchData(); // Refresh table data after updating orders with a delay
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "Customer_Name",
        header: "Customer Name",
      },
      {
        accessorKey: "OrderNum",
        header: "Order Number",
      },
      {
        accessorKey: "Priority",
        header: "Priority",
        Cell: ({ row }) => (
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
        ),
      },
      {
        accessorKey: "CurrentStatus",
        header: "Current Status",
        Cell: ({ row }) =>
          statuses.find(
            (status) => status.StatusNum === row.original.CurrentStatus
          )?.StatusText || "Unknown",
      },
      {
        accessorKey: "SetStatus",
        header: "Set Status",
        Cell: ({ row }) => (
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
        ),
      },
      {
        accessorKey: "Delivery_Method",
        header: "Delivery Method",
      },
    ],
    [data]
  );

  const table = useMantineReactTable({
    columns,
    data: data || [], // Fallback to an empty array if data is null
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enableColumnPinning: true,
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
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "sm",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search Orders",
    },
    mantineTableBodyRowProps: ({ row }) => ({
      className: row.original.Priority === 1 ? "high-priority" : undefined,
    }),
    renderTopToolbar: ({ table }) => {
      const handleSetStatuses = () => {
        const selectedRows = table
          .getSelectedRowModel()
          .flatRows.map((row) => row.original);
        setStatuses(selectedRows);
      };

      return (
        <Flex p="md" justify="space-between" align="center">
          <DateInput
            value={selectedDate}
            onChange={setSelectedDate}
            label="Select Capture Date"
            placeholder="Select Capture Date"
          />
          <Flex gap="xs">
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Flex style={{ gap: "8px" }}>
            <Button
              color="blue"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleSetStatuses}
              variant="filled"
            >
              Set Statuses
            </Button>
          </Flex>
        </Flex>
      );
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

export default Example;
