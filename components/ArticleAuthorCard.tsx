import React, { useState } from 'react';
import {
  Star,
  UserPlus,
  UserCheck,
  Clapperboard,
  Bookmark,
  MessageCircle,
  Share2,
  Edit3,
  ThumbsUp,
  BookOpen
} from 'lucide-react';
import { AuthorProfile } from '../types';

interface ArticleAuthorHeaderProps {
  profile: AuthorProfile;
  wordCount: number;
  onEditProfile: () => void;
}

export const ArticleAuthorHeader: React.FC<ArticleAuthorHeaderProps> = ({
  profile,
  wordCount,
  onEditProfile,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [claps, setClaps] = useState(48);
  const [hasClapped, setHasClapped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleClap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClaps((prev) => prev + 1);
    setHasClapped(true);
  };

  return (
    <div className="w-full my-8 pb-6 border-b border-gray-100 font-sans">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Author Avatar & Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={onEditProfile} title="Click to edit Author Profile">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 hover:ring-emerald-500 transition-all"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute(
                  'src',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                );
              }}
            />
            {profile.isMediumMember && (
              <span
                className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 shadow-xs"
                title="Medium Member"
              >
                <Star size={10} className="fill-white stroke-none" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900 hover:underline cursor-pointer">
                {profile.name}
              </span>

              {profile.publicationName && (
                <>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-xs text-gray-600 font-medium hover:text-gray-900 cursor-pointer">
                    In <span className="underline decoration-gray-300 underline-offset-2">{profile.publicationName}</span>
                  </span>
                </>
              )}

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition-all ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span>{readTimeMinutes} min read</span>
              <span>•</span>
              <span>{profile.publishDate || 'Jul 25, 2026'}</span>
            </div>
          </div>
        </div>

        {/* Medium Action Bar & Edit Trigger */}
        <div className="flex items-center gap-3 text-gray-500">
          
          {/* Clap Button */}
          <button
            onClick={handleClap}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              hasClapped
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Clap for this story"
          >
            <span className="text-sm">👏</span>
            <span>{claps}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-1.5 rounded-full transition-colors ${
              isBookmarked ? 'text-emerald-600 bg-emerald-50' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Save story'}
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-emerald-600' : ''} />
          </button>

          {/* Edit Author Profile Trigger */}
          <button
            onClick={onEditProfile}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1 rounded-full transition-colors border border-gray-200"
            title="Edit author profile & publication metadata"
          >
            <Edit3 size={13} />
            <span className="hidden sm:inline">Edit Author</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export interface ArticleAuthorFooterProps {
  profile: AuthorProfile;
  onEditProfile: () => void;
}

export const ArticleAuthorFooter: React.FC<ArticleAuthorFooterProps> = ({
  profile,
  onEditProfile,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="mt-16 pt-8 border-t border-gray-200/80 bg-gray-50/50 rounded-2xl p-6 sm:p-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
        
        <div className="flex items-start gap-4">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              );
            }}
          />

          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-1">
              WRITTEN BY
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-0.5 flex items-center gap-2">
              <span>{profile.name}</span>
              {profile.username && (
                <span className="text-xs font-normal text-gray-500">{profile.username}</span>
              )}
            </h3>

            {profile.tagline && (
              <p className="text-xs font-semibold text-emerald-800 mb-2">{profile.tagline}</p>
            )}

            {profile.bio && (
              <p className="text-xs text-gray-600 max-w-lg leading-relaxed mb-3">{profile.bio}</p>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{profile.followersCount || '14.2K'} Followers</span>
              {profile.publicationName && (
                <>
                  <span>•</span>
                  <span>Editor at <strong className="text-gray-700">{profile.publicationName}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isFollowing
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow Author'}
          </button>

          <button
            onClick={onEditProfile}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-full border border-gray-200 transition-colors"
            title="Edit Author Settings"
          >
            <Edit3 size={15} />
          </button>
        </div>

      </div>
    </div>
  );
};
