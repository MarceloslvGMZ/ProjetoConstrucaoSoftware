import { Injectable } from '@nestjs/common';
import { Usuario } from '../models/usuario/usuario.model';

/**
 * Camada de persistência do Usuário.
 */
@Injectable()
export class UsuarioRepository {
  private readonly usuarios: Usuario[] = [];

  create(usuario: Usuario): Promise<Usuario> {
    this.usuarios.push(usuario);
    return Promise.resolve(usuario);
  }

  findAll(): Promise<Usuario[]> {
    return Promise.resolve([...this.usuarios]);
  }

  findById(id: string): Promise<Usuario | undefined> {
    return Promise.resolve(this.usuarios.find((usuario) => usuario.id === id));
  }

  findByEmail(email: string): Promise<Usuario | undefined> {
    return Promise.resolve(
      this.usuarios.find(
        (usuario) => usuario.email.toLowerCase() === email.toLowerCase(),
      ),
    );
  }

  findByNome(nome: string): Promise<Usuario | undefined> {
    return Promise.resolve(
      this.usuarios.find(
        (usuario) => usuario.nome.toLowerCase() === nome.toLowerCase(),
      ),
    );
  }

  search(filtro?: string): Promise<Usuario[]> {
    if (!filtro?.trim()) {
      return this.findAll();
    }

    const termo = filtro.trim().toLowerCase();
    return Promise.resolve(
      this.usuarios.filter(
        (usuario) =>
          usuario.nome.toLowerCase().includes(termo) ||
          usuario.funcao.toLowerCase().includes(termo),
      ),
    );
  }

  update(usuario: Usuario): Promise<Usuario> {
    const index = this.usuarios.findIndex((item) => item.id === usuario.id);
    if (index === -1) {
      return Promise.reject(
        new Error(`Usuário ${usuario.id} não encontrado no repositório`),
      );
    }
    this.usuarios[index] = usuario;
    return Promise.resolve(usuario);
  }
}
