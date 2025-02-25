import React, { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import Image from './Image';
import { GalleryItem } from '../../types/common';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate
}) => {
  const currentItem = items[currentIndex];

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    onNavigate(newIndex);
  }, [currentIndex, items.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  }, [currentIndex, items.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handlePrevious, handleNext]);

  if (!currentItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentItem.title}
      className="max-w-5xl w-full mx-4"
    >
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 
            rounded-full text-white transition-colors z-10"
          aria-label="Предыдущее изображение"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 
            rounded-full text-white transition-colors z-10"
          aria-label="Следующее изображение"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Image Container */}
        <div className="relative min-h-[200px] max-h-[70vh] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={currentItem.image}
            alt={currentItem.title}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
            priority
          />
        </div>

        {/* Image Info */}
        <div className="mt-4 space-y-2">
          <p className="text-gray-600">{currentItem.description}</p>
          {currentItem.tags && (
            <div className="flex flex-wrap gap-2">
              {currentItem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {currentItem.date && (
            <p className="text-sm text-gray-500">
              Дата: {new Date(currentItem.date).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImageViewer; 