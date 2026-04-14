import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

function AnimatedTabIcon({
  focused,
  color,
  name,
}: {
  focused: boolean;
  color: string;
  name: keyof typeof Ionicons.glyphMap;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(focused ? 1.25 : 1),
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={26} color={color} />
    </Animated.View>
  );
}


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",

        tabBarActiveTintColor: "#F05221",
        tabBarInactiveTintColor: "#999",

        tabBarStyle: {
          backgroundColor: "#fff",
          height: "9%",
          borderTopWidth: 0,
          boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)",
        },

        tabBarItemStyle: {
          paddingVertical: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ color }) => (
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Home
            </Text>
          ),

tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color} name="home" />
          ),}} />

      <Tabs.Screen
        name="perfil"
        options={{
          tabBarLabel: ({ color }) => (
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Perfil
            </Text>
          ),

            tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              name="person-circle-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}
