import { redirect } from "next/navigation";

// The account view is now part of the combined Dashboard (account + settings).
export default function AccountPage() {
  redirect("/dashboard");
}
