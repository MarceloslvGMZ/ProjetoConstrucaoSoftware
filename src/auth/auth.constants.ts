/**
 * Parâmetros do sistema para CU02 – Autenticar Usuário.
 * A duração do bloqueio é mantida como parâmetro configurável (Cenário 2 – R2).
 */
export const AUTH_MAX_TENTATIVAS = 5;

/** Duração do bloqueio temporário após 5 tentativas incorretas. */
export const AUTH_BLOQUEIO_MINUTOS = 15;

/** Validade do token JWT em sessão normal. */
export const AUTH_JWT_EXPIRA_PADRAO = '8h';

/** Validade do token JWT quando “Lembrar acesso” está marcado. */
export const AUTH_JWT_EXPIRA_LEMBRAR = '7d';

export const AUTH_JWT_SECRET =
  process.env.JWT_SECRET ?? 'forros-dev-secret-alterar-em-producao';

export const MSG_CREDENCIAIS_INVALIDAS = 'E-mail ou Senha inválidos';

export const MSG_ACESSO_BLOQUEADO =
  'Acesso bloqueado temporariamente por motivo de segurança. Tente novamente mais tarde ou busque o suporte da aplicação.';
