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
 * Modelo de domínio do Usuário (CU01 – Manter Usuário / CU02 – Autenticar Usuário).
 */
export class Usuario {
  id!: string;
  nome!: string;
  email!: string;
  /** Hash da senha — nunca expor em respostas. */
  senhaHash!: string;
  funcao!: FuncaoUsuario;
  situacao!: SituacaoUsuario;
  /** Contador de tentativas incorretas consecutivas (CU02). */
  tentativasIncorretas!: number;
  /** Início/fim do bloqueio temporário; null quando não há bloqueio. */
  bloqueadoAte!: Date | null;
  criadoEm!: Date;
  atualizadoEm!: Date;

  constructor(data: {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    funcao: FuncaoUsuario;
    situacao: SituacaoUsuario;
    tentativasIncorretas?: number;
    bloqueadoAte?: Date | null;
    criadoEm: Date;
    atualizadoEm: Date;
  }) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senhaHash = data.senhaHash;
    this.funcao = data.funcao;
    this.situacao = data.situacao;
    this.tentativasIncorretas = data.tentativasIncorretas ?? 0;
    this.bloqueadoAte = data.bloqueadoAte ?? null;
    this.criadoEm = data.criadoEm;
    this.atualizadoEm = data.atualizadoEm;
  }
}
