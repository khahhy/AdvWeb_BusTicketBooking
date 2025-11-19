import { Outlet } from "react-router-dom";
import { AdminHeader, AdminSidebar } from "@/components/admin";

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-950 p-4 gap-4 overflow-hidden">
      <AdminSidebar isCollapsed={true} />

      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />

        <div className="flex-1 mt-4 rounded-lg shadow-sm bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          <main className="flex-1 overflow-y-auto lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
