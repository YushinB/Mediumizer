import React, { useState } from 'react';
import { X, User, Sparkles, Check, Globe, Star, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { AuthorProfile } from '../types';
import { AVATAR_PRESETS } from '../utils/authorStorage';

interface AuthorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AuthorProfile;
  onSaveProfile: (updated: AuthorProfile) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<AuthorProfile>(profile);
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in my-8">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-gray-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl text-emerald-400 border border-white/10">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Author & Publication Settings</h3>
                <p className="text-xs text-gray-300">Customize how your Medium story author card appears.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Author Avatar
              </label>
              
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={formData.avatarUrl}
                  alt={formData.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/30 border border-gray-200 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute(
                      'src',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    );
                  }}
                />
                
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-2">Choose preset or enter custom image URL:</div>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                          formData.avatarUrl === preset.url
                            ? 'border-emerald-600 scale-110 shadow-xs'
                            : 'border-transparent hover:scale-105'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold"
                      title="Custom Image URL"
                    >
                      <ImageIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {showCustomAvatarInput && (
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              )}
            </div>

            {/* Author Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="@alexrivera"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Author Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Tech & AI Columnist"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Author Short Bio
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a brief author bio for the bottom story card..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
              />
            </div>

            {/* Publication Name & Followers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Publication Name
                </label>
                <input
                  type="text"
                  value={formData.publicationName}
                  onChange={(e) => setFormData({ ...formData, publicationName: e.target.value })}
                  placeholder="e.g. Towards AI & Technology"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Followers Display Count
                </label>
                <input
                  type="text"
                  value={formData.followersCount}
                  onChange={(e) => setFormData({ ...formData, followersCount: e.target.value })}
                  placeholder="e.g. 14.2K"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mediumMember"
                  checked={formData.isMediumMember}
                  onChange={(e) => setFormData({ ...formData, isMediumMember: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-xs border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="mediumMember" className="text-xs font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span>Display Medium Member Badge</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-xs transition-colors"
              >
                <Check size={14} />
                <span>Save Profile Settings</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default AuthorProfileModal;
