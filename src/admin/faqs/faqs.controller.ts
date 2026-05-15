import { Controller, Get, Post, Patch, Param, Delete, ParseIntPipe, Body } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';

@Controller('admin/faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @RequirePermissions({ resource: 'faqs', action: 'create' })
  @UseLanguageTransform()
  async create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqsService.createFaq(createFaqDto);
  }

  @Get()
  @RequirePermissions({ resource: 'faqs', action: 'list' })
  async findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.faqsService.getAllFaqs(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'faqs', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.faqsService.getFaqById(BigInt(id));
  }

  @Get(':id/all-translations')
  @RequirePermissions({ resource: 'faqs', action: 'read' })
  async findOneWithAllTranslations(@Param('id', ParseIntPipe) id: number) {
    return await this.faqsService.getFaqByIdWithAllTranslations(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'faqs', action: 'update' })
  @UseLanguageTransform()
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateFaqDto: UpdateFaqDto) {
    return await this.faqsService.updateFaq(id, updateFaqDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'faqs', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const faq = await this.faqsService.deleteFaq(id);
    return {
      data: faq,
      message: 'FAQ deleted successfully',
    };
  }
}
