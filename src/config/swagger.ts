import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerOptions = new DocumentBuilder()
    .setTitle('FoodShare')
    .setDescription('API Documentation')
    .setVersion('1.0.0')
    .build();
