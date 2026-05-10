import { Controller, Get, Post, Patch, Param, Delete, ParseIntPipe, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ParsedQuery } from '../common/decorators/parsed-query.decorator';
import { BodyOmitUndefined } from '../common/decorators/omit-undefined.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import type { PaginationMeta } from '../common/dto/pagination.dto';
import type { User } from './users.repository';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions({ resource: 'users', action: 'create' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @RequirePermissions({ resource: 'users', action: 'list' })
  async findAll(@ParsedQuery(UserQueryDto) query: UserQueryDto): Promise<{
    items: User[];
    meta: PaginationMeta;
  }> {
    const result = await this.usersService.findAll(query);
    return {
      items: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequirePermissions({ resource: 'users', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'users', action: 'update' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @BodyOmitUndefined() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(BigInt(id), updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'users', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ data: User; message: string }> {
    const user = await this.usersService.remove(BigInt(id));
    return {
      data: user,
      message: 'User deleted successfully',
    };
  }

  @Get('count/total')
  @RequirePermissions({ resource: 'users', action: 'list' })
  async count(): Promise<{ total: number }> {
    const total = await this.usersService.count();
    return { total };
  }
}
