"use client";

import React, { useState } from "react";
import { TextInput, Button, Paper, Title } from "@mantine/core";
import { useRouter } from "next/navigation";

const SearchDeliveryNotePage: React.FC = () => {
  const router = useRouter();
  const [dnn, setDnn] = useState("");

  const handleSearch = () => {
    if (dnn) {
      router.push(`dispatch/dn/${dnn}`);
    }
  };

  return (
    <Paper style={{ padding: "20px", maxWidth: "500px", margin: "40px auto" }}>
      <Title order={3} style={{ marginBottom: "20px", textAlign: "center" }}>
        Search Delivery Note
      </Title>
      <TextInput
        label="DNN Number"
        placeholder="Enter DNN number"
        value={dnn}
        onChange={(event) => setDnn(event.currentTarget.value)}
        style={{ marginBottom: "20px" }}
      />
      <Button onClick={handleSearch} fullWidth>
        Search
      </Button>
    </Paper>
  );
};

export default SearchDeliveryNotePage;
