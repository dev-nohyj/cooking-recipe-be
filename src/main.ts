import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import hpp from 'hpp';
import helmet from 'helmet';
import requestIp from 'request-ip';
import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { swaggerOptions } from './config/swagger';
import { PrismaDatabase } from './prisma/prisma.service';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { sessionOptions } from './config/session';
import { UserAuthGuard } from './guards/auth.guard';
import { CheckInvalidDataTypeInterceptor } from './interceptors/checkInvalidDataType.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './filters/allException.filter';
import expressBasicAuth from 'express-basic-auth';

class Application {
    private readonly PORT: number;
    private readonly configService: ConfigService;
    private readonly prismaDatabase: PrismaDatabase;
    private readonly reflector: Reflector;

    constructor(private readonly app: NestExpressApplication) {
        this.configService = app.get(ConfigService);
        this.PORT = parseInt(this.configService.get('PORT') as string);
        this.prismaDatabase = app.get(PrismaDatabase);
        this.reflector = new Reflector();
    }

    private setUpSwagger() {
        const docs = SwaggerModule.createDocument(this.app, swaggerOptions);
        SwaggerModule.setup(this.configService.get('SWAGGER_URL') as string, this.app, docs);
    }

    private async startApp() {
        this.app.set('trust proxy', 1);
        this.app.enableCors({
            origin:
                this.configService.get('NODE_ENV') === 'production'
                    ? [this.configService.get('CORS_URL') as string]
                    : ['http://localhost:3000'],
            credentials: true,
        });

        this.app.use(hpp());
        this.app.use(helmet());
        this.app.use(cookieParser(this.configService.get('COOKIE_SECRET')));
        this.app.use(session(sessionOptions(this.configService)));

        this.app.use(requestIp.mw());

        this.app.useGlobalGuards(new UserAuthGuard(this.reflector, this.configService));
        this.app.useGlobalInterceptors(new CheckInvalidDataTypeInterceptor(), new LoggingInterceptor());
        this.app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true, // validation을 위한 decorator가 붙어있지 않은 속성들은 제거
                forbidNonWhitelisted: true, // whitelist 설정을 켜서 걸러질 속성이 있다면 아예 요청 자체를 막도록 (400 에러)
                transform: true, // 요청에서 넘어온 자료들의 형변환
            }),
        );
        this.app.useGlobalFilters(new AllExceptionsFilter(this.prismaDatabase, this.configService));
        this.setUpSwagger();
    }

    async start() {
        this.prismaDatabase.enableShutdownHooks(this.app);
        this.app.use(
            ['/' + this.configService.get('SWAGGER_URL'), '/' + this.configService.get('SWAGGER_URL') + '-json'],
            expressBasicAuth({
                challenge: true,
                users: { [this.configService.get('SWAGGER_ID')]: this.configService.get('SWAGGER_PWD') as string },
            }),
        );
        await this.startApp();
        await this.app.listen(this.PORT, () => {
            console.log(`
    #############################################
        🛡️ Server listening on port: ${this.PORT} 🛡️
        🛡️ Server env: ${this.configService.get('NODE_ENV')} 🛡️
    #############################################    
    `);
        });
    }
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const server = new Application(app);

    return server.start();
}

bootstrap().catch((error) => console.log(`Server error!!! : ${error}`));
