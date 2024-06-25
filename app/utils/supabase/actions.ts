// app/utils/supabase/actions.ts
"use server";

import { createClient } from "./server";
import { redirect } from "next/navigation";

export const signOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
};
