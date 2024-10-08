"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TextInput,
  Select,
  Button,
  Group,
  Container,
  Grid,
  NumberInput,
  Title,
  Box,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";

// Define types
interface FormValues {
  date: Date;
  priority: string;
  customerName: string;
  createdBy: string;
  dnn: string;
  deliveryMethod: string;
  deliveryAddress: string;
  items: Array<{ id: number; stockItem: string; price: number; qty: number }>;
}

interface StockItem {
  StockLink: number;
  Code: string;
  ucIIFullDescription: string;
}

const DeliveryNotePage: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [dnn, setDnn] = useState(""); // Direct state management for DNN
  const [deliveryAddress, setDeliveryAddress] = useState(""); // Direct state management for Delivery Address
  const [currentUser, setCurrentUser] = useState<string>("");

  const form = useForm<FormValues>({
    initialValues: {
      date: new Date(),
      priority: "3", // Default to "Normal"
      customerName: "",
      createdBy: "",
      dnn: "",
      deliveryMethod: "1",
      deliveryAddress: "",
      items: [{ id: 1, stockItem: "", price: 0, qty: 0 }],
    },
  });

  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  // Mappings for priorities and delivery methods
  const priorities = [
    { value: "1", label: "URGENT!" },
    { value: "2", label: "High" },
    { value: "3", label: "Normal" },
  ];

  const deliveryMethods = [
    { value: "1", label: "Collection" },
    { value: "2", label: "Delivery" },
  ];

  useEffect(() => {
    setIsClient(true);

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

    const fetchStockItems = async () => {
      try {
        const response = await fetch(
          "https://dkapi.totai.co.za:9191/sage/stock/check/allstock",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ StockRequest: "StockRequestAPI" }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const filteredData = data.filter(
            (item: any) => item.ucIIFullDescription !== null
          );
          return filteredData.map((item: any) => ({
            StockLink: item.StockLink,
            Code: item.Code,
            ucIIFullDescription: item.ucIIFullDescription,
          }));
        } else {
          console.error("Failed to fetch stock items:", response.statusText);
          return [];
        }
      } catch (error) {
        console.error("Error fetching stock items:", error);
        return [];
      }
    };

    fetchUser(); // Fetch the user data
    fetchStockItems().then((data) => setStockItems(data));
  }, []);

  const addItem = useCallback(() => {
    form.setFieldValue("items", [
      ...form.values.items,
      { id: form.values.items.length + 1, stockItem: "", price: 0, qty: 0 },
    ]);
  }, [form]);

  const handleSubmit = async (values: FormValues) => {
    const deliveryNoteData = {
      DNN: dnn,
      Chrono: values.date.toISOString(),
      CustomerName: values.customerName,
      DelMethod: Number(values.deliveryMethod),
      CreatedBy: currentUser,
      Priority: Number(values.priority),
      Mode: "Multi",
      DeliveryAddress: deliveryAddress,
    };

    const stockItemsData = values.items.map((item) => {
      const stockItem = stockItems.find(
        (s) => s.StockLink.toString() === item.stockItem
      );

      return {
        DNN: dnn,
        StockCode: stockItem ? stockItem.Code : "",
        Item: stockItem ? stockItem.ucIIFullDescription : "",
        Price: item.price,
        Qty: item.qty,
      };
    });

    try {
      const deliveryNoteResponse = await fetch(
        "https://dkapi.totai.co.za:9191/toms/deliverynote/capturedelnote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([deliveryNoteData]),
        }
      );

      if (!deliveryNoteResponse.ok) {
        throw new Error("Failed to submit delivery note details");
      }

      const stockItemsResponse = await fetch(
        "https://dkapi.totai.co.za:9191/toms/deliverynote/capturestock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockItemsData),
        }
      );

      if (!stockItemsResponse.ok) {
        throw new Error("Failed to submit stock items");
      }

      alert("Delivery note submitted successfully");
      form.reset();
      setDnn(""); // Reset DNN
      setDeliveryAddress(""); // Reset Delivery Address
    } catch (error) {
      console.error("Error submitting delivery note:", error);
      alert("An error occurred while submitting the delivery note");
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Container>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={2} mb="md">
          Create Delivery Note
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <Text>Date: {form.values.date.toLocaleDateString()}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Priority"
              placeholder="Select priority"
              data={priorities}
              value={form.values.priority}
              onChange={(priority) => form.setFieldValue("priority", priority!)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Customer Name"
              placeholder="Enter customer name"
              value={form.values.customerName}
              onChange={(event) =>
                form.setFieldValue("customerName", event.currentTarget.value)
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Created by" value={currentUser} readOnly />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="DNN (Delivery Note Number)"
              value={dnn}
              onChange={(event) => setDnn(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Delivery Method"
              placeholder="Select delivery method"
              data={deliveryMethods}
              value={form.values.deliveryMethod}
              onChange={(deliveryMethod) =>
                form.setFieldValue("deliveryMethod", deliveryMethod!)
              }
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Delivery Address"
              placeholder="Enter delivery address"
              value={deliveryAddress}
              onChange={(event) =>
                setDeliveryAddress(event.currentTarget.value)
              }
            />
          </Grid.Col>
        </Grid>

        {form.values.items.map((item, index) => (
          <Group key={item.id} mt="sm">
            <Select
              searchable
              placeholder="Select stock item"
              data={stockItems.map((stock) => ({
                value: stock.StockLink.toString(),
                label: `${stock.Code} - ${stock.ucIIFullDescription}`,
              }))}
              value={item.stockItem}
              onChange={(stockItem) => {
                const items = [...form.values.items];
                items[index].stockItem = stockItem!;
                form.setFieldValue("items", items);
              }}
            />
            <NumberInput
              placeholder="Price"
              value={item.price}
              onChange={(price) => {
                const items = [...form.values.items];
                items[index].price = typeof price === "number" ? price : 0;
                form.setFieldValue("items", items);
              }}
            />
            <NumberInput
              placeholder="Qty"
              value={item.qty}
              onChange={(qty) => {
                const items = [...form.values.items];
                items[index].qty = typeof qty === "number" ? qty : 0;
                form.setFieldValue("items", items);
              }}
            />
            {index === form.values.items.length - 1 && (
              <Button color="green" onClick={addItem}>
                +
              </Button>
            )}
          </Group>
        ))}

        <Box mt="md" style={{ textAlign: "right" }}>
          <Button type="submit">Save Delivery Note</Button>
        </Box>
      </form>
    </Container>
  );
};

export default DeliveryNotePage;
