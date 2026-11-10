# ForrOS – Backend (NestJS)

API do sistema **ForrOS**, com desenvolvimento incremental dos casos de uso:

- **CU01 – Manter Usuário**
- **CU02 – Autenticar Usuário**

Arquitetura em camadas: Controller → Service → Repository → Model.

## Pré-requisitos

- Node.js 18+ (recomendado LTS)
- npm

## Instalação

Na pasta do projeto:

```bash
npm install
```

## Subir a aplicação

Modo desenvolvimento (hot reload):

```bash
npm run start:dev
```

Outras opções:

```bash
npm run start        # uma vez
npm run start:prod   # após npm run build
```

Com a API no ar:

- Aplicação: http://localhost:3000
- **Swagger (testar a API):** http://localhost:3000/api

## Fluxo recomendado (Swagger)

1. Rode `npm run start:dev`
2. Abra http://localhost:3000/api
3. Faça login em `POST /auth/login` com o administrador seed
4. Clique em **Authorize** e informe o `accessToken`
5. Use as rotas de `/usuarios` (restritas a Administrador)

> **Importante:** as rotas de `/usuarios` exigem JWT de um **Administrador**.

### Seed do administrador inicial

Ao iniciar, se não houver usuários, a API cria automaticamente:

```json
{
  "nome": "admin",
  "email": "admin@forros.com",
  "senha": "123456",
  "funcao": "Administrador"
}
```

### Autenticar (CU02)

Exemplo de login:

```json
{
  "email": "admin@forros.com",
  "senha": "123456",
  "lembrarAcesso": false
}
```

### Regras de autenticação (CU02)

- Credenciais validadas no repositório; senha comparada com hash (nunca texto puro)
- Mensagem genérica: `E-mail ou Senha inválidos` (usuário inexistente, senha errada ou Inativo)
- Após **5** tentativas incorretas consecutivas → bloqueio temporário de **15 minutos**
- Durante o bloqueio, nenhuma credencial é aceita
- Login bem-sucedido zera o contador e libera o perfil (`funcao`) no token

Funções válidas: `Administrador`, `Vendas`, `Instalacao`  
Situações válidas: `Ativo`, `Inativo`

> Os dados ficam em memória: ao reiniciar o servidor, a lista zera (e o admin seed é recriado).

## Testes automatizados

```bash
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Estrutura

```
src/
├── auth/            # JWT, guards e papéis (CU02)
├── controllers/     # HTTP (usuarios, autenticacao)
├── services/        # Regras de negócio
├── repositories/    # Persistência
└── models/          # Entidades + DTOs (usuario, auth)
```
