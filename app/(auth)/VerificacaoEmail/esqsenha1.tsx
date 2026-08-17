import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

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
        <View>
            <Text>REDEFINIR SUA SENHA</Text>
            <Text>PREENCHA SEU E-MAIL E ENVIAREMOS UM CÓDIGO DE VERIFICAÇÃO.</Text>

            <TextInput
                placeholder="Adicione seu Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity onPress={handleEnviarCodigo} disabled={loading}>
                <Text>{loading ? "ENVIANDO..." : "ENVIAR CÓDIGO"}</Text>
            </TouchableOpacity>
        </View>
    );
}
