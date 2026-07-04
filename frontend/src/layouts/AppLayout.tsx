import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r hidden md:block">
        {/* Sidebar placeholder */}
        <div className="p-4 border-b font-bold">HRMS System</div>
        <nav className="p-4">Navigation</nav>
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6">
          <div>Header</div>
          <div>Profile/Theme</div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
