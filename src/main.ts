// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // opcional se quiser testar via front-end ou Postman
  await app.listen(process.env.PORT ?? 3004);
  console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT ?? 3004}`);
}
bootstrap();
