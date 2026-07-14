import { redirect } from "next/navigation";

// The pages list is now part of the Dashboard (My Pages).
export default function PagesPage() {
  redirect("/dashboard");
}
