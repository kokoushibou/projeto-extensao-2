# Agenda do Salão (Expo SDK 54)

Aplicativo React Native com Expo para organizar clientes, serviços e agendamentos de um salão.

## Tecnologias
- Expo SDK 54
- React Navigation (native stack)
- SQLite local com `expo-sqlite` (API estável assíncrona)
- TypeScript

## Estrutura
```txt
src/
  components/
  db/
    repos/
  screens/
  types/
  utils/
```

## Como rodar
1. Instale dependências:
   ```bash
   npm install
   ```
2. Inicie o projeto limpando cache:
   ```bash
   npx expo start -c
   ```
3. Abra no **Expo Go** (Android/iOS) escaneando o QR Code.

> Foco do app é Android/iOS (Expo Go). Execução web não é prioridade.

## Telas e fluxos
- **Agenda (Home):** visualiza agendamentos do dia, muda data, cria novo agendamento, altera status rápido.
- **Novo/Editar Agendamento:** formulário com validações, conflito de horário com confirmação.
- **Clientes:** busca e CRUD completo; abre detalhe do cliente.
- **Detalhe do Cliente:** dados e histórico de agendamentos (mais recente primeiro).
- **Serviços:** CRUD completo com validação de nome e duração.

## Seed inicial
Na primeira execução, o banco cria automaticamente:
- 2 serviços (`Corte Feminino`, `Escova`)
- 2 clientes (`Ana Souza`, `Beatriz Lima`)
