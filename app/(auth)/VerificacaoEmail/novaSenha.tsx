import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

interface PasswordRule {
    label: string;
    test: (value: string) => boolean;
}

const passwordRules: PasswordRule[] = [
    { label: 'Letra maiúscula', test: (value = '') => /[A-Z]/.test(value) },
    { label: 'Letra minúscula', test: (value = '') => /[a-z]/.test(value) },
    { label: 'Número', test: (value = '') => /\d/.test(value) },
    { label: 'Pontuação', test: (value = '') => /[^A-Za-z0-9]/.test(value) },
];

const isStrongPassword = (value = ''): boolean => passwordRules.every((rule) => rule.test(value));

export default function NovaSenha() {
    const router = useRouter();
    const { codigo } = useLocalSearchParams<{ codigo: string }>();

    const [email, setEmail] = useState<string | null>(null);
    const [novaSenha, setNovaSenha] = useState<string>("");
    const [confirmarSenha, setConfirmarSenha] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [loadingSenha, setLoadingSenha] = useState<boolean>(false);

    useEffect(() => {
        async function getEmail(): Promise<void> {
            const storedEmail = await AsyncStorage.getItem("emailRecuperacao");
            setEmail(storedEmail);
        }
        getEmail();
    }, []);

    const alterarSenha = async (): Promise<void> => {
        if (!isStrongPassword(novaSenha)) {
            Alert.alert("Erro", "A senha precisa cumprir todos os requisitos de segurança.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        setLoadingSenha(true);
        try {
            await axios.post(
                "http://localhost:8080/api/v1/usuario/recuperar-senha/alterar-senha",
                null,
                {
                    params: {
                        email,
                        codigo,
                        novaSenha
                    }
                }
            );

            Alert.alert("Sucesso", "Senha alterada com sucesso!");
            await AsyncStorage.removeItem("emailRecuperacao");
            router.replace("/");
        } catch (error: any) {
            console.error(error);
            Alert.alert("Erro", error.response?.data || "Erro ao alterar senha.");
        } finally {
            setLoadingSenha(false);
        }
    };

    return (
        <View>
            <Text>Redefinição de senha</Text>

            <TextInput
                secureTextEntry={!showPassword}
                placeholder="Crie uma nova senha"
                value={novaSenha}
                onChangeText={setNovaSenha}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text>{showPassword ? "Ocultar" : "Mostrar"}</Text>
            </TouchableOpacity>

            {passwordRules.map((rule) => {
                const valid = rule.test(novaSenha);
                return (
                    <Text key={rule.label} style={{ color: valid ? 'green' : 'red' }}>
                        {valid ? "✓" : "✕"} {rule.label}
                    </Text>
                );
            })}

            <TextInput
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text>{showConfirmPassword ? "Ocultar" : "Mostrar"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={alterarSenha} disabled={loadingSenha}>
                <Text>{loadingSenha ? "ALTERANDO..." : "SALVAR SENHA"}</Text>
            </TouchableOpacity>
        </View>
    );
}