import { Injectable } from '@nestjs/common';
import { ProfileQueryRepository } from './profile-query.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileQueryRepository) {}

  getProfile(...args: Parameters<ProfileQueryRepository['getProfile']>) {
    return this.repository.getProfile(...args);
  }
  updateProfile(...args: Parameters<ProfileQueryRepository['updateProfile']>) {
    return this.repository.updateProfile(...args);
  }
  updateImage(...args: Parameters<ProfileQueryRepository['updateImage']>) {
    return this.repository.updateImage(...args);
  }
  listPaymentSessions(...args: Parameters<ProfileQueryRepository['listPaymentSessions']>) {
    return this.repository.listPaymentSessions(...args);
  }
  getPaymentSession(...args: Parameters<ProfileQueryRepository['getPaymentSession']>) {
    return this.repository.getPaymentSession(...args);
  }
  listSessions(...args: Parameters<ProfileQueryRepository['listSessions']>) {
    return this.repository.listSessions(...args);
  }
  revokeSession(...args: Parameters<ProfileQueryRepository['revokeSession']>) {
    return this.repository.revokeSession(...args);
  }
}
