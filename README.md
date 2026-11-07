# ForrOS – Backend (NestJS)

API do sistema **ForrOS**, iniciada com o **CU01 – Manter Usuário**, em arquitetura em camadas (Controller → Service → Repository → Model).

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

## Como testar pelo Swagger

1. Rode `npm run start:dev`
2. Abra http://localhost:3000/api
3. Expanda o grupo **usuarios**
4. Em `POST /usuarios`, clique em **Try it out**, use o body de exemplo e **Execute**
5. Use `GET /usuarios` para listar e `PATCH /usuarios/{id}` para alterar/inativar

Exemplo de cadastro:

```json
{
  "nome": "admin",
  "email": "admin@forros.com",
  "senha": "123456",
  "funcao": "Administrador"
}
```

Funções válidas: `Administrador`, `Vendas`, `Instalacao`  
Situações válidas: `Ativo`, `Inativo`

> Os dados ficam em memória: ao reiniciar o servidor, a lista zera.

## Testes automatizados

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Estrutura

```
src/
├── controllers/     # HTTP
├── services/        # Regras de negócio
├── repositories/    # Persistência
└── models/usuario/  # Entidade + DTOs
```
