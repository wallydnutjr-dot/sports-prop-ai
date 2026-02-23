import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6995f76e1fdeeacc4c78fb97/9475f9cff_OWALogoTransparent.png";

export default function PageNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <img src={LOGO_URL} alt="OneWayProps" className="w-20 h-20 rounded-full opacity-30 mb-6" />
      <h1 className="text-5xl font-extrabold text-white mb-2">404</h1>
      <p className="text-gray-500 mb-6">Page not found</p>
      <Link to={createPageUrl("SnapResearch")}>
        <Button variant="outline" className="border-emerald-700/40 text-emerald-400 hover:bg-emerald-500/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Research
        </Button>
      </Link>
    </div>
  );
}