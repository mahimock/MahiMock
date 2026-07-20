import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface BookmarkButtonProps {
  itemId: string;
  itemType: 'Test' | 'Material' | 'Chapter';
  itemData: any;
  className?: string;
  showText?: boolean;
}

export default function BookmarkButton({ itemId, itemType, itemData, className = "", showText = false }: BookmarkButtonProps) {
  const { currentUser } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !itemId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', currentUser.uid, 'bookmarks', `${itemType}_${itemId}`);
    const unsub = onSnapshot(docRef, (docSnap) => {
      setIsBookmarked(docSnap.exists());
      setLoading(false);
    }, (error) => {
      console.error('Bookmark sync error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser, itemId, itemType]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('Please login to bookmark items');
      return;
    }

    setActionLoading(true);
    const docRef = doc(db, 'users', currentUser.uid, 'bookmarks', `${itemType}_${itemId}`);

    try {
      if (isBookmarked) {
        await deleteDoc(docRef);
        toast.success('Removed from bookmarks');
      } else {
        await setDoc(docRef, {
          itemId,
          itemType,
          itemData,
          createdAt: Date.now()
        });
        toast.success('Saved to bookmarks');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update bookmark');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={toggleBookmark}
      disabled={actionLoading}
      className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
        isBookmarked 
        ? 'text-[#5B5FFB] bg-[#5B5FFB]/10 hover:bg-[#5B5FFB]/20' 
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
      } ${className}`}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {actionLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-5 h-5 fill-current" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
      {showText && (
        <span className="text-sm font-bold">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  );
}
