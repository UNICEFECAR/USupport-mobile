import { useTheme } from "@react-navigation/native";

export function useGetTheme() {
  const colors = useTheme().colors;
  const dark = useTheme().dark;
  const highContrast = useTheme().highContrast;

  return { colors, isDarkMode: dark, isHighContrast: highContrast };
}
