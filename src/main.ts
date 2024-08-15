import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    // whitelist: true,
    // enableDebugMessages: true,
  }));
  app.enableCors({
    origin: 'http://localhost:3000', // Thay đổi URL này thành nguồn bạn muốn cho phép
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // swagger
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('API Medical Support')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT || 3000);
  
}
bootstrap();
