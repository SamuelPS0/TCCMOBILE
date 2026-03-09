import { Pressable, StyleSheet } from "react-native";

interface IButtonProps {
  children: React.ReactNode;
  width?: number | string; // permite largura customizada
  variant?: "primary" | "secondary";
  onPress?: () => void;
}

export const Button = ({ children, width = "100%", variant = "primary", onPress }: IButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        { width }, // aplica largura personalizada
        pressed && styles.buttonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: "#F05221",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  secondary: {
    backgroundColor: "#FFC8B7",
    color: "#F05221",
    
  },
  buttonPressed: {
    opacity: 0.5,
  },
});