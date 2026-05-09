import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { User } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Get all users with pagination and filters
   */
  async findAll(query: UserQueryDto): Promise<PaginatedResult<User>> {
    return this.usersRepository.findAll(query);
  }

  /**
   * Get user by ID
   */
  async findOne(id: bigint): Promise<User> {
    const user = await this.usersRepository.findByIdWithRelations(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    if (createUserDto.email) {
      const emailExists = await this.usersRepository.emailExists(createUserDto.email);

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    const data: any = {
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      phone: createUserDto.phone,
      phoneCode: createUserDto.phoneCode,
      userType: createUserDto.userType || 'client',
      isActive: createUserDto.isActive ?? true,
    };

    // Connect role if provided
    if (createUserDto.roleId) {
      data.role = {
        connect: { id: createUserDto.roleId },
      };
    }

    return this.usersRepository.createUser(data);
  }

  /**
   * Update user
   */
  async update(id: bigint, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.emailExists(updateUserDto.email, id);

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if being updated
    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Handle role update
    if (updateUserDto.roleId) {
      data.role = {
        connect: { id: updateUserDto.roleId },
      };
      delete data.roleId;
    }

    return this.usersRepository.updateUser(id, data);
  }

  /**
   * Delete user
   */
  async remove(id: bigint): Promise<User> {
    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.usersRepository.deleteUser(id);
  }

  /**
   * Get user count
   */
  async count(): Promise<number> {
    return this.usersRepository.count();
  }
}
