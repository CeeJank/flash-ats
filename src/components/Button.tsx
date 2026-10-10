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

export function ShutterButton({ onPress }: ButtonProps) {
  return (
    <Host matchContents style={styles.captureButtonContainer}>
      <Button
        style={styles.captureButton}
        onPress={onPress}
      >
      </Button>
    </Host>
  )
}

const styles = StyleSheet.create({
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "gray",
    backgroundColor: "white",
  },
  captureButtonContainer: {
    position:'absolute',
    top: '80%',
    left: '40%',
  }

})
