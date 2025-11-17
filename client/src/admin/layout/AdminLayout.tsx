import { Outlet } from "react-router-dom";
import { AdminHeader, AdminSidebar } from "@/components/admin";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-950 p-4 gap-4">
      <AdminSidebar isCollapsed={true} />

      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto rounded-lg shadow-sm bg-white dark:bg-gray-900 mt-4 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
