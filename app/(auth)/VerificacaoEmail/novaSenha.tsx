import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { Button } from "../../../assets/components/Button";
import {
    API_ENDPOINTS,
    formatApiError,
    globalapi,
} from "../../../assets/api/globalapi";
import { Header } from "../../../assets/components/Header";
import { typography } from "../../../assets/globalstyles/fonts";

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
            await globalapi.post(
                API_ENDPOINTS.passwordReset.change,
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
            Alert.alert("Erro", formatApiError(error));
        } finally {
            setLoadingSenha(false);
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

            <View style={styles.contentArea}>
                <View style={styles.textArea}>
                    <Text style={styles.mainTitle}>
                        REDEFINIÇÃO DE SENHA
                    </Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Digite a nova senha</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            placeholder="Insira sua senha aqui"
                            placeholderTextColor="#A0A0A0"
                            value={novaSenha}
                            onChangeText={setNovaSenha}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.rulesGrid}>
                    {passwordRules.map((rule) => {
                        const valid = rule.test(novaSenha);
                        return (
                            <View 
                                key={rule.label} 
                                style={[
                                    styles.ruleBadge, 
                                    { backgroundColor: valid ? '#e8f5e9' : '#fbe9e7' }
                                ]}
                            >
                                <Ionicons 
                                    name={valid ? "checkmark-circle" : "close-circle"} 
                                    size={16} 
                                    color={valid ? "#2e7d32" : "#d32f2f"} 
                                />
                                <Text 
                                    style={[
                                        styles.ruleText, 
                                        { color: valid ? '#2e7d32' : '#d32f2f' }
                                    ]}
                                >
                                    {rule.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirme a nova senha</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={!showConfirmPassword}
                            placeholder="Insira sua senha aqui"
                            placeholderTextColor="#A0A0A0"
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                        />
                        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                        </Pressable>
                    </View>
                </View>
            </View>

            <View style={styles.buttonarea}>
                <Button onPress={alterarSenha} width="90%" disabled={loadingSenha}>
                    {loadingSenha ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={typography.buttonText}>SALVAR SENHA</Text>
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
    contentArea: {
        width: "100%",
        paddingHorizontal: 24,
        marginTop: 20,
    },
    textArea: {
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#000",
        lineHeight: 34,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: "#333",
        marginBottom: 8,
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: "#000",
        padding: 0,
        includeFontPadding: false,
    },
    eyeIcon: {
        padding: 8,
    },
    rulesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 8,
    },
    ruleBadge: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    ruleText: {
        fontSize: 12,
        fontWeight: "600",
    },
    buttonarea: {
        width: "100%",
        alignItems: "center",
    },
});
