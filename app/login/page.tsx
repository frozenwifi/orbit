import type { Metadata } from "next";
import { SignIn } from "@/components/auth/SignIn";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Orbit Superadmin portal",
};

export default function LoginPage() {
  return <SignIn />;
}
