import DeliveryNoteTable from "./DeliveryNoteTable";

const DeliveryNotePage = async () => {
  try {
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
      throw new Error(`Failed to fetch delivery notes: ${response.statusText}`);
    }

    const data = await response.json();
    return <DeliveryNoteTable initialData={data} />;
  } catch (error) {
    console.error("Error fetching delivery notes:", error);
    // You can render an error state if the fetch fails
    return <div>Error loading delivery notes. Please try again later.</div>;
  }
};

export default DeliveryNotePage;
