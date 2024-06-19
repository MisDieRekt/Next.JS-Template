// /app/signup/page.tsx
import SignUp from "@/components/Signup";

export default function SignUpPage({ searchParams }: { searchParams: { message: string } }) {
  return <SignUp searchParams={searchParams} />;
}
