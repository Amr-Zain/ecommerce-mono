import { Popover, PopoverTrigger, PopoverContent } from "@ecommerce/ui/components/popover";
import { Highlighter } from "lucide-react";
import { Button } from "@ecommerce/ui/components/button";

interface Props {
  onSelect: (color: string | null) => void;
}

const colors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#ddd"];

const HighlightColorPicker = ({ onSelect }: Props) => {
  return (
    <Popover>
      <PopoverTrigger >
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Highlighter size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1 flex items-center gap-1">
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => onSelect(color)}
            style={{
              backgroundColor: color,
            }}
            className="w-5 h-5 rounded-md cursor-pointer border border-gray-300 transition-transform hover:scale-110"
          />
        ))}
        <div
          onClick={() => onSelect(null)}
          title="Remove highlight"
          className="w-5 h-5 rounded-md cursor-pointer border border-gray-300 flex items-center justify-center text-xs transition-transform hover:scale-110"
        >
          ✕
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HighlightColorPicker;