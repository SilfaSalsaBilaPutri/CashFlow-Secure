import { Plus, Minus } from "lucide-react";
import { MenuItem } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
}: MenuItemCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={`p-4 transition-all duration-200 shadow-card hover:shadow-warm ${
        quantity > 0 ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {item.name}
          </h3>
          <p className="text-sm font-medium text-primary">
            {formatPrice(item.price)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quantity > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onRemove}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-semibold text-foreground">
                {quantity}
              </span>
            </>
          )}
          <Button size="icon" className="h-8 w-8 rounded-full" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
