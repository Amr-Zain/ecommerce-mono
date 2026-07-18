import { Injectable } from '@nestjs/common';
import { ClientCartRepository } from './client-cart.repository';

@Injectable()
export class ClientCartService {
  constructor(private readonly repository: ClientCartRepository) {}

  getCart(...args: Parameters<ClientCartRepository['getCart']>) {
    return this.repository.getCart(...args);
  }
  addItem(...args: Parameters<ClientCartRepository['addItem']>) {
    return this.repository.addItem(...args);
  }
  updateItemQuantity(...args: Parameters<ClientCartRepository['updateItemQuantity']>) {
    return this.repository.updateItemQuantity(...args);
  }
  removeItem(...args: Parameters<ClientCartRepository['removeItem']>) {
    return this.repository.removeItem(...args);
  }
  clearCart(...args: Parameters<ClientCartRepository['clearCart']>) {
    return this.repository.clearCart(...args);
  }
}
