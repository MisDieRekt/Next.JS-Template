"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; // if using mantine date picker features
import "mantine-react-table/styles.css"; // make sure MRT styles were imported in your app root (once)
import { useMemo, useEffect, useState, useRef } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import { Box, Button, Flex, Text, Group, LoadingOverlay } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications"; // Import notifications object directly

interface Order {
  AutoIndex: string;
  Customer_Account: string;
  Customer_Name: string;
  DelNoteNum: string | null;
  Delivery_Method: string;
  Dispatch_Date: string;
  ExtOrderNum: string;
  InvDate: string;
  InvNumber: string;
  InvTotExcl: number;
  OrderDate: string;
  OrderNum: string;
  OrderReceivedDate: string | null;
  Picker: string;
  PodDate: string | null;
  Reg_Number: string;
  SoqNo: string | null;
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
        "https://dkapi.totai.co.za:9191/toms/tripsheet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "40" }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("API response data:", result); // Log API response data for debugging
      setData(
        result.map((order: any) => ({
          ...order,
          AutoIndex:
            order.AutoIndex != null ? order.AutoIndex.toString() : "N/A", // Ensure AutoIndex is a valid string
        }))
      );
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "Customer_Account",
        header: "Customer Account",
        size: 200,
      },
      {
        accessorKey: "Customer_Name",
        header: "Customer Name",
        size: 200,
      },
      {
        accessorKey: "ExtOrderNum",
        header: "External Order Number",
        size: 200,
      },
      {
        accessorKey: "OrderNum",
        header: "Order Number",
        size: 150,
      },
      {
        accessorKey: "SoqNo",
        header: "Soq Number",
        size: 150,
      },
      {
        accessorKey: "InvDate",
        header: "Invoice Date",
        size: 150,
      },
      {
        accessorKey: "InvNumber",
        header: "Invoice Number",
        size: 150,
      },
      {
        accessorKey: "DelNoteNum",
        header: "Delivery Note Number",
        size: 150,
      },
      {
        accessorKey: "Delivery_Method",
        header: "Delivery Method",
        size: 150,
      },
      {
        accessorKey: "Dispatch_Date",
        header: "Dispatch Date",
        size: 150,
      },
      {
        accessorKey: "PodDate",
        header: "Pod Date",
        size: 150,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: data || [], // Fallback to an empty array if data is null
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enableColumnPinning: true,
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
    mantineTableBodyCellProps: {
      style: {
        fontSize: "12px",
      },
    },
    mantineTableBodyRowProps: {
      style: {
        fontSize: "12px",
      },
    },
    renderTopToolbar: ({ table }) => (
      <Flex p="md" justify="space-between" align="center">
        <DateInput
          value={selectedDate}
          onChange={setSelectedDate}
          label="Select Capture Date"
          placeholder="Select Capture Date"
        />
        <Flex gap="xs">
          <MRT_GlobalFilterTextInput table={table} />
          <MRT_ToggleFiltersButton table={table} />
        </Flex>
        <Button color="blue" onClick={fetchData} variant="filled">
          Refresh
        </Button>
      </Flex>
    ),
  });

  // Add references and event handlers for drag scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    isMouseDown.current = true;
    startX.current = e.pageX - tableContainerRef.current.offsetLeft;
    scrollLeft.current = tableContainerRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isMouseDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // The multiplier adjusts the scroll speed
    tableContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div>
      {error && <Text color="red">{error.message}</Text>}
      <Group>
        <Button onClick={fetchData} color="blue">
          Refresh
        </Button>
      </Group>
      <Box
        pos="relative"
        mt="md"
        style={{ overflowX: "auto", cursor: isMouseDown.current ? "grabbing" : "grab" }}
        ref={tableContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
      >
        <LoadingOverlay visible={loading} />
        <div style={{ width: "1650px" }}>
          <MantineReactTable table={table} />
        </div>
      </Box>
    </div>
  );
};

export default Example;
