"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
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
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { contentService } from "@/services/contentService";
import { BACKEND_URL } from "@/lib/apiConfig";
import ThumbnailUploader from "@/components/Dashboard/ThumbnailUploader";

// --- Constants ---
const PLATFORMS = [
    {
        id: 'youtube',
        name: 'YouTube',
        placeholder: 'https://youtube.com/watch?v=...',
        focusColor: 'group-focus-within:text-[#FF0000]',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
        )
    },
    {
        id: 'spotify',
        name: 'Spotify',
        placeholder: 'https://open.spotify.com/track/...',
        focusColor: 'group-focus-within:text-[#1DB954]',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.45 17.34c-.21.344-.664.455-1.008.243-2.76-1.684-6.234-2.062-10.33-.113-.393.187-.86-.022-1.048-.415-.187-.393.022-.86.415-1.048 4.45-2.122 8.282-1.688 11.385.204.344.208.455.662.243 1.006zm1.428-3.187c-.266.43-3.568-1.298-3.535-7.905-1.782-13.06-1.096-.48.224-1.066-.255-.588-.478-.224-1.065 4.35-1.008 9.948-.246 14.07 1.888.428.267.562.756.295 1.185zm1.536-3.327c-4.14-2.456-10.96-2.68-14.88-1.488-.616.186-1.258-.16-1.444-.776-.187-.616.16-1.258.775-1.444 4.54-1.38 12.08-1.12 16.89 1.734.555.328.74 1.046.412 1.602-.33.556-1.047.74-1.603.412z"/>
            </svg>
        )
    },
    {
        id: 'instagram',
        name: 'Instagram',
        placeholder: 'https://instagram.com/reels/...',
        focusColor: 'group-focus-within:text-[#E1306C]',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
        )
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        placeholder: 'https://tiktok.com/@...',
        focusColor: 'group-focus-within:text-[#00f2fe]',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.11 4.46-2.9 5.81-1.66 1.25-3.8 1.63-5.83 1.2-2.03-.43-3.8-1.65-4.83-3.41-1.1-1.85-1.24-4.2-.33-6.14 1.02-2.2 3.12-3.72 5.49-4.05v4.11c-1.07.15-2.09.7-2.67 1.59-.57.88-.71 2.05-.31 3.04.4.98 1.34 1.68 2.37 1.83 1.05.15 2.16-.14 2.88-.88.75-.77 1.08-1.89 1.06-2.98.02-3.95.01-7.9 0-11.85h-2.98V.02z"/>
            </svg>
        )
    },
    {
        id: 'other',
        name: 'Other',
        placeholder: 'https://...',
        focusColor: 'group-focus-within:text-white',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        )
    }
];

// --- Sub-component: FileUploadZone ---
const MainFileUploadZone = ({ file, onFileSelect, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`w-full border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer group relative flex flex-col items-center justify-center
        ${file ? 'border-red-500/50 bg-red-500/5' : 'border-gray-800 bg-black/10 hover:border-gray-500/40 hover:bg-white/5'}
        ${isDragging ? 'border-red-500 bg-red-500/10 scale-[1.01]' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
            {file.type.startsWith('video') ? <Video className="text-red-500" size={28} /> : <Music className="text-red-500" size={28} />}
          </div>
          <p className="text-sm font-bold text-white line-clamp-1">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center mb-6 border border-gray-800 group-hover:scale-110 transition-transform">
            <div className="relative">
               <Music className="text-gray-500 group-hover:text-red-500 transition-colors" size={24} />
               <Video className="absolute -bottom-2 -right-2 text-gray-500 group-hover:text-red-500 transition-colors" size={18} />
            </div>
          </div>
          <p className="text-gray-400 font-medium mb-1">
            Drag and drop your audio or video file here, or <span className="text-red-500">click to upload</span>.
          </p>
          <p className="text-xs text-gray-600">Supports MP3, WAV, MP4, MOV (Max 500MB)</p>
        </div>
      )}
    </div>
  );
};

export default function UnifiedUploadPage() {
  const router = useRouter();

  // --- Form State ---
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [links, setLinks] = useState(['', '', '', '', '']); // Matches PLATFORMS array
  const [tags, setTags] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: At least one input (media file or at least one link)
    const hasAtLeastOneLink = links.some(link => link.trim().length > 0);
    if (!mediaFile && !hasAtLeastOneLink) {
      showToast("error", "Please provide a file to upload or at least one platform link.");
      return;
    }
    
    setLoading(true);
    
    // File size validation for direct upload fallback
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_OTHER_SIZE = 50 * 1024 * 1024;  // 50MB
    const isVideoFile = mediaFile?.type?.startsWith('video');
    const sizeLimit = isVideoFile ? MAX_VIDEO_SIZE : MAX_OTHER_SIZE;

    if (mediaFile && mediaFile.size > sizeLimit) {
      showToast("error", `File is too large (${(mediaFile.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is ${sizeLimit / (1024 * 1024)}MB.`);
      setLoading(false);
      return;
    }

    try {
      const { createClient } = require('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      formData.append("title", form.title || "Untitled Content");
      formData.append("description", form.description || "No description");
      formData.append("tags", tags || "");
      
      // Filter out empty links
      const activeLinks = links.filter(l => l.trim().length > 0);
      formData.append("links", JSON.stringify(activeLinks));

      // Determine category and endpoint dynamically based on file type
      const isVideo = mediaFile?.type?.startsWith('video') || false;
      const endpointPath = isVideo ? '/api/content/movie/upload' : '/api/content/music/upload';
      
      // Append the file using the exact field name the backend expects for that category
      if (mediaFile) {
        if (isVideo) {
          formData.append("video", mediaFile); // movie endpoint expects 'video'
        } else {
          formData.append("media", mediaFile); // music/unified endpoint expects 'media'
          formData.append("genre", "Other");   // music endpoint requires 'genre'
        }
      }

      // We omit thumbnail here unless specifically required to prevent Multer "Unexpected field" crashes

      // Send POST request to the correct category endpoint
      let res;
      try {
        res = await fetch(`${BACKEND_URL}${endpointPath}`, {
          method: "POST",
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData,
        });
      } catch (fetchErr) {
        console.warn("[Upload] Backend unreachable, falling back to Supabase direct upload", fetchErr);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated for fallback upload");

        // 1. Upload Media File
        let mediaUrl = null;
        if (mediaFile) {
          const ext = mediaFile.name.split('.').pop();
          const path = `${user.id}/${isVideo ? 'movies' : 'media'}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('videos')
            .upload(path, mediaFile);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
          mediaUrl = publicUrl;
        }

        // 2. Upload Thumbnail (optional)
        let thumbnailUrl = null;
        if (thumbnail) {
          const ext = thumbnail.name.split('.').pop();
          const path = `${user.id}/thumbnails/${Date.now()}.${ext}`;
          const { error: thumbError } = await supabase.storage
            .from('videos')
            .upload(path, thumbnail);
          if (!thumbError) {
            const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
            thumbnailUrl = publicUrl;
          }
        }

        // 3. Insert into database based on category
        if (isVideo) {
          const { error: dbError } = await supabase
            .from('movies')
            .insert({
              uploaded_by: user.id,
              title: form.title,
              description: form.description,
              video_url: mediaUrl,
              thumbnail: thumbnailUrl,
              is_featured: false,
              created_at: new Date().toISOString()
            });
          if (dbError) throw dbError;
        } else {
          const { error: dbError } = await supabase
            .from('content')
            .insert({
              creator_id: user.id,
              title: form.title,
              description: form.description,
              media_url: mediaUrl,
              cover_url: thumbnailUrl,
              category: 'general',
              tags: tags.split(',').map(t => t.trim()),
              visibility: 'public',
              status: 'approved',
              created_at: new Date().toISOString()
            });
          if (dbError) throw dbError;
        }

        res = { ok: true, json: async () => ({ success: true }) };
      }

      if (!res.ok) {
        let errMsg = `Upload failed with status: ${res.status}`;
        try {
          const errText = await res.text();
          console.log("RAW BACKEND ERROR TEXT:", errText); // Log raw text

          try {
             const errData = JSON.parse(errText);
             console.log("PARSED BACKEND ERROR DATA:", errData); // Log parsed JSON
             errMsg = errData.error || errData.message || JSON.stringify(errData);
          } catch(e) {
             console.log("Failed to parse error as JSON");
             errMsg = errText; // Keep the full text for the error message
          }
        } catch(e) {
           console.log("Failed to read error text:", e);
        }
        
        console.error("FINAL THROWN ERROR:", errMsg);
        throw new Error(errMsg);
      }

      const responseData = await res.json();
      console.log("Upload Success:", responseData);
      
      showToast("success", "Content uploaded successfully!");
      setTimeout(() => router.push("/creator-dashboard/content"), 2000);
    } catch (err) {
      console.error("Upload Error:", err);
      showToast("error", err.message || "Failed to upload content.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center pt-8 space-y-3">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-2">
          <Upload className="text-red-500" size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Upload Content</h1>
        <p className="text-gray-400 max-w-md mx-auto">Upload new music, podcast, or stories directly to Sawaflix.</p>
      </div>

      <div className="space-y-12">
        {/* Main Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-200">Upload Details</h2>
            <div className="h-[1px] flex-1 bg-gray-800" />
          </div>

          <form onSubmit={handleSubmit} className="bg-[#0E1628]/40 border border-gray-800/60 rounded-3xl p-8 backdrop-blur-md space-y-8">
            <div className="grid grid-cols-1 gap-y-8">
              
              {/* Content Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <FileText size={16} className="text-gray-500" />
                  Title*
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  placeholder="e.g. My New Masterpiece"
                  className={inputClass}
                  autoComplete="off"
                  required
                />
              </div>

              {/* Multiple Platform Links */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 ml-1 flex items-center gap-2">
                  <LinkIcon size={16} className="text-gray-500" />
                  Platform Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLATFORMS.map((platform, index) => (
                    <div key={platform.id} className="relative group">
                      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 transition-colors ${platform.focusColor}`}>
                        {platform.icon}
                      </div>
                      <input
                        type="url"
                        value={links[index]}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index] = e.target.value;
                          setLinks(newLinks);
                        }}
                        placeholder={platform.placeholder}
                        className={`${inputClass} pl-12`}
                      />
                    </div>
                  ))}
                </div>
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
                  placeholder="e.g., electronic, afrobeat, podcast, dance"
                  className={inputClass}
                />
              </div>

              {/* Main File Upload Zone */}
              <div className="space-y-4">
                <MainFileUploadZone
                  file={mediaFile}
                  onFileSelect={setMediaFile}
                  onRemove={() => setMediaFile(null)}
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
            <div className="flex items-center justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-16 h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={22} />
                    Submit Content
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
