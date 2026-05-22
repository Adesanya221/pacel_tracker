import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { AdminLayout, type AdminView } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminShipments } from "@/components/admin/AdminShipments";
import { AdminCreateShipment } from "@/components/admin/AdminCreateShipment";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  useDocumentTitle("Admin — ParcelTrace");
  const [view, setView] = useState<AdminView>("dashboard");

  return (
    <AdminLayout activeView={view} onNavigate={setView}>
      {view === "dashboard" && <AdminDashboard onNavigate={setView} />}
      {view === "shipments" && <AdminShipments />}
      {view === "create" && <AdminCreateShipment onNavigate={setView} />}
    </AdminLayout>
  );
}
