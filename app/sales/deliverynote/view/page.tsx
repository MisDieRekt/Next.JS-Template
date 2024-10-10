import DeliveryNoteTable from "./DeliveryNoteTable";

const DeliveryNotePage = async () => {
  const response = await fetch(
    "https://dkapi.totai.co.za:9191/toms/deliverynote/check",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestDelNote: "GetProcessed" }),
      next: { revalidate: 60 }, // Revalidate data every 60 seconds
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch delivery notes");
  }

  const data = await response.json();

  return <DeliveryNoteTable initialData={data} />;
};

export default DeliveryNotePage;
