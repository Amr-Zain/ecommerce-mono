import { Injectable } from '@nestjs/common';
import { ClientReturnsRepository } from './client-returns.repository';

@Injectable()
export class ClientReturnsService {
  constructor(private readonly repository: ClientReturnsRepository) {}

  findReturns(...args: Parameters<ClientReturnsRepository['findReturns']>) {
    return this.repository.findReturns(...args);
  }
  findExchanges(...args: Parameters<ClientReturnsRepository['findExchanges']>) {
    return this.repository.findExchanges(...args);
  }
  createReturn(...args: Parameters<ClientReturnsRepository['createReturn']>) {
    return this.repository.createReturn(...args);
  }
  createExchange(...args: Parameters<ClientReturnsRepository['createExchange']>) {
    return this.repository.createExchange(...args);
  }
  cancelReturn(...args: Parameters<ClientReturnsRepository['cancelReturn']>) {
    return this.repository.cancelReturn(...args);
  }
  cancelExchange(...args: Parameters<ClientReturnsRepository['cancelExchange']>) {
    return this.repository.cancelExchange(...args);
  }
}
