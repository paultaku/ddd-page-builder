import { redirect } from "next/navigation";

// The sites list is now part of the Dashboard (My Sites).
export default function SitesPage() {
  redirect("/dashboard");
}
