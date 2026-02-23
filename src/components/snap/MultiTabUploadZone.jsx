import React, { useRef, useState } from "react";
import { Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function MultiTabUploadZone({ onFilesUploaded, isUploading, setIsUploading }) {
  const fileRefs = [useRef(null), useRef(null), useRef(null)];
  const [screenshots, setScreenshots] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [draggedOver, setDraggedOver] = useState(null);

  const handleFile = async (file, index) => {
    if (!file) return;
    
    const preview = URL.createObjectURL(file);
    const newPreviews = [...previews];
    newPreviews[index] = preview;
    setPreviews(newPreviews);
    
    setIsUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    setIsUploading(false);
    
    const newScreenshots = [...screenshots];
    newScreenshots[index] = result.file_url;
    setScreenshots(newScreenshots);
    
    const validUrls = newScreenshots.filter(Boolean);
    onFilesUploaded(validUrls);
  };

  const removeFile = (index) => {
    const newPreviews = [...previews];
    const newScreenshots = [...screenshots];
    newPreviews[index] = null;
    newScreenshots[index] = null;
    setPreviews(newPreviews);
    setScreenshots(newScreenshots);
    
    const validUrls = newScreenshots.filter(Boolean);
    onFilesUploaded(validUrls);
  };

  const clearAll = () => {
    setPreviews([null, null, null]);
    setScreenshots([null, null, null]);
    onFilesUploaded([]);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(index);
  };

  const handleDragLeave = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(null);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0], index);
    }
  };

  const filledCount = screenshots.filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={(e) => handleDragLeave(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${
              draggedOver === index
                ? "border-emerald-400 bg-emerald-500/20 scale-105"
                : "border-emerald-800/40 bg-emerald-950/20 hover:border-emerald-600/60 hover:bg-emerald-900/10"
            }`}
          >
            {previews[index] ? (
              <div className="relative h-40">
                <img 
                  src={previews[index]} 
                  alt={`Screenshot ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Screenshot {index + 1}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRefs[index].current?.click()}
                className="h-40 flex flex-col items-center justify-center cursor-pointer p-4 text-center"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all ${
                  draggedOver === index ? "bg-emerald-500/40 scale-110" : "bg-emerald-900/30"
                }`}>
                  {draggedOver === index ? (
                    <Upload className="w-5 h-5 text-emerald-400 animate-bounce" />
                  ) : (
                    <Camera className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <p className={`text-xs mb-1 transition-colors ${
                  draggedOver === index ? "text-emerald-400 font-semibold" : "text-gray-400"
                }`}>
                  {draggedOver === index ? "Drop here!" : `Screenshot ${index + 1}`}
                </p>
                <p className="text-[10px] text-gray-600">
                  {draggedOver === index ? "Release to upload" : "Click or drag & drop"}
                </p>
              </div>
            )}
            <input
              ref={fileRefs[index]}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], index)}
            />
          </div>
        ))}
      </div>

      {filledCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {filledCount} screenshot{filledCount > 1 ? 's' : ''} uploaded
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="border-red-700/50 text-red-400 hover:bg-red-500/10"
          >
            Clear All
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-emerald-400 py-2">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Uploading...</span>
        </div>
      )}
    </div>
  );
}