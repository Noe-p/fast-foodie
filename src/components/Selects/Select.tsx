import {
  Select as ShSelect,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from '../ui/select';
import { cn } from '@/services/utils';

interface SelectProps {
  className?: string;
  onChange: (value: string) => void;
  value: string;
  label?: string;
  placeholder?: string;
  items: { label: string; value: string }[];
}

export function Select(props: SelectProps): JSX.Element {
  const { className, onChange, value, placeholder, label, items } = props;

  return (
    <ShSelect onValueChange={(v) => onChange(v)} value={value}>
      <SelectTrigger className={cn('w-[180px] text-muted', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </ShSelect>
  );
}
