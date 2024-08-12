import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BarcodeScanner from "@/components/BarcodeScannerSecond";

export default async function StocktakePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return <BarcodeScanner />;
}
