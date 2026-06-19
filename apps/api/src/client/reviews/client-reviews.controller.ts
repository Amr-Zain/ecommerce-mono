import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientReviewsService } from './client-reviews.service';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from './dto/review.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Reviews')
@Controller('reviews')
export class ClientReviewsController {
  constructor(private readonly reviewsService: ClientReviewsService) {}

  @Public()
  @Get('products/:productId')
  findByProduct(@Param('productId') productId: string, @Query() query: ReviewQueryDto, @I18nLang() lang?: string) {
    return this.reviewsService.findByProduct(BigInt(productId), query, lang || 'en');
  }

  @ApiBearerAuth('access-token')
  @Get('products/:productId/me')
  findMine(@CurrentUser() user: { id: bigint }, @Param('productId') productId: string) {
    return this.reviewsService.findMine(user.id, BigInt(productId));
  }

  @ApiBearerAuth('access-token')
  @Post()
  create(@CurrentUser() user: { id: bigint }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @ApiBearerAuth('access-token')
  @Put(':id')
  update(@CurrentUser() user: { id: bigint }, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(user.id, BigInt(id), dto);
  }

  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.reviewsService.remove(user.id, BigInt(id));
  }
}
