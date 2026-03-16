import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apicategoria } from "../../assets/api/apicategoria";
import { ibgeapi } from "../../assets/api/ibge";
import BottomNav from "../../assets/components/BottomNav";
import { Button } from "../../assets/components/Button";
import { Header } from "../../assets/components/Header";
import { ImageUpload } from "../../assets/components/ImageUpload";
import { Input } from "../../assets/components/Input";
import { ProfilePhoto } from "../../assets/components/ProfilePhoto";
import { SelectInput } from "../../assets/components/SelectInput";
import { typography } from "../../assets/globalstyles/fonts";

export default function AccCreate() {
  const router = useRouter();

  const [municipios, setMunicipios] = useState<string[]>([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<string[]>([]);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [rede, setRede] = useState("");
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [regiao, setRegiao] = useState("");
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    async function carregarMunicipios() {
      if (!estado) return;

      try {
        const response = await ibgeapi.get(`/estados/${estado}/municipios`);

        const lista = response.data.map((m: any) => m.nome);

        setMunicipios(lista);
        setMunicipiosFiltrados(lista);
        setMunicipio("");
      } catch (error) {
        console.log(error);
      }
    }

    carregarMunicipios();
  }, [estado]);

  function handleMunicipioChange(text: string) {
    setMunicipio(text);

    const filtrados = municipios.filter((m) =>
      m.toLowerCase().includes(text.toLowerCase()),
    );

    setMunicipiosFiltrados(filtrados);
  }

  function selecionarMunicipio(nome: string) {
    setMunicipio(nome);
    setMunicipiosFiltrados([]);
  }

  const redesocial = [
    { label: "Whatsapp", value: "Whatsapp" },
    { label: "Instagram", value: "Instagram" },
    { label: "Facebook", value: "Facebook" },
  ];


  const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
  ];

  const [categoriasApi, setCategoriasApi] = useState<any[]>([]);

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const response = await apicategoria.get("");

        const lista = response.data
          .filter((c: any) => c.statusCategoria)
          .map((c: any) => ({
            label: c.nome,
            value: c.id,
          }));

        setCategoriasApi(lista);

      } catch (error) {
        console.log(error);
      }
    }

    carregarCategorias();
  }, []);


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
          <View
            style={{ alignItems: "center", marginBottom: 20, marginTop: 10 }}
          >
            <ProfilePhoto size={120} />
          </View>

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

          <View style={styles.rowInputs}>
            <SelectInput
              label="Local"
              icon="location-outline"
              selectedValue={estado}
              onValueChange={setEstado}
              options={estados.map((estado) => ({
                label: `${estado.sigla} - ${estado.nome}`,
                value: estado.sigla,
              }))}
              width={"31%"}
            />

            <View style={styles.municipioContainer}>
              <Input
                label=" "
                placeholder="Município"
                value={municipio}
                onChangeText={handleMunicipioChange}
              />

              {estado &&
                municipio.length > 0 &&
                municipiosFiltrados.length > 0 && (
                  <View style={styles.sugestoes}>
                    <ScrollView nestedScrollEnabled>
                      {municipiosFiltrados.slice(0, 8).map((m) => (
                        <TouchableOpacity
                          key={m}
                          onPress={() => selecionarMunicipio(m)}
                          style={styles.sugestaoItem}
                        >
                          <Text style={styles.sugestaoTexto}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
            </View>
          </View>

          <Input
            label="Região"
            icon="compass-outline"
            placeholder="Digite a região..."
            value={regiao}
            onChangeText={setRegiao}
          />

          <SelectInput
            label="Contato"
            icon="call-outline"
            selectedValue={rede}
            onValueChange={setRede}
            options={redesocial}
          />

          <View style={styles.categoriaContainer}>
            <SelectInput
              label="Categoria"
              icon="restaurant-outline"
              selectedValue={categoria}
              onValueChange={(value) => setCategoria(value)}
              options={categoriasApi}
            />




          </View>

          <ImageUpload
            label="Foto do evento"
            icon="camera-outline"
            height={200}
          />

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

  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  municipioContainer: {
    width: "65%",
    position: "relative",
  },

  sugestoes: {
    position: "absolute",
    top: 55,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },

  sugestaoItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  sugestaoTexto: {
    fontSize: 14,
  },

  categoriaContainer: {
    position: "relative",
    width: "100%",
  },
});
