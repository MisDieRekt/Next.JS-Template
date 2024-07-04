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

const postStockTake = async (
  batchNo: string,
  chrono: string,
  stkCode: string,
  stkItem: string,
  count: number
) => {
  try {
    const response = await fetch("/toms/warehouse/stocktake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BatchNo: batchNo,
        Chrono: chrono,
        StkCode: stkCode,
        StkItem: stkItem,
        Count: count,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    console.log("Stock take successful:", data);
  } catch (error) {
    console.error("Failed to post stock take:", error);
  }
};

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [lastSuccessfulScan, setLastSuccessfulScan] =
    useState<StockInfo | null>(null);
  const [quantity, setQuantity] = useState<number | string>("");
  const [reference, setReference] = useState<string>("");
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
              aspectRatio: 1.0,
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

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(event.target.value);
  };

  const handleReferenceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setReference(event.target.value);
  };

  const handleCaptureStock = () => {
    if (stockInfo) {
      const batchNo = reference;
      const chrono = new Date().toISOString();
      const count = Number(quantity);
      const stkCode = stockInfo.Code;
      const stkItem = stockInfo.Description_1;

      postStockTake(batchNo, chrono, stkCode, stkItem, count);

      console.log("Captured stock:", {
        ...stockInfo,
        quantity,
        reference,
      });
    } else {
      console.error("No stock information available to capture.");
    }
  };

  return (
    <div className="container">
      <div className="scanner-section">
        <h1>Scan Barcode/QR Code</h1>
        <div id={scannerId} className="scanner"></div>
      </div>
      <div className="info-section">
        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {stockInfo && (
          <div className="stock-info">
            <h2>Stock Information</h2>
            {/* <p>
              <strong>Stock Link:</strong> {stockInfo.StockLink}
            </p> */}
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
            {/* <p>
              <strong>Item Cost:</strong> {stockInfo.ItemCost}
            </p> */}
            {/* <p>
              <strong>Quantity On Hand:</strong> {stockInfo.QtyOnHand}
            </p> */}
            <p>
              <strong>Barcode:</strong> {stockInfo.Barcode}
            </p>
            {/* <p>
              <strong>Export Price:</strong> {stockInfo.ExPr1}
            </p> */}
            {/* <p>
              <strong>Import Price:</strong> {stockInfo.InPr1}
            </p> */}
          </div>
        )}
      </div>
      <div className="input-section">
        <label htmlFor="quantity">Quantity</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
        />
        <label htmlFor="reference">Reference</label>
        <input
          type="text"
          id="reference"
          value={reference}
          onChange={handleReferenceChange}
        />
        <button onClick={handleCaptureStock}>Capture Stock</button>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px;
        }
        .scanner-section {
          margin-bottom: 20px;
          width: 100%;
          max-width: 300px;
        }
        .scanner {
          width: 100%;
          height: auto;
          max-height: 300px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .input-section {
          width: 100%;
          max-width: 300px;
          display: flex;
          flex-direction: column;
        }
        .input-section label {
          margin-top: 10px;
        }
        .input-section input {
          width: 100%;
          padding: 8px;
          margin-top: 10px;
        }
        .input-section button {
          width: 100%;
          padding: 10px;
          margin-top: 20px;
          background-color: red;
          color: white;
          border: none;
          border-radius: 5px;
        }
        .info-section {
          margin-top: 20px;
          width: 100%;
          max-width: 300px;
        }
        .stock-info {
          text-align: left;
          margin-top: 20px;
        }
        @media (max-width: 600px) {
          .scanner-section,
          .input-section,
          .info-section {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
