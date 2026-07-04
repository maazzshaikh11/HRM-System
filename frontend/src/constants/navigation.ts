import type { ComponentType } from "react"
import { LayoutDashboard, Users, Calendar, Clock, DollarSign, Settings, Bell } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles?: ("Admin" | "Employee")[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/employee",
    icon: Users,
    roles: ["Admin"],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
  },
  {
    title: "Leave",
    href: "/leave",
    icon: Calendar,
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: DollarSign,
  },
  {
    title: "Notifications",
    href: "/notification",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  }
];
