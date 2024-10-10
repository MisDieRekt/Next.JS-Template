import DeliveryNoteTable from "./DeliveryNoteTable";

const DeliveryNotePage = async () => {
  // Disable SSL verification for development purposes
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
    return <div>Error loading delivery notes. Please try again later.</div>;
  }
};


export default DeliveryNotePage;
