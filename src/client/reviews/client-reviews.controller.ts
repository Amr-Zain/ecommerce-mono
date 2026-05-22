import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { Public } from '@/auth/decorators/public.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ClientReviewsService } from './client-reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@ApiContext('client')
@Controller('reviews')
export class ClientReviewsController {
  constructor(private readonly reviewsService: ClientReviewsService) {}

  @Public()
  @Get('products/:productId')
  findByProduct(@Param('productId') productId: string, @I18nLang() lang?: string) {
    return this.reviewsService.findByProduct(BigInt(productId), lang || 'en');
  }

  @Post()
  create(@CurrentUser() user: { id: bigint }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: { id: bigint }, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(user.id, BigInt(id), dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.reviewsService.remove(user.id, BigInt(id));
  }
}