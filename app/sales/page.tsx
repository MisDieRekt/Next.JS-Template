"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; // if using mantine date picker features
import "mantine-react-table/styles.css"; // make sure MRT styles were imported in your app root (once)
import { useMemo, useEffect, useState } from "react";
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
  AutoIndex: string;
  OrderNum: string;
  DeliveryNote: string;
  ExtOrderNum: string;
  cAccountName: string;
  DelMethodID: number;
  priority: string; // Add priority field
}

const Example = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const fetchUser = async () => {
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
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://dkapi.totai.co.za:9191/sales/getuncaptured",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestOrders: "GetUnprocessed" }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(
        result.unmatchedOrders.map((order: any) => ({
          ...order,
          priority: "Normal",
        }))
      ); // Initialize priority
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const captureOrders = async (selectedOrders: Order[]) => {
    const ordersToCapture = selectedOrders.map((order) => ({
      AutoIndex: order.AutoIndex,
      OrdNum: order.OrderNum,
      User: currentUser || "unknown",
      DateCaptured: selectedDate
        ? selectedDate.toISOString()
        : new Date().toISOString(),
      Priority: order.priority === "High" ? 1 : 0,
      DelMethodID: order.DelMethodID,
    }));

    try {
      const response = await fetch(
        "https://dkapi.totai.co.za:9191/sales/captureorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ordersToCapture),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("Capture result:", result);

      const message =
        selectedOrders.length === 1
          ? "Order successfully captured."
          : `${selectedOrders.length} orders captured successfully.`;

      notifications.show({
        title: "Capture Successful",
        message,
        color: "green",
        radius: "md",
      });

      setTimeout(() => {
        fetchData(); // Refresh table data after capturing orders with a delay
      }, 2000);
    } catch (error) {
      console.error("Error capturing orders:", error);
      notifications.show({
        title: "Capture Failed",
        message: "An error occurred while capturing orders.",
        color: "red",
        radius: "md",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "cAccountName",
        header: "Account Name",
      },
      {
        accessorKey: "OrderNum",
        header: "Order Number",
      },
      {
        accessorKey: "DeliveryNote",
        header: "Delivery Note",
      },
      {
        accessorKey: "ExtOrderNum",
        header: "External Order Number",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        Cell: ({ row }) => (
          <Select
            data={["Normal", "High"]}
            value={row.original.priority}
            onChange={(value) => {
              const updatedData = data.map((order) =>
                order.AutoIndex === row.original.AutoIndex
                  ? { ...order, priority: value || "Normal" }
                  : order
              );
              setData(updatedData);
            }}
          />
        ),
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
    getRowId: (originalRow) => originalRow.AutoIndex,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
      },
      pagination: { pageSize: 50, pageIndex: 0 },
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
    renderTopToolbar: ({ table }) => {
      const handleDeactivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("deactivating " + row.getValue("OrderNum"));
        });
      };

      const handleActivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("activating " + row.getValue("OrderNum"));
        });
      };

      const handleCapture = () => {
        const selectedRows = table
          .getSelectedRowModel()
          .flatRows.map((row) => row.original);
        captureOrders(selectedRows);
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
            {/* <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleDeactivate}
              variant="filled"
            >
              Deactivate
            </Button>
            <Button
              color="green"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleActivate}
              variant="filled"
            >
              Activate
            </Button> */}
            <Button
              color="blue"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleCapture}
              variant="filled"
            >
              Capture
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
