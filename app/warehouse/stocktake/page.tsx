"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

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
        const cameraId = devices[0].id;
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
    fetchStockInfo(decodedText, setStockInfo, setIsLoading, setError);
  };

  const handleError = (err: any) => {
    console.error("Error scanning barcode/QR code:", err);
  };

  return (
    <div>
      <h1>Scan Barcode/QR Code</h1>
      <div id={scannerId} style={{ width: "100%" }}></div>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {stockInfo && (
        <div>
          <h2>Stock Information</h2>
          <p>
            <strong>Stock Link:</strong> {stockInfo.StockLink}
          </p>
          <p>
            <strong>Code:</strong> {stockInfo.Code}
          </p>
          <p>
            <strong>Description:</strong> {stockInfo.Description_1}
          </p>
          <p>
            <strong>Full Description:</strong> {stockInfo.ucIIDesc1}
          </p>
          <p>
            <strong>Details:</strong> {stockInfo.ucIIDesc2}{" "}
            {stockInfo.ucIIDesc3}
          </p>
          <p>
            <strong>Item Cost:</strong> {stockInfo.ItemCost}
          </p>
          <p>
            <strong>Quantity On Hand:</strong> {stockInfo.QtyOnHand}
          </p>
          <p>
            <strong>Barcode:</strong> {stockInfo.Barcode}
          </p>
          <p>
            <strong>Export Price:</strong> {stockInfo.ExPr1}
          </p>
          <p>
            <strong>Import Price:</strong> {stockInfo.InPr1}
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
