import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Award,
  MapPin,
  Calendar,
  ExternalLink,
  Sparkles,
  Volume2,
  Send,
} from 'lucide-react';
import { TravelStamp } from '../types.ts';
import { shareTravelStamp } from '../services/api.ts';

interface ShareStampModalProps {
  stamp: TravelStamp | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareStampModal: React.FC<ShareStampModalProps> = ({
  stamp,
  isOpen,
  onClose,
}) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareId, setShareId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !stamp) {
      setShareUrl('');
      setShareId('');
      setCopied(false);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    shareTravelStamp(stamp)
      .then((res) => {
        if (!isMounted) return;
        setShareUrl(res.shareUrl);
        setShareId(res.shareId);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to create share link:', err);
        // Fallback to client-side encoded URL
        const fallbackUrl = `${window.location.origin}/?stampName=${encodeURIComponent(
          stamp.name
        )}&city=${encodeURIComponent(stamp.city)}`;
        setShareUrl(fallbackUrl);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, stamp]);

  if (!isOpen || !stamp) return null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share || !shareUrl) return;
    try {
      await navigator.share({
        title: `Explore ${stamp.name} on UrbanLens AR`,
        text: `Check out my verified travel discovery of ${stamp.name} in ${stamp.city}, ${stamp.country}!`,
        url: shareUrl,
      });
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('Native share failed:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                <Share2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-100">
                Share Landmark Stamp
              </h3>
              <p className="text-xs text-slate-400">
                Public link with AR view & historic narration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Postcard Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-xl p-4 flex flex-col gap-3">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900">
              <img
                src={stamp.photoUrl}
                alt={stamp.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

              {/* Gold Official Stamp Seal */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-mono-tech font-bold shadow-lg">
                <Award className="w-3.5 h-3.5 fill-current" />
                <span>OFFICIAL AR STAMP</span>
              </div>

              {stamp.audioUrl && (
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-purple-300 text-[11px] font-mono-tech border border-purple-500/40">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Narration Audio</span>
                </div>
              )}

              <div className="absolute bottom-2.5 left-2.5 text-[11px] font-mono-tech text-cyan-300">
                Stamped on {stamp.timestamp}
              </div>
            </div>

            {/* Stamp Metadata Details */}
            <div className="flex flex-col gap-1">
              <h4 className="font-display font-bold text-base text-slate-100">
                {stamp.name}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {stamp.city}, {stamp.country}
                </span>
                <span>•</span>
                <span>{stamp.builtYear}</span>
              </p>
              <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                {stamp.summary}
              </p>
            </div>
          </div>

          {/* Share Link Input Box */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono-tech text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Unique Public Travel Link:</span>
              </span>
              {shareId && (
                <span className="text-[10px] text-slate-500 font-mono-tech">
                  ID: {shareId}
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={isLoading ? 'Generating unique public link...' : shareUrl}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono-tech text-slate-200 select-all focus:outline-none focus:border-cyan-500 truncate"
                />
              </div>

              <button
                onClick={handleCopyLink}
                disabled={isLoading || !shareUrl}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-md shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {copied && (
              <p className="text-[11px] text-emerald-400 font-mono-tech flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3" />
                <span>Link copied to clipboard! Anyone with this link can view this landmark stamp.</span>
              </p>
            )}
          </div>

          {/* Native Share button if supported */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              disabled={isLoading || !shareUrl}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share via Social or Messaging Apps</span>
            </button>
          )}

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-cyan-300">How it works:</span> Friends who open this link will see your souvenir passport stamp, can play the historic narration audio clip, and can explore the landmark directly in the AR Viewfinder!
          </div>
        </div>
      </div>
    </div>
  );
};
