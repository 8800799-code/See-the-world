import React from 'react';
import {
  X,
  BookOpen,
  Award,
  Calendar,
  MapPin,
  Volume2,
  Trash2,
  Share2,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { TravelStamp } from '../types.ts';

interface TravelJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  stamps: TravelStamp[];
  onDeleteStamp: (id: string) => void;
  onClearAll: () => void;
  onSelectStamp: (stamp: TravelStamp) => void;
}

export const TravelJournalModal: React.FC<TravelJournalModalProps> = ({
  isOpen,
  onClose,
  stamps,
  onDeleteStamp,
  onClearAll,
  onSelectStamp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-slate-100">
                  Global Travel Passport & Journal
                </h3>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stamps.length} Stamps
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your verified architectural souvenir passport stamps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stamps.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-950/30 transition border border-transparent hover:border-rose-500/30"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Passport Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {stamps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
                <Compass className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-300 mb-1">
                Your Passport Is Awaiting Its First Stamp
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Scan or explore a landmark in the city and click &quot;Stamp Travel Journal&quot; to preserve your architectural memories here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all p-3.5 flex flex-col gap-3 shadow-md hover:shadow-amber-950/30"
                >
                  {/* Photo & Stamp Seal Badge */}
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-900">
                    <img
                      src={stamp.photoUrl}
                      alt={stamp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                    {/* Gold Stamp Seal */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-mono-tech font-bold shadow-lg">
                      <Award className="w-3 h-3" />
                      <span>OFFICIAL AR STAMP</span>
                    </div>

                    <div className="absolute bottom-2 left-2 text-[10px] font-mono-tech text-amber-300/90">
                      {stamp.timestamp}
                    </div>
                  </div>

                  {/* Stamp Details */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                        {stamp.name}
                      </h4>
                      <button
                        onClick={() => onDeleteStamp(stamp.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Delete Stamp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{stamp.city}, {stamp.country}</span>
                      <span>•</span>
                      <span>{stamp.builtYear}</span>
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                      {stamp.summary}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono-tech text-slate-500 truncate max-w-[150px]">
                      {stamp.architecturalStyle}
                    </span>

                    <button
                      onClick={() => {
                        onSelectStamp(stamp);
                        onClose();
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View in AR</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
