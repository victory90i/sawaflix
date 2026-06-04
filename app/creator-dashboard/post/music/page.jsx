"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/client';
import {
    Upload,
    Image as ImageIcon,
    Music,
    X,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Save,
    ChevronDown,
    Music2
} from 'lucide-react';

// --- Sub-component: FileUploadZone ---
const FileUploadZone = ({ title, icon: Icon, accept, file, onFileSelect, onRemove, type = "image" }) => {
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
        <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-gray-100 font-bold text-lg">{title}</p>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`w-full aspect-square flex flex-col items-center justify-center border border-dashed rounded-3xl transition-all cursor-pointer group relative overflow-hidden
          ${file ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 bg-black/10 hover:border-gray-500/40 hover:bg-white/5'}
          ${isDragging ? 'border-red-500 bg-red-500/10 scale-[1.02]' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={Object.values(accept).flat().join(',')}
                    onChange={handleChange}
                    className="hidden"
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2 p-4 text-center w-full h-full justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                            <Icon className="text-red-500" size={24} />
                        </div>
                        <p className="text-xs font-semibold text-white line-clamp-1 px-4 w-full">{file.name}</p>
                        <p className="text-[10px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors z-10"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center mb-6 border border-gray-800 group-hover:scale-110 transition-transform shadow-inner">
                            <Icon className="text-gray-500 group-hover:text-red-500 transition-colors" size={28} />
                        </div>
                        <p className="text-[11px] text-gray-500 mb-6 px-4 leading-relaxed tracking-tight">
                            Drag and drop or click to <br /> <span className="text-gray-400 font-medium">browse {type}</span>
                        </p>
                        <div className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wide rounded-full shadow-lg group-hover:bg-gray-100 transition-colors">
                            Browse file
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function PostMusicPage() {
    // --- Form State ---
    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        description: '',
        tags: '',
        is_featured: false
    });
    const [mediaFiles, setMediaFiles] = useState({
        cover: null,
        audio: null,
    });

    // --- UI States ---
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isDrafting, setIsDrafting] = useState(false);

    // --- Local Storage Hooks ---
    useEffect(() => {
        const saved = localStorage.getItem('sawaflix_music_draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.formData) setFormData(parsed.formData);
            } catch (e) {
                console.error("Failed to load draft");
            }
        }
    }, []);

    const saveDraft = () => {
        setIsDrafting(true);
        localStorage.setItem('sawaflix_music_draft', JSON.stringify({ formData }));
        setTimeout(() => {
            setIsDrafting(false);
            setMessage({ type: 'success', text: 'Draft saved successfully!' });
        }, 800);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.genre || !mediaFiles.audio) {
            setMessage({ 
                type: 'error', 
                text: !mediaFiles.audio ? 'Audio file is required' : 'Please fill in required fields (*)' 
            });
            return;
        }

        // File size check (e.g., 50MB limit for fallback)
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        if (mediaFiles.audio && mediaFiles.audio.size > MAX_SIZE) {
            setMessage({ 
                type: 'error', 
                text: `Audio file is too large (${(mediaFiles.audio.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is 50MB.` 
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('genre', formData.genre);
            payload.append('description', formData.description);
            payload.append('tags', formData.tags);
            payload.append('is_featured', String(formData.is_featured));

            if (mediaFiles.cover) payload.append('cover', mediaFiles.cover);
            if (mediaFiles.audio) payload.append('audio', mediaFiles.audio);

            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user } } = await supabase.auth.getUser();
            const token = session?.access_token;

            let res;
            try {
                res = await fetch(`${BACKEND_URL}/api/content/music/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: payload,
                });
            } catch (fetchErr) {
                console.warn("[Upload] Backend unreachable, falling back to Supabase direct upload", fetchErr);
                
                // --- Supabase Fallback Logic ---
                if (!user) throw new Error("User not authenticated for fallback upload");

                // 1. Upload Audio
                const audioExt = mediaFiles.audio.name.split('.').pop();
                const audioPath = `${user.id}/music/${Date.now()}.${audioExt}`;
                const { data: audioData, error: audioError } = await supabase.storage
                    .from('videos')
                    .upload(audioPath, mediaFiles.audio);
                if (audioError) throw audioError;

                // 2. Upload Cover (optional)
                let coverUrl = null;
                if (mediaFiles.cover) {
                    const coverExt = mediaFiles.cover.name.split('.').pop();
                    const coverPath = `${user.id}/covers/${Date.now()}.${coverExt}`;
                    const { data: coverData, error: coverError } = await supabase.storage
                        .from('videos')
                        .upload(coverPath, mediaFiles.cover);
                    if (!coverError) {
                        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(coverPath);
                        coverUrl = publicUrl;
                    }
                }

                const { data: { publicUrl: audioUrl } } = supabase.storage.from('videos').getPublicUrl(audioPath);

                // 3. Insert into database
                const { error: dbError } = await supabase
                    .from('content')
                    .insert({
                        creator_id: user.id,
                        title: formData.title,
                        category: 'music',
                        genre: formData.genre,
                        description: formData.description,
                        media_url: audioUrl,
                        cover_url: coverUrl,
                        tags: formData.tags.split(',').map(t => t.trim()),
                        visibility: 'public',
                        status: 'approved'
                    });

                if (dbError) throw dbError;

                // Simulate successful response for UI consistency
                res = { ok: true, json: async () => ({ success: true }) };
            }

            const result = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Music published successfully! Redirecting...' });
                localStorage.removeItem('sawaflix_music_draft');
                setTimeout(() => window.location.href = '/creator-dashboard/content', 2000);
            } else {
                setMessage({ type: 'error', text: result.error || 'Upload failed' });
            }
        } catch (err) {
            console.error("[Upload Error]", err);
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Network connection error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

            {/* Header Section */}
            <div className="flex flex-col items-center text-center pt-8 space-y-3">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-2">
                    <Music2 className="text-red-500" size={32} />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Post New Music</h1>
                <p className="text-gray-400 max-w-md mx-auto">Share your cultural sounds and melodies with the Sawaflix community.</p>
            </div>

            <div className="space-y-12">

                {/* TRACK INFO SECTION */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-200">Track Details</h2>
                        <div className="h-[1px] flex-1 bg-gray-800" />
                    </div>

                    <div className="bg-[#0E1628]/40 border border-gray-800/60 rounded-3xl p-8 backdrop-blur-md">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Track Title*</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter song title"
                                    className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>

                            {/* Genre */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Genre*</label>
                                <div className="relative group">
                                    <select
                                        name="genre"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#0F172A]">Choose a genre</option>
                                        <option value="Makossa" className="bg-[#0F172A]">Makossa</option>
                                        <option value="Bikutsi" className="bg-[#0F172A]">Bikutsi</option>
                                        <option value="Afro-Pop" className="bg-[#0F172A]">Afro-Pop</option>
                                        <option value="Highlife" className="bg-[#0F172A]">Highlife</option>
                                        <option value="Gospel" className="bg-[#0F172A]">Gospel</option>
                                        <option value="Traditional" className="bg-[#0F172A]">Traditional</option>
                                        <option value="Other" className="bg-[#0F172A]">Other</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Tags (comma separated)</label>
                                <input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g. cultural, dance, upbeat"
                                    className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>

                            {/* Featured Toggle */}
                            <div className="flex items-center gap-3 pt-8">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="is_featured"
                                        checked={formData.is_featured}
                                        onChange={handleInputChange}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                                <span className="text-sm font-bold text-gray-300">Feature this track on your profile</span>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 lg:col-span-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell the story behind this track..."
                                    className="w-full bg-[#080E1C] border border-gray-800 rounded-xl py-3.5 px-5 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-gray-600 resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* MEDIA ASSETS SECTION */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-200">Media Assets</h2>
                        <div className="h-[1px] flex-1 bg-gray-800" />
                    </div>

                    <div className="bg-[#0E1628]/40 border border-gray-800/60 rounded-3xl p-8 md:p-12 backdrop-blur-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <FileUploadZone
                                title="Audio File*"
                                icon={Music}
                                type="audio"
                                accept={{ "audio/*": [".mp3", ".wav", ".m4a"] }}
                                file={mediaFiles.audio}
                                onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, audio: f }))}
                                onRemove={() => setMediaFiles(prev => ({ ...prev, audio: null }))}
                            />
                            <FileUploadZone
                                title="Cover Art"
                                icon={ImageIcon}
                                type="image"
                                accept={{ "image/*": [".jpeg", ".png", ".jpg", ".webp"] }}
                                file={mediaFiles.cover}
                                onFileSelect={(f) => setMediaFiles(prev => ({ ...prev, cover: f }))}
                                onRemove={() => setMediaFiles(prev => ({ ...prev, cover: null }))}
                            />
                        </div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6">
                    <button
                        onClick={saveDraft}
                        disabled={loading || isDrafting}
                        className="px-8 h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm border border-white/5"
                    >
                        {isDrafting ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                <Save size={18} />
                                Save Draft
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-12 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                <Upload size={18} />
                                Publish Track
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Notifications */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`fixed bottom-10 right-10 z-[100] p-6 rounded-2xl border flex items-center gap-4 shadow-2xl backdrop-blur-xl ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <p className="text-sm font-medium">{message.text}</p>
                        <button onClick={() => setMessage(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-4">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
