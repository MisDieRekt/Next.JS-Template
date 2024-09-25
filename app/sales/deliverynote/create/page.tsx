"use client";

import React, { useState, useEffect } from "react";
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
  items: Array<{ id: number; stockItem: string; price: number; qty: number }>;
}

interface Customer {
  id: string;
  name: string;
  AccCode: string;
}

interface StockItem {
  StockLink: number;
  Code: string;
  ucIIFullDescription: string;
}

interface CurrentUser {
  name: string;
}

const DeliveryNotePage: React.FC = () => {
  const form = useForm<FormValues>({
    initialValues: {
      date: new Date(),
      priority: "3", // Default to "Normal"
      customerName: "",
      createdBy: "",
      dnn: "",
      deliveryMethod: "1",
      items: [{ id: 1, stockItem: "", price: 0, qty: 0 }],
    },
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");

  // Mappings for priorities and delivery methods
  const priorities = [
    { value: "1", label: "URGENT!" },
    { value: "2", label: "High" },
    { value: "3", label: "Normal" },
  ];

  const deliveryMethods = [
    { value: "1", label: "Method 1" },
    { value: "2", label: "Method 2" },
    { value: "3", label: "Method 3" },
  ];

  useEffect(() => {
    const fetchCustomers = () => {
      return new Promise<Customer[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: "1", name: "Customer A", AccCode: "ACC123" },
            { id: "2", name: "Customer B", AccCode: "ACC124" },
            { id: "3", name: "Customer C", AccCode: "ACC125" },
          ]);
        }, 1000);
      });
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
          console.log("Stock items data:", data);
          const filteredData = data.filter(
            (item: any) => item.ucIIFullDescription !== null
          );
          return filteredData.map((item: any) => ({
            StockLink: item.StockLink,
            Code: item.Code, // Include Code here
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

    const fetchCurrentUser = () => {
      return new Promise<CurrentUser>((resolve) => {
        setTimeout(() => {
          resolve({ name: "John Doe" });
        }, 1000);
      });
    };

    fetchCustomers().then((data) => setCustomers(data));
    fetchStockItems().then((data) => setStockItems(data));
    fetchCurrentUser().then((data) => setCurrentUser(data.name));
  }, []);

  const addItem = () => {
    form.setFieldValue("items", [
      ...form.values.items,
      { id: form.values.items.length + 1, stockItem: "", price: 0, qty: 0 },
    ]);
  };

  const handleSubmit = async (values: FormValues) => {
    // Find the selected customer
    const selectedCustomer = customers.find(
      (c) => c.id === values.customerName
    );

    const deliveryNoteData = {
      DNN: values.dnn,
      Chrono: values.date.toISOString(),
      CustomerName: selectedCustomer ? selectedCustomer.name : "",
      AccCode: selectedCustomer ? selectedCustomer.AccCode : "",
      DelMethod: Number(values.deliveryMethod),
      CreatedBy: currentUser,
      Priority: Number(values.priority),
      Mode: "Multi",
    };

    // Build stock items data
    const stockItemsData = values.items.map((item) => {
      const stockItem = stockItems.find(
        (s) => s.StockLink.toString() === item.stockItem
      );

      return {
        DNN: values.dnn,
        StockCode: stockItem ? stockItem.Code : "",
        Item: stockItem ? stockItem.ucIIFullDescription : "",
        Price: item.price,
        Qty: item.qty,
      };
    });

    try {
      // Send delivery note details
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

      // Send stock items
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

      // If both requests succeeded
      alert("Delivery note submitted successfully");
      // Optionally reset the form
      form.reset();
    } catch (error) {
      console.error("Error submitting delivery note:", error);
      alert("An error occurred while submitting the delivery note");
    }
  };

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
            <Select
              label="Customer Name"
              placeholder="Select customer"
              data={customers.map((customer) => ({
                value: customer.id,
                label: customer.name,
              }))}
              value={form.values.customerName}
              onChange={(customerName) =>
                form.setFieldValue("customerName", customerName!)
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Created by" value={currentUser} readOnly />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="DNN (Delivery Note Number)"
              value={form.values.dnn}
              onChange={(event) =>
                form.setFieldValue("dnn", event.currentTarget.value)
              }
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
        </Grid>

        {form.values.items.map((item, index) => (
          <Group key={item.id} mt="sm">
            <Select
              searchable
              placeholder="Select stock item"
              data={stockItems.map((stock) => ({
                value: stock.StockLink.toString(),
                label: `${stock.Code} - ${stock.ucIIFullDescription}`, // Updated label
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
