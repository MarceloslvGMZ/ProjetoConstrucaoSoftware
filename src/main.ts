import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ForrOS API')
    .setDescription(
      'Documentação da API do sistema ForrOS. CU01 – Manter Usuário.',
    )
    .setVersion('1.0')
    .addTag('usuarios', 'CU01 – Manter Usuário')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Aplicação: http://localhost:${port}`);
  console.log(`Swagger:   http://localhost:${port}/api`);
}
void bootstrap();
