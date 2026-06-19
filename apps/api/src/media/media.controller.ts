import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { AttachMediaDto } from './dto/attach-media.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('App - Media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadMediaDto) {
    if (!file) throw new AppException('errors.FILE_REQUIRED', {}, HttpStatus.BAD_REQUEST);
    const result = await this.mediaService.uploadMultiple([file], dto);
    return result[0];
  }

  @Post('upload-many')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMany(@UploadedFiles() files: Express.Multer.File[], @Body() dto: UploadMediaDto) {
    if (!files || files.length === 0) {
      throw new AppException('errors.FILES_REQUIRED', {}, HttpStatus.BAD_REQUEST);
    }
    return this.mediaService.uploadMultiple(files, dto);
  }

  @Post('attach')
  async attach(@Body() dto: AttachMediaDto) {
    const result = await this.mediaService.attachTempMedia(dto);
    return { attachedCount: result.count };
  }

  @Get(':uuid')
  async getByUuid(@Param('uuid') uuid: string) {
    return this.mediaService.findByUuid(uuid);
  }

  @Get('by-entity/:model/:modelId')
  async getByEntity(@Param('model') model: string, @Param('modelId') modelId: string) {
    return this.mediaService.findByEntity(model, modelId);
  }

  @Get('by-entity/:model/:modelId/:collection')
  async getByEntityAndCollection(
    @Param('model') model: string,
    @Param('modelId') modelId: string,
    @Param('collection') collection: string,
  ) {
    return this.mediaService.findByEntity(model, modelId, collection);
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    await this.mediaService.deleteByUuid(uuid);
    return { message: 'Media deleted' };
  }
}
