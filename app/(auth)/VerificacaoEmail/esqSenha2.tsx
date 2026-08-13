import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, NativeSyntheticEvent, Text, TextInput, TextInputKeyPressEventData, TouchableOpacity, View } from "react-native";

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
        if (/^[0-9]?$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            if (value && index < 5) {
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
            await axios.post(
                "http://localhost:8080/api/v1/usuario/recuperar-senha/validar-codigo",
                null,
                { params: { email, codigo: codigoCompleto } }
            );
            Alert.alert("Sucesso", "Código validado com sucesso.");
           router.push({
    pathname: "/VerificacaoEmail/novaSenha",
    params: { codigo: codigoCompleto }
});
        } catch (error: any) {
            console.error(error);
            Alert.alert("Erro", error.response?.data || "Código inválido.");
        } finally {
            setLoadingCodigo(false);
        }
    };

    const reenviarCodigo = async (): Promise<void> => {
        if (!email || !canResend || loadingResend) return;

        setCanResend(false);
        setLoadingResend(true);

        try {
            await axios.post(
                "http://localhost:8080/api/v1/usuario/recuperar-senha/enviar-codigo",
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
            Alert.alert("Erro", error.response?.data || "Erro ao reenviar o código.");
        } finally {
            setLoadingResend(false);
        }
    };

    return (
        <View>
            <Text>DIGITE O CÓDIGO DE VERIFICAÇÃO</Text>

            <View style={{ flexDirection: 'row' }}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(value) => handleInputChange(value, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                ))}
            </View>

            <Text>ENVIAMOS O CÓDIGO DE 6 DÍGITOS PARA O E-MAIL CADASTRADO.</Text>
            <Text>{timeLeft > 0 ? `O CÓDIGO EXPIRA EM ${formatTime(timeLeft)}.` : "O CÓDIGO EXPIROU."}</Text>

            <TouchableOpacity onPress={validarCodigo} disabled={loadingCodigo || timeLeft === 0}>
                <Text>{loadingCodigo ? "VALIDANDO..." : "VERIFICAR CÓDIGO"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={reenviarCodigo} disabled={!canResend || loadingResend}>
                <Text>
                    {loadingResend ? "ENVIANDO..." : canResend ? "REENVIAR CÓDIGO" : `REENVIAR (${formatTime(resendTimer)})`}
                </Text>
            </TouchableOpacity>
        </View>
    );
}