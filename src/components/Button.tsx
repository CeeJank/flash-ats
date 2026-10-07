import { Host, Button } from '@expo/ui';

export interface ButtonProps {
  label: string;
  variant?: 'filled' | 'outlined' | 'text';
  disabled?: boolean;
  onPress?: () => void;
}

export function CapturePageButton({ label, variant, disabled, onPress}: ButtonProps) {
  return (
    <Host matchContents>
      <Button
        label={label}
        variant={variant}
        disabled={disabled}
        onPress={onPress}
      >
      </Button>
    </Host>
  )
}
