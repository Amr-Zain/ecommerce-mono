import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ParsedQuery } from '../common/decorators/parsed-query.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @RequirePermissions({ resource: 'users', action: 'create' })
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return {
            success: true,
            data: user,
        };
    }

    @Get()
    @RequirePermissions({ resource: 'users', action: 'list' })
    async findAll(@ParsedQuery(UserQueryDto) query: UserQueryDto) {
        const result = await this.usersService.findAll(query);
        return {
            success: true,
            ...result,
        };
    }

    @Get(':id')
    @RequirePermissions({ resource: 'users', action: 'read' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.findOne(BigInt(id));
        return {
            success: true,
            data: user,
        };
    }

    @Patch(':id')
    @RequirePermissions({ resource: 'users', action: 'update' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const user = await this.usersService.update(BigInt(id), updateUserDto);
        return {
            success: true,
            data: user,
        };
    }

    @Delete(':id')
    @RequirePermissions({ resource: 'users', action: 'delete' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.remove(BigInt(id));
        return {
            success: true,
            data: user,
            message: 'User deleted successfully',
        };
    }

    @Get('count/total')
    @RequirePermissions({ resource: 'users', action: 'list' })
    async count() {
        const total = await this.usersService.count();
        return {
            success: true,
            data: { total },
        };
    }
}
