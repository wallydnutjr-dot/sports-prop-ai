import React, { useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileImage } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DiscrepancyUploadZone({ onFileUploaded, isUploading, setIsUploading }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onFileUploaded(file_url);
      toast.success("Screenshot uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => fileInputRef.current?.click()}
      className="relative border-2 border-dashed border-emerald-700/40 rounded-xl p-12 text-center cursor-pointer hover:border-emerald-600/60 transition-all bg-[hsl(160,15%,6%)] hover:bg-[hsl(160,15%,7%)]"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <p className="text-emerald-400 font-medium">Uploading screenshot...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Upload DGF Optimizer Screenshot</h3>
              <p className="text-sm text-gray-500">Click to select a screenshot from your DGF Fantasy Optimizer</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FileImage className="w-4 h-4" />
              <span>Supports PNG, JPG, JPEG</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}