"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  TextInput,
  NumberInput,
  Button,
  Box,
  Text,
  Loader,
  Alert,
} from "@mantine/core";

interface StockInfo {
  StockLink: number;
  Code: string;
  Description_1: string;
  ucIIDesc1: string;
  ucIIDesc2: string;
  ucIIDesc3: string;
  ItemCost: number;
  QtyOnHand: number;
  ExPr1: number;
  InPr1: number;
  Barcode: string;
}

const fetchStockInfo = async (
  barcode: string,
  setStockInfo: (data: StockInfo) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  setIsLoading(true);
  try {
    const response = await fetch(
      "https://dkapi.totai.co.za:9191/sage/stock/check/bybarcode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Barcode: barcode }),
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data: StockInfo[] = await response.json();
    setStockInfo(data[0]);
    setIsLoading(false);
  } catch (error: any) {
    console.error("Failed to fetch stock info:", error);
    setError(
      "Failed to fetch stock info: " +
        (error.response ? error.response.data.message : error.message)
    );
    setIsLoading(false);
  }
};

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [lastSuccessfulScan, setLastSuccessfulScan] =
    useState<StockInfo | null>(null);
  const [stockTakeReference, setStockTakeReference] = useState<string>("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "html5qr-code-scanner";

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
    }
    const html5QrCode = html5QrCodeRef.current;

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        const rearCamera =
          devices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || devices[0];
        const cameraId = rearCamera.id;
        html5QrCode
          .start(
            cameraId,
            {
              fps: 10, // Optional, frame per second for qr code scanning
              qrbox: { width: 250, height: 250 }, // Optional, if you want bounded box UI
            },
            handleScan,
            handleError
          )
          .catch((err) => {
            console.error("Unable to start scanning", err);
          });
      }
    });

    return () => {
      html5QrCode
        .stop()
        .catch((err) => console.error("Unable to stop scanning", err));
    };
  }, []);

  const handleScan = (decodedText: string) => {
    setBarcode(decodedText);
    fetchStockInfo(
      decodedText,
      (data) => {
        setStockInfo(data);
        setLastSuccessfulScan(data); // Store the last successful scan
      },
      setIsLoading,
      setError
    );
  };

  const handleError = (err: any) => {
    console.error("Error scanning barcode/QR code:", err);
  };

  const handleCaptureStock = () => {
    // Logic to capture stock with the quantity
    console.log("Stock captured with quantity:", quantity);
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "20px",
      }}
    >
      <Text size="xl" fw={700} mb="md">
        Scan Barcode/QR Code
      </Text>
      <div
        id={scannerId}
        style={{
          width: "300px",
          height: "300px",
          marginBottom: "20px",
          zIndex: 1,
        }}
      ></div>
      <TextInput
        label="Stock Take Reference"
        value={stockTakeReference}
        onChange={(event) => setStockTakeReference(event.currentTarget.value)}
        style={{ marginBottom: "20px", zIndex: 0 }}
      />
      {isLoading && <Loader size="sm" />}
      {error && (
        <Alert color="red" style={{ marginBottom: "20px" }}>
          {error}
        </Alert>
      )}
      {stockInfo && (
        <Box style={{ textAlign: "left", marginBottom: "20px" }}>
          <Text fw={700}>Stock Information</Text>
          <Text>
            <strong>Stock Link:</strong> {stockInfo.StockLink}
          </Text>
          <Text>
            <strong>Code:</strong> {stockInfo.Code}
          </Text>
          <Text>
            <strong>Description:</strong> {stockInfo.Description_1}
          </Text>
          <Text>
            <strong>Full Description:</strong> {stockInfo.ucIIDesc1}
          </Text>
          <Text>
            <strong>Details:</strong> {stockInfo.ucIIDesc2}{" "}
            {stockInfo.ucIIDesc3}
          </Text>
          <Text>
            <strong>Item Cost:</strong> {stockInfo.ItemCost}
          </Text>
          <Text>
            <strong>Quantity On Hand:</strong> {stockInfo.QtyOnHand}
          </Text>
          <Text>
            <strong>Barcode:</strong> {stockInfo.Barcode}
          </Text>
          <Text>
            <strong>Export Price:</strong> {stockInfo.ExPr1}
          </Text>
          <Text>
            <strong>Import Price:</strong> {stockInfo.InPr1}
          </Text>
        </Box>
      )}
      <NumberInput
        label="Quantity"
        value={quantity}
        onChange={(value) => setQuantity(value === "" ? "" : Number(value))}
        style={{ marginBottom: "20px", width: "100%" }}
      />
      <Button onClick={handleCaptureStock} fullWidth>
        Capture Stock
      </Button>
    </Box>
  );
};

export default BarcodeScanner;
