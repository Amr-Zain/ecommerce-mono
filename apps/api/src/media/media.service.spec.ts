import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { MEDIA_REPOSITORY } from './media.repository.port';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('MediaService', () => {
  let service: MediaService;
  let mockRepository: any;
  let mockStorage: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findTemporary: jest.fn(),
      attach: jest.fn(),
      findByUuid: jest.fn(),
      findByEntity: jest.fn(),
      findByEntities: jest.fn(),
      findProductImages: jest.fn(),
      findEntityRecords: jest.fn(),
      deleteEntityRecords: jest.fn(),
      deleteById: jest.fn(),
    };

    mockStorage = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: MEDIA_REPOSITORY, useValue: mockRepository },
        { provide: 'StorageInterface', useValue: mockStorage },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadMultiple', () => {
    it('should upload files and store metadata', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1024,
      } as Express.Multer.File;

      const mockDto = {
        model: 'product',
        modelId: '1',
      };

      mockStorage.uploadFile.mockResolvedValue({
        path: '/uploads/product/1/test-hash.jpg',
        filename: 'test-hash.jpg',
      });

      mockRepository.create.mockResolvedValue({
        id: 1n,
        uuid: randomUUID(),
        path: '/uploads/product/1/test-hash.jpg',
        filename: 'test-hash.jpg',
        model: 'product',
        modelId: '1',
      });

      const result = await service.uploadMultiple([mockFile], mockDto);

      expect(mockStorage.uploadFile).toHaveBeenCalledWith(mockFile, 'product', '1');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('/uploads/product/1/test-hash.jpg');
      expect(result[0].id).toBe('1');
    });

    it('should use attachHash if modelId is not provided', async () => {
      const mockFile = { mimetype: 'image/png', originalname: 'a.png', size: 100 } as Express.Multer.File;
      const mockDto = { model: 'product', attachHash: 'hash123' };

      mockStorage.uploadFile.mockResolvedValue({ path: '/a.png', filename: 'a.png' });
      mockRepository.create.mockResolvedValue({ id: 1n });

      await service.uploadMultiple([mockFile], mockDto);
      expect(mockStorage.uploadFile).toHaveBeenCalledWith(mockFile, 'product', 'hash123');
    });
  });

  describe('attachTempMedia', () => {
    it('should update media matching model and attachHash', async () => {
      const dto = { model: 'product', attachHash: 'hash123', modelId: '99' };
      mockRepository.findTemporary.mockResolvedValue([
        { id: 1n, path: '/uploads/product/hash123/a.png', attachHash: 'hash123' },
        { id: 2n, path: '/uploads/product/hash123/b.png', attachHash: 'hash123' },
      ]);
      mockStorage.moveDir = jest.fn().mockResolvedValue('/uploads/product/99');
      mockRepository.attach.mockResolvedValue(undefined);

      const result = await service.attachTempMedia(dto);
      expect(mockRepository.findTemporary).toHaveBeenCalledWith('product', ['hash123'], undefined);
      expect(mockRepository.attach).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 1n, modelId: 99n })]),
        undefined,
      );
      expect(result.count).toBe(2);
    });
  });

  describe('findByUuid', () => {
    it('should return media if found', async () => {
      const mockMedia = { id: 1n, uuid: '123' };
      mockRepository.findByUuid.mockResolvedValue(mockMedia);

      const result = await service.findByUuid('123');
      expect(result.id).toBe('1');
      expect(result.uuid).toBe('123');
    });

    it('should throw NotFoundException if media not found', async () => {
      mockRepository.findByUuid.mockResolvedValue(null);
      await expect(service.findByUuid('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete from storage and database', async () => {
      const mockMedia = { id: 1n, uuid: '123', path: '/uploads/a.png' };
      mockRepository.findByUuid.mockResolvedValue(mockMedia);

      const result = await service.deleteByUuid('123');
      expect(mockStorage.deleteFile).toHaveBeenCalledWith('/uploads/a.png');
      expect(mockRepository.deleteById).toHaveBeenCalledWith(1n);
      expect(result).toBe(true);
    });
  });
});
