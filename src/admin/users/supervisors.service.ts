import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { User } from './users.repository';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../prisma';
import { omitUndefined } from '../../common/utils/omit-undefined.util';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

@Injectable()
export class SupervisorsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async findAll(query: UserQueryDto, langId: string = 'en'): Promise<PaginatedResult<User> | User[]> {
    return this.usersRepository.findAllAdmins(query, langId);
  }

  async findOne(id: bigint): Promise<User> {
    const user = await this.usersRepository.findByIdAndType(id, 'admin');

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.supervisor_not_found', { args: { id: id.toString() } }));
    }

    return user;
  }

  async create(createDto: CreateSupervisorDto): Promise<User> {
    // Check if email already exists
    const emailExists = await this.usersRepository.emailExists(createDto.email);
    if (emailExists) {
      throw new ConflictException(this.i18n.t('errors.email_exists'));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const data: Prisma.UserCreateInput = {
      name: createDto.name,
      email: createDto.email,
      password: hashedPassword,
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

  async update(id: bigint, updateDto: UpdateSupervisorDto): Promise<User> {
    const existingUser = await this.findOne(id);

    if (updateDto.email && updateDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.emailExists(updateDto.email, id);
      if (emailExists) {
        throw new ConflictException(this.i18n.t('errors.email_exists'));
      }
    }

    const { password, passwordConfirm: _pc, roleId, ...rest } = updateDto;
    const data = omitUndefined(rest as Record<string, unknown>) as Prisma.UserUpdateInput;

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

  async remove(id: bigint): Promise<User> {
    await this.findOne(id); // Ensure it's an admin and exists
    return this.usersRepository.deleteUser(id);
  }
}
