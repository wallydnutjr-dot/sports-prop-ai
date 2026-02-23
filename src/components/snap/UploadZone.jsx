import React, { useRef, useState } from "react";
import { Upload, Camera, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadZone({ onFilesUploaded, isUploading, setIsUploading }) {
  const fileRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const filesToProcess = Array.from(files).slice(0, 3);
    
    const newPreviews = filesToProcess.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setIsUploading(true);
    
    const uploadedUrls = await Promise.all(
      filesToProcess.map(file => base44.integrations.Core.UploadFile({ file }))
    );
    
    setIsUploading(false);
    onFilesUploaded(uploadedUrls.map(r => r.file_url));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const clearPreviews = () => {
    setPreviews([]);
    onFilesUploaded([]);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {previews.length === 0 ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 flex flex-col items-center justify-center text-center ${
              dragActive
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-emerald-800/40 bg-emerald-950/20 hover:border-emerald-600/60 hover:bg-emerald-900/10"
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
              dragActive ? "bg-emerald-500/20" : "bg-emerald-900/30"
            }`}>
              <Camera className={`w-8 h-8 transition-colors ${dragActive ? "text-emerald-400" : "text-emerald-600"}`} />
            </div>
            <p className="text-white font-semibold text-lg mb-1">Drop up to 3 screenshots</p>
            <p className="text-gray-500 text-sm mb-4">PNG, JPG — Upload 1-3 sportsbook screenshots at once</p>
            <Button
              variant="outline"
              className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-4"
          >
            <button
              onClick={clearPreviews}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img src={preview} alt={`Screenshot ${idx + 1}`} className="w-full h-32 rounded-xl object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                <div className="flex items-center gap-3 text-emerald-400">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Uploading {previews.length} screenshot{previews.length > 1 ? 's' : ''}...</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}