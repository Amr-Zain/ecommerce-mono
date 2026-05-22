import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { USERS_REPOSITORY, User as UserInterface } from '@/common/interfaces';
import { UsersRepository } from '@/core/users/users.repository';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async findAll(query: UserQueryDto, langId: string = 'en'): Promise<PaginatedResult<UserInterface> | UserInterface[]> {
    return this.usersRepository.findAllClients(query, langId);
  }

  async findOne(id: bigint): Promise<UserInterface> {
    const user = await this.usersRepository.findByIdAndType(id, 'client');

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.client_not_found', { args: { id: id.toString() } }));
    }

    return user;
  }
}
