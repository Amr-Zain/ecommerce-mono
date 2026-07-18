import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { USERS_REPOSITORY, User as UserInterface } from '@/common/interfaces';
import { UsersRepository } from '@/core/users/users.repository';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import { omitUndefined } from '@/common/utils/omit-undefined.util';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

@Injectable()
export class SupervisorsService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async findAll(query: UserQueryDto, langId: string = 'en'): Promise<PaginatedResult<UserInterface> | UserInterface[]> {
    return this.usersRepository.findAllAdmins(query, langId);
  }

  async findOne(id: bigint): Promise<UserInterface> {
    const user = await this.usersRepository.findByIdAndType(id, 'admin');

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.supervisor_not_found', { args: { id: id.toString() } }));
    }

    return user;
  }

  async create(createDto: CreateSupervisorDto): Promise<UserInterface> {
    // Check if email already exists
    const emailExists = await this.usersRepository.emailExists(createDto.email);
    if (emailExists) {
      throw new ConflictException(this.i18n.t('errors.email_exists'));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const data: Parameters<UsersRepository['createUser']>[0] = {
      name: createDto.name,
      email: createDto.email,
      password: hashedPassword,
      gender: createDto.gender,
      phone: createDto.phone,
      phoneCode: createDto.phoneCode,
      userType: 'admin',
      isActive: createDto.isActive ?? true,
      role: {
        connect: { id: createDto.roleId },
      },
    };

    return this.usersRepository.createUser(data);
  }

  async update(id: bigint, updateDto: UpdateSupervisorDto): Promise<UserInterface> {
    const existingUser = await this.findOne(id);

    if (existingUser.roleId === 1n) {
      throw new BadRequestException(this.i18n.t('errors.cannot_edit_super_admin_user'));
    }

    if (updateDto.email && updateDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.emailExists(updateDto.email, id);
      if (emailExists) {
        throw new ConflictException(this.i18n.t('errors.email_exists'));
      }
    }

    const { password, passwordConfirm: _pc, roleId, ...rest } = updateDto;
    const data = omitUndefined(rest as Record<string, unknown>) as Parameters<UsersRepository['updateUser']>[1];

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (roleId) {
      data.role = {
        connect: { id: roleId },
      };
    }

    return this.usersRepository.updateUser(id, data);
  }

  async remove(id: bigint): Promise<UserInterface> {
    const existingUser = await this.findOne(id); // Ensure it's an admin and exists

    if (existingUser.roleId === 1n) {
      throw new BadRequestException(this.i18n.t('errors.cannot_delete_super_admin_user'));
    }
    return this.usersRepository.deleteUser(id);
  }
}
