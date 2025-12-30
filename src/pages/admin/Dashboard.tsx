import { useEffect, useState } from "react";
import {
  Users,
  Receipt,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalCustomers: number;
  totalTransactions: number;
  totalRevenue: number;
  todayRevenue: number;
  todayTransactions: number;
  averageTransaction: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("*");

        if (error) throw error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTransactions = (transactions || []).filter((t) => {
          const tDate = new Date(t.created_at);
          tDate.setHours(0, 0, 0, 0);
          return tDate.getTime() === today.getTime();
        });

        const uniqueCustomers = new Set(
          (transactions || [])
            .filter((t) => t.customer_name)
            .map((t) => t.customer_name?.trim().toLowerCase())
        );

        const totalRevenue = (transactions || []).reduce(
          (sum, t) => sum + Number(t.total),
          0
        );
        const todayRevenue = todayTransactions.reduce(
          (sum, t) => sum + Number(t.total),
          0
        );

        setStats({
          totalCustomers: uniqueCustomers.size,
          totalTransactions: transactions?.length || 0,
          totalRevenue,
          todayRevenue,
          todayTransactions: todayTransactions.length,
          averageTransaction: transactions?.length
            ? totalRevenue / transactions.length
            : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statsCards = [
    {
      title: "Total Pendapatan",
      value: stats ? formatPrice(stats.totalRevenue) : "-",
      icon: Wallet,
      description: "Semua waktu",
      trend: "up",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pendapatan Hari Ini",
      value: stats ? formatPrice(stats.todayRevenue) : "-",
      icon: TrendingUp,
      description: `${stats?.todayTransactions || 0} transaksi`,
      trend: "up",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Transaksi",
      value: stats?.totalTransactions || 0,
      icon: Receipt,
      description: "Semua waktu",
      trend: "neutral",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Customer",
      value: stats?.totalCustomers || 0,
      icon: Users,
      description: "Customer unik",
      trend: "up",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Rata-rata Transaksi",
      value: stats ? formatPrice(stats.averageTransaction) : "-",
      icon: Receipt,
      description: "Per transaksi",
      trend: "neutral",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <AdminLayout title="Dashboard" description="Ringkasan data warung Anda">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          : statsCards.map((card, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trend === "up" && (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    )}
                    {card.trend === "down" && (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
