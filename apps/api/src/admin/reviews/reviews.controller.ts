import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { ReviewsService } from './reviews.service';
import { ReviewQueryDto } from './dto/review-query.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Reviews')
@ApiBearerAuth('access-token')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @RequirePermissions({ resource: 'reviews', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery(ReviewQueryDto) query: ReviewQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'reviews', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'reviews', action: 'update' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive?: boolean; isApproved?: boolean; isVerified?: boolean },
  ) {
    return this.reviewsService.update(BigInt(id), body);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'reviews', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(BigInt(id));
  }
}
