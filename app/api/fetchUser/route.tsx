// app/api/fetchUser/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.json({ user });
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
