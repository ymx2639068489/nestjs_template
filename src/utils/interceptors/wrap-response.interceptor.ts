import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Logger } from '../log4js/index';
import { desensitizationFn } from '../desensitization';
/**
 * 所有的拦截器都应该实现从@nestjs/common导出的`NestInterceptor`接口
 */
@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.getArgByIndex(1).req;
    Logger.log(`收到请求 ---> ${req.route.path}`);
    return next.handle().pipe(
      map((data) => {
        data = desensitizationFn(data)
        if (data?.response?.statusCode) {
          Logger.fatal(`响应失败fatal ---> ${req.route.path}`);
          return {
            code: -1,
            ...data.response,
          };
        }
        Logger.log(`响应成功 ---> ${req.route.path}`);
        return {
          code: 0,
          ...data,
        };
      }),
    );
  }
}
