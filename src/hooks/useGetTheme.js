import { useTheme } from "@react-navigation/native";

export function useGetTheme() {
  const colors = useTheme().colors;
  const dark = useTheme().dark;

  return { colors, isDarkMode: dark };
}
