import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Whitelogo from "../assets/images/whitelogo.png";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)");
    }, 2500); // 2.5 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={Whitelogo} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F05221",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 780,
    height: 420,
    resizeMode: "contain",
  },

  text: {
    marginTop: 20,
    fontSize: 16,
  },
});
