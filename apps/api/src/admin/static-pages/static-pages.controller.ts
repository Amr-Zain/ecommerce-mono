import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { StaticPageService } from './static-pages.service';
import { StaticPage as StaticPageInterface } from '@/common/interfaces';
import { CreateStaticPageDto } from './dto/create-static-page.dto';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Static-pages')
@ApiBearerAuth('access-token')
@Controller('/static-pages')
export class StaticPagesController {
  constructor(private readonly staticPageService: StaticPageService) {}

  @Get()
  @ApiAdvancedQuery()
  async getAllStaticPagesWithAllSections(
    @ParsedQuery() query: AdvancedQueryDto = {},
  ): Promise<StaticPageInterface[] | PaginatedResult<StaticPageInterface>> {
    return this.staticPageService.getAllStticPagesWithAllSections(query);
  }

  @Get(':id')
  async getStaticPageByIdWithAllSections(@Param('id', ParseIntPipe) id: number): Promise<StaticPageInterface> {
    return this.staticPageService.getStaticPageByIdWithAllSections(id);
  }

  @Post()
  @UseLanguageTransform({ recursive: true })
  async createStaticPage(@Body() staticPage: CreateStaticPageDto): Promise<StaticPageInterface> {
    return this.staticPageService.createStaticPage(staticPage);
  }

  // Section Endpoints
  @Post(':pageId/sections')
  @UseLanguageTransform()
  async createSection(@Param('pageId', ParseIntPipe) pageId: number, @Body() sectionData: Record<string, unknown>) {
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

  @Patch(':id')
  @UseLanguageTransform({ recursive: true })
  async updateStaticPage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaticPageDto: UpdateStaticPageDto,
  ): Promise<StaticPageInterface> {
    return this.staticPageService.updateStaticPage(updateStaticPageDto, id);
  }

  @Delete(':id')
  async deleteStaticPage(@Param('id', ParseIntPipe) id: number): Promise<StaticPageInterface> {
    return this.staticPageService.deleteStaticPage(id);
  }
}
