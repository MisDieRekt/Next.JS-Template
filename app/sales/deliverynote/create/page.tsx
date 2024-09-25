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
  items: Array<{ id: number; stockItem: string; price: number }>;
}

interface Customer {
  id: string;
  name: string;
}

interface StockItem {
  StockLink: number;
  Code: string; // Added Code property
  ucIIFullDescription: string;
}

interface CurrentUser {
  name: string;
}

const DeliveryNotePage: React.FC = () => {
  const form = useForm<FormValues>({
    initialValues: {
      date: new Date(),
      priority: "Normal",
      customerName: "",
      createdBy: "",
      dnn: "",
      deliveryMethod: "",
      items: [{ id: 1, stockItem: "", price: 0 }],
    },
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");

  useEffect(() => {
    const fetchCustomers = () => {
      return new Promise<Customer[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: "1", name: "Customer A" },
            { id: "2", name: "Customer B" },
            { id: "3", name: "Customer C" },
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
            Code: item.Code, // Included Code here
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
      { id: form.values.items.length + 1, stockItem: "", price: 0 },
    ]);
  };

  return (
    <Container>
      <form>
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
              data={["URGENT!", "High", "Normal"]}
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
              data={["Method 1", "Method 2", "Method 3"]}
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
            <Button color="green" onClick={addItem}>
              +
            </Button>
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
