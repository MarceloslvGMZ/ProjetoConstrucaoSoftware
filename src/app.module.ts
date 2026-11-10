import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AUTH_JWT_SECRET } from './auth/auth.constants';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AutenticacaoController } from './controllers/autenticacao.controller';
import { UsuarioController } from './controllers/usuario.controller';
import { UsuarioRepository } from './repositories/usuario.repository';
import { AutenticacaoService } from './services/autenticacao.service';
import { UsuarioService } from './services/usuario.service';

@Module({
  imports: [
    JwtModule.register({
      secret: AUTH_JWT_SECRET,
    }),
  ],
  controllers: [AppController, UsuarioController, AutenticacaoController],
  providers: [
    AppService,
    UsuarioService,
    UsuarioRepository,
    AutenticacaoService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AppModule {}
