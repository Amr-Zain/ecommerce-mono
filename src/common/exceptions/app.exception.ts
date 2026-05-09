import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public readonly key: string,
    public readonly args?: Record<string, unknown>,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(key, statusCode);
  }
}
