import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const COLOR_PALETTE = [
  '#64748b', '#ef4444', '#f97316', '#eab308', '#84cc16', 
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "h-6 w-6 rounded-full border flex items-center justify-center",
            value === color && "ring-2 ring-offset-2 ring-ring"
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="h-4 w-4 text-white" />}
        </button>
      ))}
    </div>
  );
};