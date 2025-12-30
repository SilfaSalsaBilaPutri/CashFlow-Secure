import { useState } from "react";
import { ShoppingCart, Banknote, CreditCard, Trash2 } from "lucide-react";
import { OrderItem } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OrderPanelProps {
  orderItems: OrderItem[];
  onRemoveItem: (menuItemId: string) => void;
  onClearOrder: () => void;
  onSubmit: (
    paymentMethod: "tunai" | "transfer",
    customerName?: string
  ) => void;
}

export function OrderPanel({
  orderItems,
  onRemoveItem,
  onClearOrder,
  onSubmit,
}: OrderPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "transfer">(
    "tunai"
  );
  const [customerName, setCustomerName] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const total = orderItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handleSubmit = () => {
    onSubmit(paymentMethod, customerName || undefined);
    setCustomerName("");
  };

  return (
    <Card className="shadow-card sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Pesanan Saat Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada pesanan
          </p>
        ) : (
          <>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {orderItems.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {item.menuItem.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x {formatPrice(item.menuItem.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-primary">
                      {formatPrice(item.menuItem.price * item.quantity)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onRemoveItem(item.menuItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-foreground">
                  Total
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName" className="text-sm">
                    Nama Pelanggan (Opsional)
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">Metode Pembayaran</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) =>
                      setPaymentMethod(v as "tunai" | "transfer")
                    }
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tunai" id="tunai" />
                      <Label
                        htmlFor="tunai"
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <Banknote className="h-4 w-4" />
                        Tunai
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label
                        htmlFor="transfer"
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        Transfer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClearOrder}
                  >
                    Batal
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit}>
                    Simpan Transaksi
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
