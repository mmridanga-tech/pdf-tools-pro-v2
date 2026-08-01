import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Star, ArrowRight, X, Clock, Trash2 } from 'lucide-react';
import { PDF_TOOLS } from '../utils/toolsData';
import { getRecentFiles, clearRecentFiles, RecentFileRecord, getFavoriteTools, toggleFavoriteTool } from '../utils/storageUtils';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentFiles, setRecentFiles] = useState<RecentFileRecord[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setRecentFiles(getRecentFiles());
      setFavoriteIds(getFavoriteTools());
    }
  }, [isOpen]);

  const filteredTools = PDF_TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectTool = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleToggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const updated = toggleFavoriteTool(toolId);
    setFavoriteIds(updated);
  };

  const handleClearHistory = () => {
    clearRecentFiles();
    setRecentFiles([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-[#141417] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-100"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-[#0D0D0F]">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a tool name or action (e.g. Merge, Compress, OCR)..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-white mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 border border-slate-800 rounded-md">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {/* Filtered Tools */}
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                PDF Tools ({filteredTools.length})
              </p>
              {filteredTools.length > 0 ? (
                <div className="space-y-1">
                  {filteredTools.map((tool) => {
                    const isFav = favoriteIds.includes(tool.id);
                    return (
                      <div
                        key={tool.id}
                        onClick={() => handleSelectTool(tool.path)}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 cursor-pointer border border-transparent hover:border-slate-800 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleToggleFavorite(e, tool.id)}
                            className={`p-1 rounded-lg transition-colors ${
                              isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                            }`}
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                              {tool.name}
                            </p>
                            <p className="text-xs text-slate-400 line-clamp-1">{tool.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {tool.category}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="p-4 text-center text-xs text-slate-500">
                  No matching tools found for "{query}".
                </p>
              )}
            </div>

            {/* Recent File Processing History */}
            {recentFiles.length > 0 && !query && (
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Recent Activity
                  </span>
                  <button
                    onClick={handleClearHistory}
                    className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>

                <div className="space-y-1">
                  {recentFiles.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-xs text-slate-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-white truncate">{rec.name}</span>
                        <span className="text-slate-500">• {rec.toolName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2.5 bg-[#0D0D0F] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">⌘K</kbd> Toggle Palette
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">ESC</kbd> Close
              </span>
            </div>
            <span className="font-medium text-slate-400">PDF Tools Pro Command Hub</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
