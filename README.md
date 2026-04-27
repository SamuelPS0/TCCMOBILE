
# DivulgAí Mobile (divulgaimobile)

## Descrição
Aplicativo mobile desenvolvido com **Expo** e **React Native** para fluxo de cadastro, login e criação/edição de perfil de prestador de serviços.  
O projeto contém telas de autenticação, tela inicial com card de serviço e área de perfil do usuário.

O sistema faz parte do projeto **DivulgAí**, uma plataforma digital voltada à divulgação de prestadores de serviços do ramo alimentício, conectando consumidores a profissionais autônomos de forma simples e acessível.

---

## Contexto do Projeto
O projeto surgiu a partir da dificuldade de prestadores de serviços alimentícios em divulgar seus produtos e alcançar clientes, principalmente devido à baixa presença digital e dependência de redes sociais e indicações informais.

Além disso, consumidores enfrentam dificuldades para encontrar opções confiáveis e organizadas de serviços locais. O Divulgaí propõe centralizar essas informações em uma plataforma única, facilitando o contato direto entre as partes e incentivando o comércio local.

---

## Objetivo
Permitir que um usuário:

- realize cadastro e login;
- crie um perfil profissional;
- visualize informações do seu serviço;
- edite dados pessoais e profissionais no aplicativo.

Além disso, o sistema busca:

- aumentar a visibilidade de prestadores autônomos;
- facilitar a descoberta de serviços alimentícios locais;
- promover inclusão digital e crescimento econômico regional.

---

## Funcionalidades

### Funcionalidades do aplicativo mobile
- Cadastro de usuário com:
  - nome, telefone, CPF, e-mail, senha, data de nascimento, gênero e estado;
  - perguntas de segurança;
  - aceite de termos.
- Login com e-mail e senha.
- Criação de perfil profissional com:
  - foto de perfil;
  - nome e descrição;
  - CEP e preenchimento de endereço;
  - categoria;
  - contatos (WhatsApp, Instagram, Facebook);
  - imagem do serviço/evento.
- Tela Home com:
  - card para criar perfil quando não existe serviço ativo;
  - exibição de informações do serviço quando existente;
  - modal de feedbacks e ocorrências.
- Edição de:
  - informações pessoais;
  - informações de prestador.
- Logout.
- Persistência local de sessão e dados pendentes de onboarding.

### Funcionalidades complementares do sistema geral
- Busca de prestadores por categoria e localização (Web);
- Visualização de perfis com descrição, imagens e contatos;
- Envio de feedbacks e avaliações;
- Registro de ocorrências/denúncias;
- Aprovação de perfis por administrador antes da publicação.

---

## Metodologia
O projeto foi desenvolvido por equipe acadêmica utilizando organização baseada em papéis (Scrum), incluindo Product Owner, Scrum Master e equipe de desenvolvimento.

---

## Como Executar / Utilizar

### Pré-requisitos
- Node.js e npm instalados ([informação não fornecida sobre versão mínima]).
- Ambiente Expo configurado ([informação não fornecida sobre versão mínima]).

### 1) Instalar dependências
```bash
npm install
2) Executar o projeto
npx expo start
3) Scripts disponíveis
npm run start
4) Configuração de API (ambiente local)
A URL base da API está definida em:
assets/api/globalapi.js

Valor atual:
http://10.0.2.2:8080/api/v1/

Estrutura do Projeto
app/
  (auth)/
    index.tsx
    cadastro.tsx
    login.tsx
    seguranca.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    perfil.tsx
  (telas)/
    _layout.tsx
    accCreate.tsx
    personalinfo.tsx
    workinfo.tsx
  _layout.tsx
  index.js

assets/
  api/
    globalapi.js
    apiviacep.js
    ibge.js
  components/
    Button.tsx
    CheckboxInput.tsx
    DateInput.tsx
    Header.tsx
    ImageUpload.tsx
    Input.tsx
    ProfilePhoto.tsx
    SelectInput.tsx
    BottomNav.tsx
  globalstyles/
    fonts.js
  images/

src/
  context/
    AuthContext.js
  services/
    authService.js
    prestadorService.js
    feedbackService.js
  storage/
    onboardingStorage.js
  utils/
    formatFeedbackText.ts
Regras de Negócio (Resumo)
Usuários devem ser autenticados com e-mail e senha.

Prestadores só podem exibir perfil após cadastro completo.

Perfis precisam ser validados por um administrador antes de ficarem públicos.

Não é permitido cadastro duplicado com mesmo CPF ou e-mail.

Perfis inativos ou incompletos não são exibidos aos consumidores.

Tecnologias (Projeto Geral)
Front-end Mobile: React Native / Expo (implementação atual)

Front-end Web: React.js

Back-end: Java (IntelliJ)

Banco de Dados: SQL Server

Autenticação: Firebase

Hospedagem Web: Vercel

Estrutura de Dados (Resumo)
Entidades principais do sistema:

Usuário

Prestador

Serviço

Categoria

Contato

Feedback

Essas entidades permitem o relacionamento entre usuários, serviços oferecidos e interações (feedbacks e ocorrências).

Interface e Navegação (Resumo)
O aplicativo mobile inclui:

Tela inicial com opções de cadastro e login;

Tela de cadastro com dados pessoais e perguntas de segurança;

Tela de criação de perfil com upload de imagens e dados do serviço;

Tela Home com card do serviço;

Área "Minha conta" para gerenciamento de dados;

Telas de edição de perfil e informações pessoais.

Limitações Conhecidas
Dependência de validação manual por administrador para publicação de perfis;

Usuários com baixo conhecimento tecnológico podem ter dificuldade inicial de uso;

Parte das funcionalidades completas depende da integração com o sistema web;

Algumas informações de execução detalhada e infraestrutura não foram fornecidas.

Melhorias Futuras
Implementação completa de integração com backend e banco de dados;

Automatização parcial da validação de prestadores;

Melhorias na usabilidade para usuários com pouca familiaridade digital;

Expansão de funcionalidades de busca e filtros;

Inclusão de métricas mais detalhadas para prestadores (engajamento e alcance);

Otimização para diferentes dispositivos e acessibilidade.

Justificativa
O projeto atende à necessidade de digitalização de pequenos empreendedores do ramo alimentício, oferecendo uma solução acessível para divulgação de serviços e conexão com clientes.

A proposta contribui para:

fortalecimento da economia local;

aumento da visibilidade de autônomos;

incentivo ao consumo regional;

inclusão digital de pequenos negócios.

