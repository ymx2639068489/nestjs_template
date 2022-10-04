import { NestFactory } from '@nestjs/core';
import { BackDeskModule } from './_back_desk/main.module';
import { FrontDeskModule } from './_front_desk/main.module';

// swagger
import {
  SwaggerModule,
  DocumentBuilder
} from '@nestjs/swagger';
// 验证管道
import { ValidationPipe } from '@nestjs/common';
// 过滤器, 捕获异常
import { HttpExceptionFilter } from './utils';
import {
  // 响应包装拦截器
  WrapResponseInterceptor,
} from './utils';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { appConfig } from '@/config/app.config';

async function bootstrap(
  app: any,
  port: number,
  prefix: string,
  swaggerConfig: {
    title: string;
    description: string;
    version: string;
    tag: string;
    prefix: string;
  }
) {
  app.setGlobalPrefix(prefix);
  const options = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .addTag(swaggerConfig.tag)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(swaggerConfig.prefix, app, document);

  // 全局验证器
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 删除掉不需要验证的参数
      forbidNonWhitelisted: true, // 格式不对就直接报错
      transform: true, // 允许转换参数类型
      transformOptions: {
        enableImplicitConversion: true, // 允许隐式转换
      },
    }),
  );

  // 过滤器捕获异常
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    // new TimeoutInterceptor(),
  );
  // 限速
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
    }),
  )
  // Helmet 可以帮助保护应用免受一些众所周知的 Web 漏洞的影响
  app.use(helmet());
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

async function init() {
  const back_desk = await NestFactory.create(BackDeskModule, appConfig);
  bootstrap(back_desk, 3000, 'api', {
    title: '前台接口',
    description: '前台接口_移动',
    version: '1.0.0',
    tag: '移动前台接口',
    prefix: '/docs'
  });

  const front_desk = await NestFactory.create(FrontDeskModule, appConfig);
  bootstrap(front_desk, 3100, 'api', {
    title: '前台接口',
    description: '前台接口_移动',
    version: '1.0.0',
    tag: '移动前台接口',
    prefix: '/docs'
  });
}

init();
/**
 * @nestjs/typeorm typeorm mysql
 * class-validator class-transformer
 * @nestjs/config
 * @nestjs/swagger
 * helmet express-rate-limit
 * passport-local @nestjs/jwt @nestjs/passport
 * stacktrace-js moment log4js node-rsa
 * @types/passport-jwt
 * crypto-js
 */