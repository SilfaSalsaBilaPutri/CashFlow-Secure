import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Receipt,
  BarChart3,
  ChevronLeft,
  Store,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Data Customer", url: "/admin/customers", icon: Users },
  { title: "Menu Items", url: "/admin/menu", icon: UtensilsCrossed },
  { title: "Transaksi", url: "/admin/transactions", icon: Receipt },
  { title: "Laporan", url: "/admin/reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <div
          className={cn(
            "flex items-center gap-3 px-2 py-4",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Store className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground">Admin Panel</span>
              <span className="text-xs text-muted-foreground">
                Warung Barokah
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Kembali ke Kasir">
              <Link to="/">
                <ChevronLeft className="h-4 w-4" />
                <span>Kembali ke Kasir</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
