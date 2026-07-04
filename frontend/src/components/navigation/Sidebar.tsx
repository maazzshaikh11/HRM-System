import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { MAIN_NAVIGATION, type NavItem } from "@/constants/navigation"

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
}

export function Sidebar({ className, isCollapsed = false }: SidebarProps) {
  const location = useLocation()

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <div
          className={cn(
            "flex items-center gap-2 font-bold text-foreground",
            isCollapsed && "justify-center w-full"
          )}
        >
          <div className="h-7 w-7 flex-shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            H
          </div>
          {!isCollapsed && (
            <span className="truncate text-sm">Enterprise HRMS</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium">
          {MAIN_NAVIGATION.map((item: NavItem) => {
            const isActive = location.pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                to={item.href}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-muted hover:text-primary",
                  isActive
                    ? "bg-muted text-primary font-semibold"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
