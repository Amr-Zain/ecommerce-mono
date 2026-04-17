import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public readonly key: string,
    public readonly args?: Record<string, any>,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(key, statusCode);
  }
}
