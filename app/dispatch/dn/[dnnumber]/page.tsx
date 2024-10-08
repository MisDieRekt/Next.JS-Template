// app/dispatch/dn/[dnnumber]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Paper, Text, Grid, Divider } from "@mantine/core";

type StockDetail = {
  DNN: string;
  StockCode: string;
  Item: string;
  Price: number;
  Qty: number;
};

type DeliveryNote = {
  DNN: string;
  Chrono: string;
  CustomerName: string;
  AccCode: string;
  DelMethod: number;
  CreatedBy: string;
  Priority: number;
  CurrentStatus: number;
};

type ApiResponse = {
  deliveryNote: DeliveryNote;
  stockDetails: StockDetail[];
};

export default function DeliveryNotePage({
  params,
}: {
  params: { dnnumber: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const { dnnumber } = params;

  useEffect(() => {
    // Fetch data from the API using the DNN param
    async function fetchData() {
      try {
        const response = await fetch(
          "https://dkapi.totai.co.za:9191/toms/dn/fetch",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ DNN: dnnumber }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchData();
  }, [dnnumber]);

  if (!data) {
    return <Text>Loading...</Text>;
  }

  return (
    <Paper shadow="md" p="md" style={{ width: "210mm", height: "297mm" }}>
      <Grid>
        {/* Header Section */}
        <Grid.Col span={12}>
          <Text size="lg" fw={700}>
            D.K. GAS APPLIANCES (PTY) LTD
          </Text>
          <Text>Delivery Note No: {data.deliveryNote.DNN}</Text>
        </Grid.Col>

        {/* Customer Information */}
        <Grid.Col span={6}>
          <Text>Customer: {data.deliveryNote.CustomerName}</Text>
          <Text>Account Code: {data.deliveryNote.AccCode}</Text>
          <Text>Created By: {data.deliveryNote.CreatedBy}</Text>
          <Text>Priority: {data.deliveryNote.Priority}</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>
            Date: {new Date(data.deliveryNote.Chrono).toLocaleDateString()}
          </Text>
          <Text>Delivery Method: {data.deliveryNote.DelMethod}</Text>
          <Text>Status: {data.deliveryNote.CurrentStatus}</Text>
        </Grid.Col>

        <Divider my="sm" />

        {/* Item Table */}
        <Grid.Col span={12}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Stock Code</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.stockDetails?.length ? (
                data.stockDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{item.StockCode}</td>
                    <td>{item.Item}</td>
                    <td>{item.Qty}</td>
                    <td>{item.Price.toFixed(2)}</td>
                    <td>{(item.Qty * item.Price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No items available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Grid.Col>

        {/* Footer Section */}
        <Grid.Col span={6}>
          <Text>Total Weight: N/A</Text> {/* Adjust if weight info is added */}
          <Text>Cartons: N/A</Text> {/* Adjust if cartons info is added */}
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
