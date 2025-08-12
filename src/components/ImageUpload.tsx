import React, { useRef } from 'react';
import { Image } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 sm:p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-gray-300 hover:text-white"
        title="Upload image"
      >
        <Image className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </>
  );
}