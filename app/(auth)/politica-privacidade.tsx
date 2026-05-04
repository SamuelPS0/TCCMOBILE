import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Header } from "../../assets/components/Header";
import { typography } from "../../assets/globalstyles/fonts";
import React from "react";

export default function PoliticaPrivacidade() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header>
        <Text style={typography.title}>Política de Privacidade</Text>
      </Header>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.paragraph}>
          Esta Política de Privacidade explica como o aplicativo DivulgAí Mobile
          coleta, utiliza e armazena os dados informados por seus usuários.
        </Text>

        <Text style={styles.sectionTitle}>1. Dados coletados</Text>
        <Text style={styles.paragraph}>
          O aplicativo pode coletar: nome, telefone, CPF, e-mail, data de
          nascimento, endereço, informações do perfil profissional e imagens
          enviadas pelo usuário.
        </Text>

        <Text style={styles.sectionTitle}>2. Uso dos dados</Text>
        <Text style={styles.paragraph}>
          Os dados são utilizados para criar e manter a conta, permitir a
          publicação de perfis de prestadores e facilitar o contato entre
          usuários e prestadores de serviço.
        </Text>

        <Text style={styles.sectionTitle}>3. Compartilhamento</Text>
        <Text style={styles.paragraph}>
          Os dados de perfil profissional podem ser exibidos na plataforma para
          fins de divulgação dos serviços cadastrados.
        </Text>

        <Text style={styles.sectionTitle}>4. Armazenamento</Text>
        <Text style={styles.paragraph}>
          Parte das informações pode ser armazenada localmente no dispositivo
          para manter sessão ativa e continuidade de cadastro.
        </Text>

        <Text style={styles.sectionTitle}>5. Direitos do usuário</Text>
        <Text style={styles.paragraph}>
          O usuário pode solicitar atualização ou remoção de dados cadastrais,
          conforme as regras do sistema e disponibilidade administrativa.
        </Text>

        <Text style={styles.sectionTitle}>6. Consentimento</Text>
        <Text style={styles.paragraph}>
          Ao utilizar o aplicativo e prosseguir com o cadastro, o usuário
          declara estar ciente desta Política de Privacidade.
        </Text>

        <Text style={styles.updatedAt}>Última atualização: 04/05/2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    left: 25,
    top: 68,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  paragraph: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: "justify",
  },
  updatedAt: {
    marginTop: 12,
    fontSize: 13,
    color: "#666",
  },
});