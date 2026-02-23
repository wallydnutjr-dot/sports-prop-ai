import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Camera, BarChart3, Wallet, Settings, Zap, Target } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_6995f76e1fdeeacc4c78fb97/9475f9cff_OWALogoTransparent.png";

const NAV_ITEMS = [
  { name: "Research", page: "SnapResearch", icon: Camera, label: "Research", resetOnClick: true },
  { name: "🔴 Live", page: "LiveSniper", icon: Target, label: "Live" },
  { name: "History", page: "History", icon: BarChart3, label: "History" },
  { name: "Bankroll", page: "Bankroll", icon: Wallet, label: "Bankroll" },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-[hsl(160,20%,4%)] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      {/* Top Header - Global Sticky Navigation (ALWAYS ACCESSIBLE) */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-900/30 bg-[hsl(160,20%,4%)]/98 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("SnapResearch")} className="flex items-center gap-3 group">
              <img src={LOGO_URL} alt="OneWayProps" className="h-10 w-10 rounded-full ring-2 ring-emerald-500/30 group-hover:ring-emerald-400/60 transition-all" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">
                  <span className="text-emerald-400">OneWay</span><span className="text-white">Props</span>
                </h1>
                <p className="text-[10px] text-emerald-600 font-medium -mt-1 tracking-widest uppercase">Deep Research</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = currentPageName === item.page;
                const url = item.resetOnClick && isActive 
                  ? `${createPageUrl(item.page)}?reset=true`
                  : createPageUrl(item.page);
                return (
                  <Link
                    key={item.page}
                    to={url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-400 shadow-inner"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Settings Icon - Mobile & Desktop */}
            <Link
              to={createPageUrl("Settings")}
              className="p-2 text-gray-400 hover:text-white transition-colors no-select"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Account for fixed top nav (64px + safe area) and bottom nav (mobile only) */}
      <main className="pt-16 pb-20 md:pb-6 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar - ALWAYS ACCESSIBLE (Fixed) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-emerald-900/30 bg-[hsl(160,20%,4%)] backdrop-blur-xl">
        <div className="flex items-center justify-around h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPageName === item.page;
            const url = item.resetOnClick && isActive 
              ? `${createPageUrl(item.page)}?reset=true`
              : createPageUrl(item.page);
            return (
              <Link
                key={item.page}
                to={url}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all no-select ${
                  isActive ? "text-emerald-400" : "text-gray-500"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "text-emerald-400" : "text-gray-500"}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>


    </div>
  );
}