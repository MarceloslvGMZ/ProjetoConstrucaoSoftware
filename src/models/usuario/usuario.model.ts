export enum FuncaoUsuario {
  ADMINISTRADOR = 'Administrador',
  VENDAS = 'Vendas',
  INSTALACAO = 'Instalacao',
}

export enum SituacaoUsuario {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
}

/**
 * Modelo de domínio do Usuário (CU01 – Manter Usuário).
 */
export class Usuario {
  id!: string;
  nome!: string;
  email!: string;
  /** Hash da senha — nunca expor em respostas. */
  senhaHash!: string;
  funcao!: FuncaoUsuario;
  situacao!: SituacaoUsuario;
  criadoEm!: Date;
  atualizadoEm!: Date;

  constructor(data: {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    funcao: FuncaoUsuario;
    situacao: SituacaoUsuario;
    criadoEm: Date;
    atualizadoEm: Date;
  }) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senhaHash = data.senhaHash;
    this.funcao = data.funcao;
    this.situacao = data.situacao;
    this.criadoEm = data.criadoEm;
    this.atualizadoEm = data.atualizadoEm;
  }
}
