"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  X
} from "lucide-react";
import { Button } from "@ecommerce/ui/components/button";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}


export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  altText = "Preview"
}: ImageModalProps) {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, imageUrl]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "+") setScale(s => Math.min(s + 0.25, 4));
      if (e.key === "-") setScale(s => Math.max(s - 0.25, 0.5));
      if (e.key === "r" || e.key === "R") setRotation(r => (r + 90) % 360);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // First attempt: Fetch as blob to force download (requires CORS on server)
      const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (!response.ok) throw new Error('Fetch status not OK');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Determine file extension
      const extension = imageUrl.split('.').pop()?.split(/[?#]/)[0] || 'png';
      const fileName = (altText || "image").replace(/[^a-z0-9]/gi, '_');
      link.download = `${fileName}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.warn("Direct download failed due to CORS. Please enable 'Access-Control-Allow-Origin' on the server storage path.", error);
      
      // Fallback: This will likely open the image in a new tab if CORS headers are missing.
      // There is no client-side way to force a download for cross-origin assets without CORS.
      const link = document.createElement("a");
      link.href = imageUrl;
      link.target = "_blank";
      link.setAttribute("download", altText || "image");
      link.click();
    }
  };

  const toggleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation(r => (r + 90) % 360);
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(s => Math.min(s + 0.25, 4));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(s => Math.max(s - 0.25, 0.5));
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Main Container */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 md:p-10 select-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                title={t('imageModal.zoomInTitle')}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                title={t('imageModal.zoomOutTitle')}
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRotate}
                className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                title={t('imageModal.rotateTitle')}
              >
                <RotateCw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                title={t('imageModal.fullscreenTitle')}
              >
                <Maximize className="w-5 h-5" />
              </Button>

              <div className="w-px h-6 bg-white/10 mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                title={t('imageModal.download')}
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-10 h-10 rounded-xl text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-95 ms-2"
                title={t('imageModal.closeTitle')}
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Image Wrapper (Draggable) */}
            <div className="w-full h-full flex items-center justify-center cursor-move" onClick={onClose}>
              <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.1}
                whileDrag={{ cursor: "grabbing" }}
                onClick={(e) => e.stopPropagation()}
                style={{ scale, rotate: rotation }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="relative"
              >
                <motion.img
                  layoutId="image-preview"
                  src={imageUrl}
                  alt={altText}
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] pointer-events-none"
                  draggable={false}
                />
              </motion.div>
            </div>

            {/* Metadata / Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900/80 backdrop-blur-2xl rounded-xl border border-white/10 pointer-events-none flex items-center gap-3"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1">{t('imageModal.scale')}</span>
                <span className="text-xs font-mono text-zinc-200">{Math.round(scale * 100)}%</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1">{t('imageModal.rotation')}</span>
                <span className="text-xs font-mono text-zinc-200">{rotation}°</span>
              </div>
            </motion.div>

            {/* Side Close Button (Visual Hint) */}
            <button
              onClick={onClose}
              className="absolute top-1/2 right-10 -translate-y-1/2 w-12 h-12 hidden lg:flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/30 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
