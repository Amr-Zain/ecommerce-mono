import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { AppException } from '../exceptions/app.exception';

@Catch(AppException)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: AppException, host: ArgumentsHost) {
    const i18n = I18nContext.current(host);
    const res = host.switchToHttp().getResponse<Response>();

    res.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: i18n ? i18n.t(exception.key, { args: exception.args }) : exception.key,
    });
  }
}
