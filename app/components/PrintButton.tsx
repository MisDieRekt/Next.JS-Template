// app/components/PrintButton.tsx
import React from "react";
import { Button } from "@mantine/core";

const PrintButton: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return <Button onClick={handlePrint}>Print</Button>;
};

export default PrintButton;
