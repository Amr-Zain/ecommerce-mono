export interface StorageInterface {
  uploadFile(file: Express.Multer.File, model: string, idOrHash: string): Promise<{ path: string; filename: string }>;
  deleteFile(filePath: string): Promise<void>;
  getFileUrl(filePath: string): string;
  moveDir(model: string, oldIdOrHash: string, newIdOrHash: string): Promise<string>;
}
