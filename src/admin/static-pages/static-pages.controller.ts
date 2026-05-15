import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { StaticPageService } from './static-pages.service';
import { StaticPage } from './static-pages.repository';
import { CreateStaticPageDto } from './dto/create-static-page.dto';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { Prisma } from '@/prisma';

@Controller('/static-pages')
export class StaticPagesController {
  constructor(private readonly staticPageService: StaticPageService) {}

  @Get()
  async getAllStaticPagesWithAllSections(
    @ParsedQuery() query: AdvancedQueryDto = {},
  ): Promise<StaticPage[] | PaginatedResult<StaticPage>> {
    return this.staticPageService.getAllStticPagesWithAllSections(query);
  }

  @Post()
  @UseLanguageTransform({ recursive: true })
  async createStaticPage(@Body() staticPage: CreateStaticPageDto): Promise<StaticPage> {
    return this.staticPageService.createStaticPage(staticPage as unknown as Prisma.StaticPageCreateInput);
  }

  @Patch(':id')
  @UseLanguageTransform({ recursive: true })
  async updateStaticPage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaticPageDto: UpdateStaticPageDto,
  ): Promise<StaticPage> {
    return this.staticPageService.updateStaticPage(updateStaticPageDto as unknown as Prisma.StaticPageUpdateInput, id);
  }

  @Delete(':id')
  async deleteStaticPage(@Param('id', ParseIntPipe) id: number): Promise<StaticPage> {
    return this.staticPageService.deleteStaticPage(id);
  }

  // Section Endpoints
  @Post(':pageId/sections')
  @UseLanguageTransform()
  async createSection(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body() sectionData: Prisma.PageSectionCreateInput,
  ) {
    return this.staticPageService.createSection(pageId, sectionData);
  }

  @Patch('sections/:id')
  @UseLanguageTransform()
  async updateSection(@Param('id', ParseIntPipe) id: number, @Body() sectionData: Record<string, unknown>) {
    return this.staticPageService.updateSection(sectionData, id);
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return this.staticPageService.deleteSection(id);
  }
}
