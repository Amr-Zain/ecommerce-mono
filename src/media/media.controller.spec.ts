import { Test, TestingModule } from '@nestjs/testing';

jest.mock('./dto/upload-media.dto', () => ({
  UploadMediaDto: class {},
  ALLOWED_MEDIA_MODELS: [],
}));
jest.mock('./dto/attach-media.dto', () => ({
  AttachMediaDto: class {},
}));

import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { AppException } from '../common/exceptions/app.exception';

describe('MediaController', () => {
  let controller: MediaController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      uploadMultiple: jest.fn(),
      attachTempMedia: jest.fn(),
      findByUuid: jest.fn(),
      findByEntity: jest.fn(),
      deleteByUuid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: MediaService, useValue: mockService }],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadSingle', () => {
    it('should successfully call uploadMultiple and return first item', async () => {
      const file = {} as Express.Multer.File;
      const dto = { model: 'product' };
      mockService.uploadMultiple.mockResolvedValue([{ id: '1', path: '/file.png' }]);

      const result = await controller.uploadSingle(file, dto);
      expect(mockService.uploadMultiple).toHaveBeenCalledWith([file], dto);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
    });

    it('should throw AppException if file is missing', async () => {
      await expect(controller.uploadSingle(undefined as any, { model: 'product' })).rejects.toThrow(AppException);
    });
  });

  describe('uploadMany', () => {
    it('should call uploadMultiple for multiple files', async () => {
      const files = [{} as Express.Multer.File, {} as Express.Multer.File];
      const dto = { model: 'product' };
      mockService.uploadMultiple.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const result = await controller.uploadMany(files, dto);
      expect(mockService.uploadMultiple).toHaveBeenCalledWith(files, dto);
      expect(result.data).toHaveLength(2);
    });

    it('should throw AppException if files are missing or empty', async () => {
      await expect(controller.uploadMany([], { model: 'product' })).rejects.toThrow(AppException);
      await expect(controller.uploadMany(undefined as any, { model: 'product' })).rejects.toThrow(AppException);
    });
  });

  describe('attach', () => {
    it('should map temp hash to real model ID successfully', async () => {
      const dto = { model: 'product', attachHash: 'hash1', modelId: '10' };
      mockService.attachTempMedia.mockResolvedValue({ count: 3 });

      const result = await controller.attach(dto);
      expect(mockService.attachTempMedia).toHaveBeenCalledWith(dto);
      expect(result.attachedCount).toBe(3);
    });
  });

  describe('getByEntity', () => {
    it('should return matching entities array', async () => {
      mockService.findByEntity.mockResolvedValue([{ id: '1' }]);
      const result = await controller.getByEntity('product', '5');
      expect(mockService.findByEntity).toHaveBeenCalledWith('product', '5');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should remove target by UUID', async () => {
      const result = await controller.delete('123-uuid');
      expect(mockService.deleteByUuid).toHaveBeenCalledWith('123-uuid');
      expect(result.success).toBe(true);
    });
  });
});
