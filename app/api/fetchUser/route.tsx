import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function GET(req: NextRequest) {
  const response = await updateSession(req);

  if (response.headers.has('location')) {
    return NextResponse.redirect(response.headers.get('location') as string);
  }

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