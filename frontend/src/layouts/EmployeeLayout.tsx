import { Outlet } from "react-router-dom";

export function EmployeeLayout() {
  return (
    <div className="employee-layout">
      <Outlet />
    </div>
  );
}
