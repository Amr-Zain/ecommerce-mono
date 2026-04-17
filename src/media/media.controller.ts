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

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ) {
    if (!file) throw new AppException('errors.FILE_REQUIRED', {}, HttpStatus.BAD_REQUEST);
    const result = await this.mediaService.uploadMultiple([file], dto);
    return {
      success: true,
      data: result[0],
    };
  }

  @Post('upload-many')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ) {
    if (!files || files.length === 0) {
      throw new AppException('errors.FILES_REQUIRED', {}, HttpStatus.BAD_REQUEST);
    }
    const result = await this.mediaService.uploadMultiple(files, dto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('attach')
  async attach(@Body() dto: AttachMediaDto) {
    const result = await this.mediaService.attachTempMedia(dto);
    return { success: true, attachedCount: result.count };
  }

  @Get(':uuid')
  async getByUuid(@Param('uuid') uuid: string) {
    const data = await this.mediaService.findByUuid(uuid);
    return { success: true, data };
  }

  @Get('by-entity/:model/:modelId')
  async getByEntity(
    @Param('model') model: string,
    @Param('modelId') modelId: string,
  ) {
    const data = await this.mediaService.findByEntity(model, modelId);
    return { success: true, data };
  }

  @Get('by-entity/:model/:modelId/:collection')
  async getByEntityAndCollection(
    @Param('model') model: string,
    @Param('modelId') modelId: string,
    @Param('collection') collection: string,
  ) {
    const data = await this.mediaService.findByEntity(model, modelId, collection);
    return { success: true, data };
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    await this.mediaService.deleteByUuid(uuid);
    return { success: true, message: 'Media deleted' };
  }
}
