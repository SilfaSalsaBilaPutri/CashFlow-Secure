import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/customers": "Data Customer",
  "/admin/menu": "Menu Items",
  "/admin/transactions": "Transaksi",
  "/admin/reports": "Laporan",
};

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
  const location = useLocation();
  const currentPage = breadcrumbMap[location.pathname] || title;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-card">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/admin">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {location.pathname !== "/admin" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 p-6 bg-background">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
