import { useState, useCallback } from "react";
import { Wallet, Receipt, TrendingUp } from "lucide-react";
import { MenuItem, OrderItem } from "@/types/transaction";
import { useTransactions } from "@/hooks/useTransactions";
import { Header } from "@/components/Warung/Header";
import { StatsCard } from "@/components/Warung/StatsCard";
import { MenuSection } from "@/components/Warung/MenuSection";
import { OrderPanel } from "@/components/Warung/OrderPanel";
import { TransactionList } from "@/components/Warung/TransactionList";
import { toast } from "@/hooks/use-toast";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

const Index = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    getTodayTransactions,
    getTodayTotal,
  } = useTransactions();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddItem = useCallback((item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((oi) => oi.menuItem.id === item.id);
      if (existing) {
        return prev.map((oi) =>
          oi.menuItem.id === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const handleRemoveItem = useCallback((menuItemId: string) => {
    setOrderItems((prev) => {
      const existing = prev.find((oi) => oi.menuItem.id === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((oi) =>
          oi.menuItem.id === menuItemId
            ? { ...oi, quantity: oi.quantity - 1 }
            : oi
        );
      }
      return prev.filter((oi) => oi.menuItem.id !== menuItemId);
    });
  }, []);

  const handleClearOrder = useCallback(() => {
    setOrderItems([]);
  }, []);

  const handleSubmitOrder = useCallback(
    async (paymentMethod: "tunai" | "transfer", customerName?: string) => {
      if (orderItems.length === 0) return;

      const total = orderItems.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      const transaction = await addTransaction(
        orderItems,
        paymentMethod,
        customerName
      );

      if (transaction) {
        setOrderItems([]);
        toast({
          title: "Transaksi Berhasil! 🎉",
          description: `Total ${formatPrice(total)} telah dicatat.`,
        });
      }
    },
    [orderItems, addTransaction]
  );

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      deleteTransaction(id);
      toast({
        title: "Transaksi Dihapus",
        description: "Transaksi telah berhasil dihapus.",
        variant: "destructive",
      });
    },
    [deleteTransaction]
  );

  const todayTransactions = getTodayTransactions();
  const todayTotal = getTodayTotal();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Pendapatan Hari Ini"
            value={formatPrice(todayTotal)}
            icon={Wallet}
            variant="primary"
          />
          <StatsCard
            title="Jumlah Transaksi"
            value={todayTransactions.length}
            icon={Receipt}
            description="Transaksi hari ini"
          />
          <StatsCard
            title="Rata-rata per Transaksi"
            value={
              todayTransactions.length > 0
                ? formatPrice(todayTotal / todayTransactions.length)
                : "Rp 0"
            }
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Pilih Menu
              </h2>
              <MenuSection
                orderItems={orderItems}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {/* Transaction History */}
            <TransactionList
              transactions={todayTransactions}
              onDelete={handleDeleteTransaction}
            />
          </div>

          {/* Order Panel */}
          <div className="lg:col-span-1">
            <OrderPanel
              orderItems={orderItems}
              onRemoveItem={handleRemoveItem}
              onClearOrder={handleClearOrder}
              onSubmit={handleSubmitOrder}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
