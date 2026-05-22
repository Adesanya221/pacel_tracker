import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, type AdminView } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminShipments } from "@/components/admin/AdminShipments";
import { AdminCreateShipment } from "@/components/admin/AdminCreateShipment";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ParcelTrace" },
      { name: "description", content: "Create and manage shipments." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [view, setView] = useState<AdminView>("dashboard");

  return (
    <AdminLayout activeView={view} onNavigate={setView}>
      {view === "dashboard" && <AdminDashboard onNavigate={setView} />}
      {view === "shipments" && <AdminShipments />}
      {view === "create" && <AdminCreateShipment onNavigate={setView} />}
    </AdminLayout>
  );
}
