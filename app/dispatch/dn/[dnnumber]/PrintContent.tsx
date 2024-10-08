// app/dispatch/dn/[dnnumber]/PrintContent.tsx
"use client";

import React, { forwardRef } from "react";
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

interface PrintContentProps {
  data: ApiResponse;
}

const PrintContent = forwardRef<HTMLDivElement, PrintContentProps>(
  ({ data }, ref) => (
    <div ref={ref}>
      <Paper
        shadow="md"
        p="md"
        style={{ width: "210mm", minHeight: "297mm" }} // A4 size with responsive height
      >
        <Grid>
          {/* Header Section */}
          <Grid.Col span={12}>
            <Text size="lg" fw={700} ta="center">
              D.K. GAS APPLIANCES (PTY) LTD
            </Text>
            <Text ta="center">Delivery Note No: {data.deliveryNote.DNN}</Text>
          </Grid.Col>

          {/* Customer Information */}
          <Grid.Col span={6}>
            <Text ta="center">Customer: {data.deliveryNote.CustomerName}</Text>
            <Text ta="center">Account Code: {data.deliveryNote.AccCode}</Text>
            <Text ta="center">Created By: {data.deliveryNote.CreatedBy}</Text>
            <Text ta="center">Priority: {data.deliveryNote.Priority}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text ta="center">
              Date: {new Date(data.deliveryNote.Chrono).toLocaleDateString()}
            </Text>
            <Text ta="center">
              Delivery Method: {data.deliveryNote.DelMethod}
            </Text>
            <Text ta="center">Status: {data.deliveryNote.CurrentStatus}</Text>
          </Grid.Col>

          <Divider my="sm" />

          {/* Item Table */}
          <Grid.Col span={12}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
              }}
            >
              <thead>
                <tr>
                  <th></th>
                  <th>Stock Code</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Items Picked</th>
                </tr>
              </thead>
              <tbody>
                {data.stockDetails?.length ? (
                  data.stockDetails.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>{item.StockCode}</td>
                      <td>{item.Item}</td>
                      <td>{item.Qty}</td>
                      <td>{item.Price.toFixed(2)}</td>
                      <td>{(item.Qty * item.Price).toFixed(2)}</td>
                      <td>___</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      No items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Grid.Col>

          {/* Footer Section */}
          <Grid.Col span={6}>
            <Text ta="center">Total Weight: N/A</Text>
            <Text ta="center">Cartons: N/A</Text>
          </Grid.Col>
        </Grid>
      </Paper>
    </div>
  )
);

PrintContent.displayName = "PrintContent";

export default PrintContent;
