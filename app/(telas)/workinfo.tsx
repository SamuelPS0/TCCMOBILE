import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BottomNav from "../../assets/components/BottomNav";
import { Button } from "../../assets/components/Button";
import { Header } from "../../assets/components/Header";
import { ImageUpload } from "../../assets/components/ImageUpload";
import { Input } from "../../assets/components/Input";
import { ProfilePhoto } from "../../assets/components/ProfilePhoto";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";

export default function Workinfo() {
  const router = useRouter();

  // Estados para receber os dados via API
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [rede, setRede] = useState("");
  const [local, setLocal] = useState("");
  const [regiao, setRegiao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagemEvento, setImagemEvento] = useState<string | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  // Dados das redes sociais e categorias (para dropdowns)
  const redesocial = [
    { label: "Whatsapp", value: "Whatsapp" },
    { label: "Instagram", value: "Instagram" },
    { label: "Facebook", value: "Facebook" },
  ];

  const categorias = [
    { label: "Padaria", value: "padaria" },
    { label: "Restaurante", value: "restaurante" },
    { label: "Café", value: "cafe" },
  ];

  return (
    <View style={styles.screen}>
      <Header>
        <Text style={typography.title}>Criação de perfil</Text>
      </Header>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View>
          {/* Foto de perfil */}
          <View
            style={{ alignItems: "center", marginBottom: 20, marginTop: 10 }}
          >
            <ProfilePhoto
              size={120}
              imageUri={fotoPerfil} // Recebe a foto via API
              onChangeImage={setFotoPerfil} // Atualiza localmente quando selecionar
            />
          </View>

          {/* Inputs */}
          <Input
            label="Nome"
            icon="person-outline"
            placeholder="Digite aqui o nome..."
            value={nome}
            onChangeText={setNome}
          />
          <Input
            label="Descrição"
            icon="document-text-outline"
            placeholder="Digite aqui a descrição..."
            multiline={true}
            value={descricao}
            onChangeText={setDescricao}
          />
          <Input
            label="Local"
            icon="location-outline"
            placeholder="Digite a região..."
            value={local}
            onChangeText={setLocal}
          />
          <Input
            label="Região"
            icon="compass-outline"
            placeholder="Digite a região..."
            value={regiao}
            onChangeText={setRegiao}
          />

          {/* SelectInput redes sociais */}
          <SelectInput
            label="Contato"
            icon="call-outline"
            selectedValue={rede}
            onValueChange={setRede}
            options={redesocial}
          />

          {/* SelectInput categorias culinárias */}
          <SelectInput
            label="Categoria"
            icon="restaurant-outline"
            selectedValue={categoria}
            onValueChange={setCategoria}
            options={categorias}
          />

          {/* Upload de imagem do evento */}
          <ImageUpload
            label="Foto do evento"
            height={200}
            imageUri={imagemEvento} // Recebe a imagem via API
            onChangeImage={setImagemEvento} // Atualiza localmente quando selecionar
          />

          {/* Botão de concluir */}
          <View style={{ marginTop: 30, alignItems: "center" }}>
            <Button onPress={() => router.push("/(tabs)")}>
              <Text style={typography.buttonText}>Concluir</Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  content: { padding: 20, gap: 20 },
});
