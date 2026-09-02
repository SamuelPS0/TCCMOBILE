import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputKeyPressEventData,
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

export default function EsqSenha2() {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const [loadingCodigo, setLoadingCodigo] = useState<boolean>(false);
    const [loadingResend, setLoadingResend] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(600);
    const [resendTimer, setResendTimer] = useState<number>(30);
    const [canResend, setCanResend] = useState<boolean>(false);
    const [resendAttempt, setResendAttempt] = useState<number>(0);

    useEffect(() => {
        async function getEmail(): Promise<void> {
            const storedEmail = await AsyncStorage.getItem("emailRecuperacao");
            setEmail(storedEmail);
        }
        getEmail();
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (resendTimer <= 0) {
            setCanResend(true);
            return;
        }
        const resendInterval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
        return () => clearInterval(resendInterval);
    }, [resendTimer]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleInputChange = (value: string, index: number): void => {
        const cleanedValue = value.replace(/[^0-9]/g, "");

        if (cleanedValue.length > 1) {
            const newCode = [...code];
            for (let i = 0; i < 6; i++) {
                newCode[i] = cleanedValue[i] || "";
            }
            setCode(newCode);
            const nextIndex = Math.min(cleanedValue.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        if (/^[0-9]?$/.test(cleanedValue)) {
            const newCode = [...code];
            newCode[index] = cleanedValue;
            setCode(newCode);

            if (cleanedValue && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number): void => {
        if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const validarCodigo = async (): Promise<void> => {
        const codigoCompleto = code.join("");
        if (codigoCompleto.length < 6) {
            Alert.alert("Erro", "Digite o código completo de 6 dígitos.");
            return;
        }

        setLoadingCodigo(true);
        try {
            await globalapi.post(
                API_ENDPOINTS.passwordReset.validateCode,
                null,
                { params: { email, codigo: codigoCompleto } }
            );
            Alert.alert("Sucesso", "Código validado com sucesso.");
            router.push({
                pathname: "/(auth)/VerificacaoEmail/novaSenha",
                params: { codigo: codigoCompleto }
            });
        } catch (error: any) {
            console.error(error);
            Alert.alert("Erro", formatApiError(error));
        } finally {
            setLoadingCodigo(false);
        }
    };

    const reenviarCodigo = async (): Promise<void> => {
        if (!email || !canResend || loadingResend) return;

        setCanResend(false);
        setLoadingResend(true);

        try {
            await globalapi.post(
                API_ENDPOINTS.passwordReset.sendCode,
                null,
                { params: { email } }
            );
            
            Alert.alert("Sucesso", "Novo código reenviado para seu e-mail.");
            
            const nextAttempt = resendAttempt + 1;
            setResendAttempt(nextAttempt);

            let nextTime = 30;
            if (nextAttempt === 1) nextTime = 60;
            else if (nextAttempt === 2) nextTime = 120;
            else if (nextAttempt >= 3) nextTime = 180;

            setTimeLeft(600); 
            setResendTimer(nextTime);
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            console.error(error);
            Alert.alert("Erro", formatApiError(error));
        } finally {
            setLoadingResend(false);
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
                        DIGITE O CÓDIGO{"\n"}DE VERIFICAÇÃO
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            style={styles.otpInput}
                            keyboardType="numeric"
                            maxLength={6}
                            value={digit}
                            onChangeText={(value) => handleInputChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            textAlign="center"
                        />
                    ))}
                </View>

                <View style={styles.infoArea}>
                    <Text style={styles.subtitle}>
                        ENVIAMOS O CÓDIGO DE 6 DÍGITOS PARA{"\n"}
                        O E-MAIL CADASTRADO. VERIFIQUE SUA{"\n"}
                        CAIXA DE ENTRADA OU SPAM.
                    </Text>
                    <Text style={styles.timerText}>
                        {timeLeft > 0 ? `O CÓDIGO EXPIRA EM ${formatTime(timeLeft)}.` : "O CÓDIGO EXPIROU."}
                    </Text>
                </View>
            </View>

            <View style={styles.buttonarea}>
                <Button onPress={validarCodigo} width="90%" disabled={loadingCodigo || timeLeft === 0}>
                    {loadingCodigo ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={typography.buttonText}>VERIFICAR CÓDIGO</Text>
                    )}
                </Button>

                <Button 
                    onPress={reenviarCodigo} 
                    width="90%" 
                    variant="secondary"
                    disabled={!canResend || loadingResend}
                >
                    {loadingResend ? (
                        <ActivityIndicator color="#F05221" />
                    ) : (
                        <Text style={[typography.buttonText, { color: "#F05221" }]}>
                            {canResend ? "REENVIAR CÓDIGO" : `REENVIAR (${formatTime(resendTimer)})`}
                        </Text>
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
        marginBottom: 24,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#000",
        lineHeight: 34,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    otpInput: {
        width: 50,
        height: 64,
        borderWidth: 1.5,
        borderColor: "#ccc",
        borderRadius: 10,
        fontSize: 26,
        fontWeight: "bold",
        backgroundColor: "#fff",
        color: "#000",
        textAlign: "center",
        padding: 0,
        includeFontPadding: false,
        textAlignVertical: "center",
    },
    infoArea: {
        gap: 16,
    },
    subtitle: {
        fontSize: 14,
        color: "#333",
        lineHeight: 22,
    },
    timerText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    buttonarea: {
        width: "100%",
        alignItems: "center",
        gap: 16,
    },
});
