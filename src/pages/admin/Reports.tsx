import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DailyData {
  date: string;
  revenue: number;
  transactions: number;
}

interface PaymentMethodData {
  name: string;
  value: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))"];

const AdminReports = () => {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Group by date for last 7 days
        const last7Days = new Map<
          string,
          { revenue: number; transactions: number }
        >();
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          last7Days.set(dateStr, { revenue: 0, transactions: 0 });
        }

        let tunaiCount = 0;
        let transferCount = 0;

        (data || []).forEach((t) => {
          const dateStr = new Date(t.created_at).toISOString().split("T")[0];
          if (last7Days.has(dateStr)) {
            const existing = last7Days.get(dateStr)!;
            existing.revenue += Number(t.total);
            existing.transactions += 1;
          }

          if (t.payment_method === "tunai") {
            tunaiCount++;
          } else {
            transferCount++;
          }
        });

        const dailyDataArray: DailyData[] = [];
        last7Days.forEach((value, key) => {
          dailyDataArray.push({
            date: new Intl.DateTimeFormat("id-ID", {
              weekday: "short",
              day: "numeric",
            }).format(new Date(key)),
            revenue: value.revenue,
            transactions: value.transactions,
          });
        });

        setDailyData(dailyDataArray);
        setPaymentData([
          { name: "Tunai", value: tunaiCount },
          { name: "Transfer", value: transferCount },
        ]);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}jt`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}rb`;
    }
    return price.toString();
  };

  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalTransactions = dailyData.reduce(
    (sum, d) => sum + d.transactions,
    0
  );

  return (
    <AdminLayout title="Laporan" description="Analisis data penjualan">
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendapatan 7 Hari Terakhir
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dari {totalTransactions} transaksi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rata-rata Harian
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(totalRevenue / 7)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per hari</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Pendapatan 7 Hari Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis tickFormatter={formatPrice} className="text-xs" />
                      <Tooltip
                        formatter={(value: number) =>
                          new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(value)
                        }
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {paymentData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {paymentData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
