import Ionicons from "@expo/vector-icons/Ionicons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname()?.toLowerCase() || ""; // garante que seja minúsculo

  // Ativa o "Home" se estiver na raiz ou em accCreate
  const isHome = pathname.includes("/tabs") || pathname.includes("acccreate");

  // Lista das páginas que pertencem ao Perfil
  const perfilPages = [
    "/telas/personalinfo",
    "/telas/workinfo",
    "/tabs/perfil",
  ];

  // Verifica se o pathname atual está em perfilPages
  const isPerfil = perfilPages.some((path) => pathname.includes(path));

  const activeColor = "#F05221";
  const inactiveColor = "#999";

  function TabItem({
    icon,
    label,
    active,
    onPress,
  }: {
    icon: any;
    label: string;
    active: boolean;
    onPress: () => void;
  }) {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(active ? 1.25 : 1) }],
    }));

    return (
      <Pressable onPress={onPress} style={{ alignItems: "center", gap: 2 }}>
        <Animated.View style={animatedStyle}>
          <Ionicons
            name={icon}
            size={26}
            color={active ? activeColor : inactiveColor}
          />
        </Animated.View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: active ? activeColor : inactiveColor,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        backgroundColor: "#fff",
        height: 70,
        borderTopWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
        boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)",
      }}
    >
      <TabItem
        icon="home"
        label="Home"
        active={isHome}
        onPress={() => router.push("/(tabs)")}
      />
      <TabItem
        icon="person-circle-outline"
        label="Perfil"
        active={isPerfil}
        onPress={() => router.push("/(telas)/personalinfo")}
      />
    </View>
  );
}
