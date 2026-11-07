import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioController } from './controllers/usuario.controller';
import { UsuarioRepository } from './repositories/usuario.repository';
import { UsuarioService } from './services/usuario.service';

@Module({
  imports: [],
  controllers: [AppController, UsuarioController],
  providers: [AppService, UsuarioService, UsuarioRepository],
})
export class AppModule {}
