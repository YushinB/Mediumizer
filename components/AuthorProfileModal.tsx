import React, { useState, useRef } from 'react';
import { X, User, Sparkles, Check, Globe, Star, ShieldCheck, Image as ImageIcon, Upload, Camera } from 'lucide-react';
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setFormData({ ...formData, avatarUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

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

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <div className="flex items-start gap-4 mb-3">
                {/* Avatar Preview with Click-to-Upload Camera Badge */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer shrink-0"
                  title="Click to upload custom avatar image"
                >
                  <img
                    src={formData.avatarUrl}
                    alt={formData.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/40 border-2 border-white shadow-sm transition-all group-hover:brightness-90"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute(
                        'src',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      );
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <Camera size={16} />
                    <span className="text-[9px] font-bold uppercase tracking-tight mt-0.5">Upload</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-gray-600 font-medium">Select avatar preset or upload custom photo:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold transition-all shadow-2xs hover:border-emerald-300 active:scale-95"
                    >
                      <Upload size={13} className="text-emerald-600" />
                      <span>Upload Photo</span>
                    </button>

                    <div className="h-4 w-px bg-gray-200 mx-0.5" />

                    {/* Presets */}
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform ${
                          formData.avatarUrl === preset.url
                            ? 'border-emerald-600 scale-110 shadow-xs'
                            : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold transition-colors ${
                        showCustomAvatarInput
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-600'
                      }`}
                      title="Enter Image Web URL"
                    >
                      <ImageIcon size={13} />
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-2">
                    Supports JPG, PNG, WebP or SVG up to 5MB.
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-2 mb-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {uploadError}
                </div>
              )}

              {showCustomAvatarInput && (
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Paste image web URL (e.g. https://example.com/avatar.jpg)"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
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
