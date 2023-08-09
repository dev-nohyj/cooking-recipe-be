import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerOptions = new DocumentBuilder()
    .setTitle('Cooking-recipe')
    .setDescription('API Documentation')
    .setVersion('1.0.0')
    .build();
