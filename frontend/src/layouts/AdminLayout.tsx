import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="admin-layout border-2 border-primary/20 rounded-lg p-4">
      <div className="text-xs font-semibold text-primary mb-4 uppercase tracking-wider">Admin View</div>
      <Outlet />
    </div>
  );
}
