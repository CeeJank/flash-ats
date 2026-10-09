import { Host, Button } from '@expo/ui';
import { View, StyleSheet } from 'react-native';

export interface ButtonProps {
  label?: string;
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

export function CapturePhotoButton({ label, onPress }: ButtonProps) {
  return (
    <Host matchContents>
      <Button
        label={label}
        onPress={onPress}
        style={styles.captureButton}
      >
      </Button>
    </Host>
  )
}

const styles = StyleSheet.create({
  captureButton: {
    width: 10,
    height: 10,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "gray",
    backgroundColor: "white",
  }
})
