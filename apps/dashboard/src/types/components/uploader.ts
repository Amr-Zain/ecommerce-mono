import { ControllerRenderProps, Path } from 'react-hook-form';

type FileType = File;

export interface UploadFile {
  uid: string;
  name: string; // Changed from NamePath to string for file names
  isUploading: boolean;
  url?: string;
  preview?: string;
  originFileObj?: FileType;
  type?: string;
  size?: number;
  response?: { data: { id: string; url: string; [key: string]: any } }; 
}

export interface AppLoaderProps<T extends object = Record<string, any>> {
  initialFileList?: UploadFile[];
  onChange?: (fileList: UploadFile | UploadFile[] | { id: string; url: string; [key: string]: any } | null) => void;
  onRemove?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  disabled?: boolean;
  hideTitle?: boolean;
  singleFile?: boolean;
  field: ControllerRenderProps<Record<string, any>, string>; 
  shapeType?: "picture-card" | "list";
  type_file?: "image" | "document" | "media";
  name: Path<T>;
  model?: string;
  modelId?: string | number;
  collection?: string;
  accept?: string;
  baseUrl?: string;
  maxSize?: number;
  showPreview?: boolean;
  draggable?: boolean;
  apiEndpoint?: string;
}

// New interface for Field component integration
export interface FileUploadInputProps {
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  shapeType?: "picture-card" | "list";
  draggable?: boolean;
  type_file?: "image" | "document" | "media";
  model?: string;
  modelId?: string | number;
  collection?: string;
  apiEndpoint?: string;
  baseUrl?: string;
}
