import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MAX_UPLOAD_BYTES, UploadValidationPipe } from './upload-security';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
  'base64',
);
const file = (buffer: Buffer, mimetype = 'image/png', originalname = 'image.png') =>
  ({ buffer, mimetype, originalname, size: buffer.length }) as Express.Multer.File;

describe('Upload security', () => {
  const pipe = new UploadValidationPipe();
  let app: INestApplication;
  const uploadMultiple = jest.fn().mockResolvedValue([{ id: '1' }]);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: MediaService, useValue: { uploadMultiple } }],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  beforeEach(() => uploadMultiple.mockClear());
  afterAll(async () => app.close());

  it.each([
    ['image.png', 'image/png', png],
    ['image.jpg', 'image/jpeg', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])],
    ['image.gif', 'image/gif', Buffer.from('GIF89a0000000000')],
    [
      'image.webp',
      'image/webp',
      Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 '), Buffer.alloc(16)]),
    ],
    ['document.pdf', 'application/pdf', Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF')],
  ])('accepts matching %s content', async (name, mime, buffer) => {
    await expect(pipe.transform(file(buffer, mime, name))).resolves.toBeDefined();
  });

  it.each([
    ['image.png', 'image/png', Buffer.from('<svg></svg>')],
    ['image.svg', 'image/svg+xml', Buffer.from('<svg></svg>')],
    ['document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', png],
    ['video.mp4', 'video/mp4', png],
    ['image.jpg', 'image/jpeg', png],
    ['image.svg', 'image/png', png],
    ['image.png', 'image/png', Buffer.alloc(0)],
  ])('rejects invalid or disallowed %s (%s)', async (name, mime, buffer) => {
    await request(app.getHttpServer())
      .post('/media/upload')
      .attach('file', buffer, { filename: name, contentType: mime })
      .expect(400);
    expect(uploadMultiple).not.toHaveBeenCalled();
  });

  it('accepts a valid multipart upload', async () => {
    await request(app.getHttpServer())
      .post('/media/upload')
      .field('model', 'product')
      .attach('file', png, 'image.png')
      .expect(201);
    expect(uploadMultiple).toHaveBeenCalledTimes(1);
  });

  it('rejects a disguised file in a batch before storing any files', async () => {
    await request(app.getHttpServer())
      .post('/media/upload-many')
      .attach('files', png, 'image.png')
      .attach('files', Buffer.from('not a PNG'), 'disguised.png')
      .expect(400);
    expect(uploadMultiple).not.toHaveBeenCalled();
  });

  it('rejects more than ten files', async () => {
    const req = request(app.getHttpServer()).post('/media/upload-many');
    for (let i = 0; i < 11; i++) req.attach('files', png, `image${i}.png`);
    await req.expect(400);
    expect(uploadMultiple).not.toHaveBeenCalled();
  });

  it('rejects oversized files during multipart parsing', async () => {
    await request(app.getHttpServer())
      .post('/media/upload')
      .attach('file', Buffer.alloc(MAX_UPLOAD_BYTES + 1), 'large.png')
      .expect(413);
    expect(uploadMultiple).not.toHaveBeenCalled();
  });
});
