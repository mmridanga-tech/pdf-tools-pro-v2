import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/apiClient';
import { extractTextFromPdfFile } from '../utils/pdfExtractUtils';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  Radio,
  Sliders,
} from 'lucide-react';

interface AudioDigest {
  podcastTitle: string;
  estimatedDurationMinutes: number;
  keyHighlights: string[];
  spokenScript: string;
  sections: Array<{ title: string; content: string }>;
}

export const AudioPdfPodcast: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<AudioDigest | null>(null);

  // SpeechSynthesis Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerateDigest = async () => {
    if (!file) {
      setError('Please upload a PDF document.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setDigest(null);
      stopAudio();

      const text = await extractTextFromPdfFile(file);
      if (!text) throw new Error('Could not extract text from document.');

      const response: AudioDigest = await api.geminiAdvanced({
        action: 'audio_summary',
        textContext: text,
        targetLanguage: language,
      });

      setDigest(response);
    } catch (err: any) {
      setError(err?.message || 'Audio digest generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (!digest?.spokenScript || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(digest.spokenScript);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5" />
            <span>AI Neural Voice & Audio Digest Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI Audio PDF & Podcast Voice Reader
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Convert extensive PDF documents, whitepapers, and articles into studio-style spoken audio podcasts with natural rhythm, chapter sections, and customizable voices.
          </p>
        </div>

        {/* Upload & Config */}
        <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="border-2 border-dashed border-white/[0.12] hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-cyan-500/[0.02] group">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-xs">
                  {file ? file.name : 'Select or drop PDF document'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Instant neural script generation</p>
              </label>
            </div>

            {/* Language & Voice Setup */}
            <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-cyan-400" />
                  Narration Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090a10] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="English">English</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateDigest}
                disabled={!file || isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Audio Script</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Player & Content Deck */}
        {digest && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Master Audio Controller Card */}
            <div className="bg-gradient-to-br from-[#0e101a] to-[#121524] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    AI Podcast Episode
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{digest.podcastTitle}</h2>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Estimated runtime: ~{digest.estimatedDurationMinutes} mins • {language}
                  </span>
                </div>

                {/* Playback Primary Buttons */}
                <div className="flex items-center gap-3">
                  {!isPlaying ? (
                    <button
                      onClick={playAudio}
                      className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isPaused ? 'Resume Audio' : 'Play Narration'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseAudio}
                      className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Audio</span>
                    </button>
                  )}

                  <button
                    onClick={stopAudio}
                    className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 transition-colors cursor-pointer"
                    title="Stop Audio"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sliders for Speed & Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Playback Speed: {speechRate}x
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.75"
                    step="0.25"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Pitch Tone: {speechPitch}x
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {voices.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      System Voice
                    </label>
                    <select
                      value={selectedVoiceIndex}
                      onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value, 10))}
                      className="w-full p-1.5 rounded-lg bg-black/40 border border-white/[0.1] text-xs text-white focus:outline-none"
                    >
                      {voices.slice(0, 15).map((v, i) => (
                        <option key={`v-${i}`} value={i}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            {digest.keyHighlights && (
              <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 space-y-3">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Key Executive Takeaways</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {digest.keyHighlights.map((hl, i) => (
                    <li key={`hl-${i}`} className="text-xs text-slate-300 flex items-start gap-2 bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Podcast Transcript / Chapters */}
            <div className="bg-[#0e101a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Spoken Podcast Chapters & Script
              </h3>

              <div className="space-y-4">
                {digest.sections?.map((sec, i) => (
                  <div key={`sec-${i}`} className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2">
                    <span className="text-xs font-bold text-cyan-300 block">{sec.title}</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">{sec.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
