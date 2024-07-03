"use client";

import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

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
  const [hasFlash, setHasFlash] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        }
      );
      qrScanner.start();
      qrScannerRef.current = qrScanner;

      qrScanner.hasFlash().then((supported) => {
        setHasFlash(supported);
      });

      return () => {
        qrScanner.stop();
      };
    }
  }, [videoRef]);

  const handleScan = (data: string) => {
    setBarcode(data);
    fetchStockInfo(data, setStockInfo, setIsLoading, setError);
  };

  const toggleFlash = async () => {
    if (qrScannerRef.current) {
      if (flashOn) {
        await qrScannerRef.current.turnFlashOff();
        setFlashOn(false);
      } else {
        await qrScannerRef.current.turnFlashOn();
        setFlashOn(true);
      }
    }
  };

  return (
    <div>
      <h1>Scan Barcode/QR Code</h1>
      {hasFlash && (
        <button onClick={toggleFlash}>
          {flashOn ? "Turn Flash Off" : "Turn Flash On"}
        </button>
      )}
      <video ref={videoRef} style={{ width: "100%" }}></video>
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
