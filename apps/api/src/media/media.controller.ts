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
import { Throttle } from '@nestjs/throttler';
import { MAX_UPLOAD_FILES, uploadOptions, UploadValidationPipe } from './upload-security';

@ApiTags('App - Media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadSingle(@UploadedFile(new UploadValidationPipe()) file: Express.Multer.File, @Body() dto: UploadMediaDto) {
    if (!file) throw new AppException('errors.FILE_REQUIRED', {}, HttpStatus.BAD_REQUEST);
    const result = await this.mediaService.uploadMultiple([file], dto);
    return result[0];
  }

  @Post('upload-many')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseInterceptors(FilesInterceptor('files', MAX_UPLOAD_FILES, uploadOptions))
  async uploadMany(
    @UploadedFiles(new UploadValidationPipe()) files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ) {
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
