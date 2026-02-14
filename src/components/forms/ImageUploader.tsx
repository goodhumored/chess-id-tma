"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { httpClient } from '../../lib/http-client';
import { API_CONFIG } from '../../config/api.config';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageSelected: (imageUrl: string) => void;
  label?: string;
  description?: string;
}

export default function ImageUploader({
  currentImageUrl,
  onImageSelected,
  label = "Загрузить изображение",
  description = "Выберите файл JPG, PNG или WebP (макс. 5MB)",
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Валидация типа файла
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Неподдерживаемый формат файла. Используйте JPG, PNG или WebP.");
      return;
    }

    // Валидация размера файла (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB в байтах
    if (file.size > maxSize) {
      setError("Файл слишком большой. Максимальный размер: 5MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Создаем локальное превью
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Реальная загрузка изображения на бэкенд
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await httpClient.post<{url: string}>('/api/v1/events/upload', formData);
      // Добавляем baseUrl бэкенда к относительному пути изображения
      const imageUrl = response.url.startsWith('http') ? response.url : `${API_CONFIG.BASE_URL}${response.url}`;
      onImageSelected(imageUrl);

      console.log("📸 Image uploaded:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        imageUrl,
      });
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      setError("Не удалось загрузить изображение. Попробуйте ещё раз.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onImageSelected("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-white text-base font-medium">{label}</label>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>

      {/* Превью изображения */}
      {previewUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-800">
          <Image
            src={previewUrl}
            alt="Превью изображения"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
            aria-label="Удалить изображение"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Кнопка загрузки */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Загрузка...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{previewUrl ? "Изменить изображение" : "Выбрать файл"}</span>
          </>
        )}
      </button>

      {/* Подсказка для разработки */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg">
          <p className="text-green-400 text-xs">
            <strong>Dev Note:</strong> Изображения теперь загружаются на бэкенд.
          </p>
        </div>
      )}
    </div>
  );
}