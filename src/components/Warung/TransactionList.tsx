import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Receipt, Trash2, Banknote, CreditCard } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  onDelete,
}: TransactionListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (transactions.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada transaksi hari ini</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Riwayat Transaksi Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="p-4 rounded-xl bg-secondary/30 border border-border animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-foreground">
                      #{transaction.id.slice(-6)}
                    </span>
                    {transaction.customerName && (
                      <span className="text-sm text-muted-foreground">
                        • {transaction.customerName}
                      </span>
                    )}
                    <Badge
                      variant={
                        transaction.paymentMethod === "tunai"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {transaction.paymentMethod === "tunai" ? (
                        <>
                          <Banknote className="h-3 w-3 mr-1" />
                          Tunai
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3 w-3 mr-1" />
                          Transfer
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {transaction.items.map((item, i) => (
                      <span key={item.menuItem.id}>
                        {item.quantity}x {item.menuItem.name}
                        {i < transaction.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(transaction.createdAt), "HH:mm", {
                        locale: id,
                      })}
                    </span>
                    <span className="font-bold text-primary">
                      {formatPrice(transaction.total)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(transaction.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
