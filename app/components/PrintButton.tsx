// app/components/PrintButton.tsx
"use client";

import React from "react";
import { Button } from "@mantine/core";

interface PrintButtonProps {
  onClick: () => void;
}

const PrintButton: React.FC<PrintButtonProps> = ({ onClick }) => {
  return <Button onClick={onClick}>Print</Button>;
};

export default PrintButton;
