import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Button } from "../../../assets/components/Button";
import { Header } from "../../../assets/components/Header";
import { Input } from "../../../assets/components/Input";
import { typography } from "../../../assets/globalstyles/fonts";
import LogoExtenso from "../../../assets/images/LogoExtenso.png";

export default function EsqSenha1() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleEnviarCodigo = async (): Promise<void> => {
        const emailTrimmed = email?.trim();

        if (!emailTrimmed) {
            Alert.alert("Erro", "Informe seu e-mail.");
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                "http://localhost:8080/api/v1/usuario/recuperar-senha/enviar-codigo",
                null,
                { params: { email: emailTrimmed } }
            );

            await AsyncStorage.setItem("emailRecuperacao", emailTrimmed);
            Alert.alert("Sucesso", "Código enviado para seu e-mail.");
            router.push("/(auth)/VerificacaoEmail/esqsenha2");
        } catch (error: any) {
            console.error(error);
            Alert.alert("Erro", error.response?.data || "Erro ao enviar o código.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header>
                <Text style={typography.title}>Login</Text>
            </Header>

            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back-outline" size={24} color="black" />
            </Pressable>

            <View style={styles.logoarea}>
                <Image source={LogoExtenso} style={styles.mainlogo} />
            </View>

            <View style={styles.contentArea}>
                <View style={styles.textArea}>
                    <Text style={styles.mainTitle}>REDEFINIR SUA SENHA</Text>
                    <Text style={styles.subtitle}>
                        PREENCHA SEU E-MAIL E ENVIAREMOS UM CÓDIGO DE VERIFICAÇÃO PARA QUE VOCÊ POSSA CRIAR UMA NOVA SENHA.
                    </Text>
                </View>

                <View style={styles.inputsarea}>
                    <Input
                        label="Email*"
                        placeholder="Insira seu email aqui"
                        width="90%"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
            </View>

            <View style={styles.buttonarea}>
                <Button onPress={handleEnviarCodigo} width="90%">
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={typography.buttonText}>Enviar</Text>
                    )}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "space-between",
        paddingBottom: 30,
    },
    backButton: {
        position: "absolute",
        left: 25,
        top: 68,
        zIndex: 10,
    },
    logoarea: {
        justifyContent: "center",
        alignSelf: "center",
        marginVertical: 0,
    },
    mainlogo: {
        width: 440,
        height: 170,
        resizeMode: "contain",
    },
    contentArea: {
        width: "100%",
        paddingHorizontal: 24,
        marginTop: -30, // Margem negativa para puxar o texto em direção à logo
    },
    textArea: {
        marginBottom: 24,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 12,
        lineHeight: 30,
    },
    subtitle: {
        fontSize: 14,
        color: "#333",
        lineHeight: 22,
    },
    inputsarea: {
        width: "100%",
        alignItems: "center",
    },
    buttonarea: {
        width: "100%",
        alignItems: "center",
    },
});