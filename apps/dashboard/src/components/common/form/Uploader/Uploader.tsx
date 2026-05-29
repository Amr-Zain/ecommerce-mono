"use client";

import axiosInstance from "@/services/axiosGeneral";
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react";
import UploadedPreview from "./UploadedPreview";
import { useTranslation } from "react-i18next";
import { AppLoaderProps, UploadFile } from "@/types/components/uploader";
import { Modal } from "../../uiComponents/Modal";
import { useFormState } from "react-hook-form";
import { ImageModal } from "../../uiComponents/ImageModal";

type FileType = File;

export const DEFAULT_UPLOAD_ENDPOINT = "/media/upload";
export const DEFAULT_API_BASE_URL = import.meta.env.VITE_BASE_URL_API || "";

const buildApiUrl = (baseUrl: string, endpoint: string) => {
  if (!baseUrl) return endpoint;
  return `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
};

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const AppUploader = <T extends object = Record<string, any>>({
  initialFileList = [],
  onChange,
  onRemove,
  maxCount = 1,
  disabled = false,
  hideTitle = false,
  singleFile = false,
  field,
  shapeType = "picture-card",
  type_file = "image",
  name,
  model,
  modelId,
  collection,
  accept,
  baseUrl = DEFAULT_API_BASE_URL,
  maxSize = 7,
  showPreview = true,
  draggable = true,
  apiEndpoint = DEFAULT_UPLOAD_ENDPOINT,
}: AppLoaderProps<T>) => {
  const [fileList, setFileList] = useState<UploadFile[]>(initialFileList);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewType, setPreviewType] = useState<
    "image" | "video" | "document" | ""
  >("");
  const { t } = useTranslation();
  const { errors } = useFormState({ name })
  const fileListRef = useRef(fileList);
  fileListRef.current = fileList;

  useEffect(() => {
    if (!initialFileList) return;

    const currentFileList = fileListRef.current;
    
    // Check if the change is just replacing the full object with a string hash
    // This happens because FileUploadField calls field.onChange with the attach_hash, 
    // and then maps that back to a minimal [{ uid: hash, url: hash }] object.
    const isJustHashUpdate = initialFileList.length > 0 && 
      initialFileList.length === currentFileList.length && 
      initialFileList.every((initFile, index) => {
        const currFile = currentFileList[index];
        const currHash = currFile.response?.data?.attach_hash || currFile.response?.data?.uuid || currFile.uid;
        return initFile.uid === currHash || initFile.url === currHash;
    });

    if (isJustHashUpdate) {
      return;
    }

    if (JSON.stringify(initialFileList) !== JSON.stringify(currentFileList)) {
      setFileList(initialFileList);
    }
  }, [initialFileList]);

  useEffect(() => {
    return () => {
      fileListRef.current.forEach((file) => {
        if (file.url?.startsWith && file.url?.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      });
    };
  }, []);

  const validateFile = (file: FileType): string | null => {
    if (accept) {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptTypes.some(acceptType => {
        if (acceptType.endsWith('/*')) {
          const baseType = acceptType.slice(0, -2);
          return file.type.startsWith(baseType);
        }
        return file.type === acceptType;
      });
      
      if (!isAccepted) {
        return `File type ${file.type} is not allowed. Accepted types: ${accept}`;
      }
    }

    if (type_file === "document") {
      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        return t("Messages.onlyPdfAllowed") || "Only PDF files are allowed";
      }
    }

    if (maxSize && file.size && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!showPreview) return;
    if (
      (file?.response?.data?.mime_type || file.type)?.includes('pdf')
    ) {
      setPreviewType('document')
      setPreviewContent(file.url || (file.preview as string))
    } else if (
      (file?.response?.data?.mime_type || file.type)?.startsWith('video')
    ) {
      setPreviewType( 'video')
      if (!file.url && !file.preview && file.originFileObj) {
        file.preview = await getBase64(file.originFileObj as FileType)
      }
      setPreviewContent(file.url || (file.preview as string))
    } else {
      setPreviewType('image')
      if (!file.url && !file.preview && file.originFileObj) {
        file.preview = await getBase64(file.originFileObj as FileType)
      }
      setPreviewContent(file.url || (file.preview as string))
    }
    setPreviewOpen(true);
  };

  const uploadToServer = async (
    file: FileType
  ): Promise<{ data: { id: string; url: string; [key: string]: any } }> => {
    let attachmentType = "";
    if (file.type.startsWith("image/")) {
      attachmentType = "image";
    } else if (file.type.startsWith("video/")) {
      attachmentType = "video";
    } else {
      attachmentType = "file";
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("attachment_type", attachmentType);
    formData.append('model', model || 'applications')
    if (modelId) {
      formData.append('modelId', String(modelId))
    }
    if (collection) {
      formData.append('collection', collection)
    }

    const uploadUrl = buildApiUrl(baseUrl, apiEndpoint);

    const { data } = await axiosInstance({
      method: "POST",
      url: uploadUrl,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  };

  const handleFileUpload = async (files: FileType[]) => {
    try {
      const newFiles: UploadFile[] = [];

      for (const file of files) {
        //Check for duplicate files
        if (fileList.some((f) => f.name === file.name && f.size === file.size)) {
          toast.error(`File "${file.name}" already exists`);
          continue;
        }

        const validationError = validateFile(file);
        if (validationError) {
          toast.error(validationError);
          continue;
        }

        const uploadFile: UploadFile = {
          uid: crypto.randomUUID(),
          name: file.name,
          isUploading: true,
          originFileObj: file,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
        };

        newFiles.push(uploadFile);
      }

      if (newFiles.length === 0) return;

      const currentCount = fileList.length;
      const totalCount = currentCount + newFiles.length;
      
      if (singleFile && newFiles.length > 1) {
        toast.error("Only one file allowed");
        return;
      }

      if (maxCount && totalCount > maxCount) {
        toast.error(`Maximum ${maxCount} files allowed`);
        return;
      }

      const updatedList = singleFile ? newFiles : [...fileList, ...newFiles];
      setFileList(updatedList);

      const uploadedFiles: any[] = [];
      
      for (const file of newFiles) {
        try {
          const response = await uploadToServer(file.originFileObj!);

          const updatedFile: UploadFile = {
            ...file,
            isUploading: false,
            response: response,
            url: file.url,
          };

          setFileList((prev) =>
            prev.map((f) => (f.uid === file.uid ? updatedFile : f))
          );

          uploadedFiles.push(response.data);

        } catch (error: any) {
          console.error("Upload error:", error);
          toast.error(error?.response?.data?.message || `Failed to upload ${file.name}`);

          setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        }
      }

      if (uploadedFiles.length > 0) {
        if (onChange) {
          if (singleFile) {
            onChange(uploadedFiles[0]);
          } else {
            onChange(uploadedFiles);
          }
        } else if (field) {
          if (singleFile) {
            field.onChange(uploadedFiles[0]['attach_hash'] || uploadedFiles[0]['uuid']);
          } else {
            const existingFiles = Array.isArray(field.value) ? field.value : [];
            field.onChange([...existingFiles, ...uploadedFiles]);
          }
        }
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
    }
  };

  const handleRemove = async (file: UploadFile) => {
    try {
      const fileId =
        file.response?.data?.uuid || file.response?.data?.id || (!file.url?.startsWith("blob:") ? file.uid : null);

      if (fileId) {
        try {
          await axiosInstance({
            method: 'delete',
            url: buildApiUrl(baseUrl, `/media/${fileId}`),
          })
        } catch (deleteError) {
          console.warn("Failed to delete file from server:", deleteError);
        }
      }

      const updatedFiles = fileList.filter((item) => item.uid !== file.uid);
      setFileList(updatedFiles);

      if (file.url && file.url.startsWith("blob:")) {
        URL.revokeObjectURL(file.url);
      }

      if (onRemove) {
        onRemove(updatedFiles);
      } else if (onChange) {
        const fileData = updatedFiles.map(f => f.response?.data || f).filter(Boolean);
        if (singleFile) {
          onChange(fileData.length > 0 ? fileData[0] : null);
        } else {
          onChange(fileData as any);
        }
      } else if (field) {
        const fileData = updatedFiles.map(f => f.response?.data || f).filter(Boolean);
        if (singleFile) {
          field.onChange(fileData.length > 0 ? fileData[0] : null);
        } else {
          field.onChange(fileData);
        }
      }

    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !disabled) {
      handleFileUpload(acceptedFiles);
    }
  };

  return (
    <div className="w-full">
      {!hideTitle && (
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <span className="text-sm text-muted-foreground">
            {fileList.length}
            {maxCount ? `/${maxCount}` : ''} {t('Text.files')}
          </span>
        </div>
      )}

      <UploadedPreview
        fileList={fileList}
        showPreview={showPreview}
        shapeType={shapeType}
        handlePreview={handlePreview}
        handleRemove={handleRemove}
        onDrop={onDrop}
        type_file={type_file || previewType}
        maxCount={maxCount}
        accept={accept}
        singleFile={singleFile}
        draggable={draggable}
        disabled={disabled}
        hasError={!!(errors as any)?.[name]}
      />

      {previewType === 'image' ? (
        <ImageModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          imageUrl={previewContent}
          altText="Preview"
        />
      ) : (
        previewOpen && (
          <Modal
            isOpen={previewOpen}
            setIsOpen={() => setPreviewOpen(false)}
            contentClass={
              'bg-transparent !w-[90vw] justify-center p-6 md:p-12 max-w-xl border-none'
            }
          >
            {previewType === 'video' ? (
              <video controls style={{ width: '100%' }}>
                <source src={previewContent} type="video/mp4" />
                {t('common.video_not_supported')}
              </video>
            ) : (
              <iframe
                src={previewContent || ''}
                style={{ width: '100%', height: '500px', border: 'none' }}
                title="Document Preview"
              />
            )}
          </Modal>
        )
      )}
    </div>
  )
};

export default AppUploader;
