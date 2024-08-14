"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import { useRouter } from "next/navigation";

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
  count: number,
  name: string
) => {
  const payload = {
    BatchNo: batchNo,
    Chrono: chrono,
    StkCode: stkCode,
    StkItem: stkItem,
    Count: count,
    name: name,
  };

  console.log("Sending to API:", payload);

  try {
    const response = await fetch(
      "https://dkapi.totai.co.za:9191/toms/warehouse/stocktake",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    console.log("Stock take successful:", data);
    return true;
  } catch (error) {
    console.error("Failed to post stock take:", error);
    return false;
  }
};

const fetchReference = async (
  setReference: (ref: string) => void,
  setError: (error: string | null) => void
) => {
  try {
    const response = await fetch(
      "https://dkapi.totai.co.za:9191/toms/warehouse/stocktake/ref",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ RefCheck: "refcheck" }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reference: " + response.statusText);
    }

    const data = await response.json();
    if (data.length > 0) {
      setReference(data[0].StockTakeRef);
    }
  } catch (error: any) {
    console.error("Failed to fetch reference:", error);
    setError(
      "Failed to fetch reference: " +
        (error.response ? error.response.data.message : error.message)
    );
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
  const [userName, setUserName] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "html5qr-code-scanner";
  const [cameraIndex, setCameraIndex] = useState<number>(0);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/fetchUser");
        const result = await response.json();
        if (response.ok) {
          console.log("User data:", result.user); // Log user data for debugging
          setUserName(result.user.email); // or result.user.name if available
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      }
    };

    fetchUser();
    fetchReference(setReference, setError);

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
    }
    const html5QrCode = html5QrCodeRef.current;

    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        setCameras(devices);
        startScanner(devices[0].id);
      }
    });

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch((err) => console.error("Unable to stop scanning", err));
      }
    };
  }, [router]);

  useEffect(() => {
    fetchReference(setReference, setError);
  }, []); // Ensure fetchReference is called on mount and on refresh

  const startScanner = (cameraId: string) => {
    if (!html5QrCodeRef.current) {
      return;
    }
    html5QrCodeRef.current
      .start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleScan,
        handleError
      )
      .catch((err) => {
        console.error("Unable to start scanning", err);
      });
  };

  const handleScan = (decodedText: string) => {
    setBarcode(decodedText);
    fetchStockInfo(
      decodedText,
      (data) => {
        setStockInfo(data);
        setLastSuccessfulScan(data);
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

  const handleCaptureStock = async () => {
    if (lastSuccessfulScan && userName) {
      const batchNo = reference;
      const chrono = new Date().toISOString();
      const count = Number(quantity);
      const stkCode = lastSuccessfulScan.Code;
      const stkItem = lastSuccessfulScan.Description_1;

      console.log("Using userName for stock take:", userName);

      const success = await postStockTake(
        batchNo,
        chrono,
        stkCode,
        stkItem,
        count,
        userName
      );

      if (success) {
        // Clear form values and reset state after successful submission
        setQuantity("");
        fetchReference(setReference, setError); // Fetch new reference after submission
        setStockInfo(null);
        setBarcode(null);
        setLastSuccessfulScan(null);
      }

      console.log("Captured stock:", {
        BatchNo: batchNo,
        Chrono: chrono,
        StkCode: stkCode,
        StkItem: stkItem,
        Count: count,
        Name: userName,
      });
    } else {
      console.error("No stock information available to capture.");
    }
  };

  const toggleCamera = () => {
    if (cameras.length > 1) {
      const newIndex = (cameraIndex + 1) % cameras.length;
      setCameraIndex(newIndex);
      const newCameraId = cameras[newIndex].id;

      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            startScanner(newCameraId);
          })
          .catch((err) => console.error("Unable to stop scanning", err));
      }
    }
  };

  return (
    <div className="container">
      <div className="scanner-section">
        <button className="toggle-button" onClick={toggleCamera}>
          Toggle Camera
        </button>
        <h1>Scan Barcode/QR Code</h1>
        <div id={scannerId} className="scanner"></div>
      </div>
      <div className="info-section">
        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {stockInfo && (
          <div className="stock-info">
            <h2>Stock Information</h2>
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
              <strong>Barcode:</strong> {stockInfo.Barcode}
            </p>
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
        <button className="button" onClick={handleCaptureStock}>
          Capture Stock
        </button>
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
          text-align: center;
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
          background-color: blue;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.3s;
        }
        .input-section button:active {
          background-color: darkblue;
          transform: scale(0.95);
        }
        .input-section button:focus {
          outline: none;
        }
        .toggle-button {
          background-color: magenta;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.3s;
        }
        .toggle-button:active {
          background-color: darkmagenta;
          transform: scale(0.95);
        }
        .toggle-button:focus {
          outline: none;
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