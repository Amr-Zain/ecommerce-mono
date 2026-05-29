"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";

interface ImageUploadButtonProps {
  onImageAdd: (src: string) => void;
}

const ImageUploadButton = ({ onImageAdd }: ImageUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onImageAdd(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button type="button" onClick={handleButtonClick}>
       <ImagePlus size={18}/>
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
};

export default ImageUploadButton;