"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Link2,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Music,
  Video,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { contentService } from "@/services/contentService";
import ThumbnailUploader from "@/components/Dashboard/ThumbnailUploader";
import Link from "next/link";

export default function EditContentPage() {
  const router = useRouter();
  const { id } = useParams();

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // --- Form State ---
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "music",
  });
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Since we don't have a getSingleContent in contentService yet, we'll fetch from the aggregator or direct endpoint
        // For now, let's assume the user has the ID and we can fetch it.
        // If not available, we can redirect back.
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://sawaflix-backend.onrender.com'}/api/content/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "music",
          });
          setTags(data.tags || "");
          if (data.thumbnail) setThumbnail(data.thumbnail);
        } else {
          showToast("error", "Failed to load content details.");
        }
      } catch (err) {
        showToast("error", "Connection error.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContent();
  }, [id]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { createClient } = require('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://sawaflix-backend.onrender.com'}/api/content/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title: form.title }),
      });

      if (!res.ok) {
        let errMsg = `Update failed with status: ${res.status}`;
        try {
          const errData = await res.json();
          errMsg = errData.error || errData.message || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const responseData = await res.json();
      console.log("Update Success:", responseData);
      
      showToast("success", "Changes saved successfully!");
      setTimeout(() => router.push("/creator-dashboard/content"), 1500);
    } catch (err) {
      console.error("Update Error:", err);
      showToast("error", err.message || "Failed to update content.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center pt-8 space-y-3">
        <Link 
            href="/creator-dashboard/content"
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
        >
            <ArrowLeft size={16} /> Back to Library
        </Link>
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-2">
          <LinkIcon className="text-blue-500" size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Edit Content</h1>
        <p className="text-gray-400 max-w-md mx-auto">Update your content details and keep your audience engaged.</p>
      </div>

      <div className="space-y-12">
        {/* Main Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-200">Content Details</h2>
            <div className="h-[1px] flex-1 bg-gray-800" />
          </div>

          <form onSubmit={handleUpdate} className="bg-[#0E1628]/40 border border-gray-800/60 rounded-3xl p-8 backdrop-blur-md space-y-8">
            <div className="grid grid-cols-1 gap-y-8">
              
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <FileText size={16} className="text-gray-500" />
                  Title*
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  placeholder="Enter title"
                  className={inputClass}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <FileText size={16} className="text-gray-500" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  rows={4}
                  placeholder="Tell your audience what this content is about..."
                  className={`${inputClass} resize-none leading-relaxed`}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <Tag size={16} className="text-gray-500" />
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., cultural, dance, upbeat"
                  className={inputClass}
                />
              </div>

              {/* Thumbnail */}
              <div className="space-y-4 pt-4 border-t border-gray-800/50">
                <label className="text-sm font-bold text-gray-300 ml-1">Thumbnail Upload</label>
                <ThumbnailUploader
                  file={thumbnail}
                  onSelect={setThumbnail}
                  onRemove={() => setThumbnail(null)}
                  label="Thumbnail"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <Link
                href="/creator-dashboard/content"
                className="px-8 h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm border border-white/5"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-12 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-10 right-10 z-[100] p-6 rounded-2xl border flex items-center gap-4 shadow-2xl backdrop-blur-xl ${toast.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toast.type === "success" ? "bg-green-500/20" : "bg-red-500/20"}`}>
              {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <p className="text-sm font-medium">{toast.text}</p>
            <button onClick={() => setToast(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-4">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
