import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('MediaService', () => {
  let service: MediaService;
  let mockPrisma: any;
  let mockStorage: any;

  beforeEach(async () => {
    mockPrisma = {
      media: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockStorage = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrisma },
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

      mockPrisma.media.create.mockResolvedValue({
        id: 1n,
        uuid: randomUUID(),
        path: '/uploads/product/1/test-hash.jpg',
        filename: 'test-hash.jpg',
        model: 'product',
        modelId: '1',
      });

      const result = await service.uploadMultiple([mockFile], mockDto);

      expect(mockStorage.uploadFile).toHaveBeenCalledWith(mockFile, 'product', '1');
      expect(mockPrisma.media.create).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('/uploads/product/1/test-hash.jpg');
      expect(result[0].id).toBe('1');
    });

    it('should use attachHash if modelId is not provided', async () => {
      const mockFile = { mimetype: 'image/png', originalname: 'a.png', size: 100 } as Express.Multer.File;
      const mockDto = { model: 'product', attachHash: 'hash123' };

      mockStorage.uploadFile.mockResolvedValue({ path: '/a.png', filename: 'a.png' });
      mockPrisma.media.create.mockResolvedValue({ id: 1n });

      await service.uploadMultiple([mockFile], mockDto);
      expect(mockStorage.uploadFile).toHaveBeenCalledWith(mockFile, 'product', 'hash123');
    });
  });

  describe('attachTempMedia', () => {
    it('should update media matching model and attachHash', async () => {
      const dto = { model: 'product', attachHash: 'hash123', modelId: '99' };
      mockPrisma.media.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.attachTempMedia(dto);
      expect(mockPrisma.media.updateMany).toHaveBeenCalledWith({
        where: { model: 'product', attachHash: 'hash123', modelId: null },
        data: { modelId: '99', attachHash: null },
      });
      expect(result.count).toBe(2);
    });
  });

  describe('findByUuid', () => {
    it('should return media if found', async () => {
      const mockMedia = { id: 1n, uuid: '123' };
      mockPrisma.media.findUnique.mockResolvedValue(mockMedia);

      const result = await service.findByUuid('123');
      expect(result.id).toBe('1');
      expect(result.uuid).toBe('123');
    });

    it('should throw NotFoundException if media not found', async () => {
      mockPrisma.media.findUnique.mockResolvedValue(null);
      await expect(service.findByUuid('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete from storage and database', async () => {
      const mockMedia = { id: 1n, uuid: '123', path: '/uploads/a.png' };
      mockPrisma.media.findUnique.mockResolvedValue(mockMedia);

      const result = await service.deleteByUuid('123');
      expect(mockStorage.deleteFile).toHaveBeenCalledWith('/uploads/a.png');
      expect(mockPrisma.media.delete).toHaveBeenCalledWith({ where: { id: 1n } });
      expect(result).toBe(true);
    });
  });
});
