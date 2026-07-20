import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  increment,
  Timestamp
} from 'firebase/firestore';
import { 
  MessageSquare, 
  ThumbsUp, 
  Reply, 
  MoreVertical, 
  Flag, 
  Send, 
  Loader2,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  likes: string[];
  replies?: Comment[];
  createdAt: any;
  isReported?: boolean;
}

interface Props {
  questionId: string;
  testId?: string;
}

export default function QuestionDiscussion({ questionId }: Props) {
  const { currentUser, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!questionId) return;

    const q = query(
      collection(db, 'discussions', questionId, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: Comment[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Comment));
      setComments(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'discussions', questionId, 'comments'), {
        userId: currentUser.uid,
        userName: userProfile?.name || 'Anonymous Aspirant',
        userPhoto: currentUser.photoURL || '',
        text: newComment.trim(),
        likes: [],
        createdAt: Timestamp.now(),
        isReported: false
      });
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, liked: boolean) => {
    if (!currentUser) {
      toast.error('Please login to like comments');
      return;
    }
    const ref = doc(db, 'discussions', questionId, 'comments', commentId);
    await updateDoc(ref, {
      likes: liked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    });
  };

  const handleReport = async (commentId: string) => {
    if (!currentUser) return;
    const ref = doc(db, 'discussions', questionId, 'comments', commentId);
    await updateDoc(ref, { isReported: true });
    toast.success('Reported to moderator');
  };

  return (
    <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#5B5FFB]" /> 
            Question Discussion
         </h3>
         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{comments.length} Comments</span>
      </div>

      <div className="p-6">
        {/* Input */}
        <form onSubmit={handleSubmit} className="mb-8">
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#5B5FFB] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#5B5FFB]/20 font-bold">
                 {userProfile?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 relative">
                 <textarea 
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   placeholder="Share your logic or ask a doubt..."
                   className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#5B5FFB] outline-none transition-all resize-none text-sm font-medium pr-12"
                   rows={2}
                 />
                 <button 
                   disabled={submitting || !newComment.trim()}
                   className="absolute bottom-3 right-3 p-2 bg-[#5B5FFB] text-white rounded-xl hover:bg-[#4A4DE0] transition-all disabled:opacity-50 shadow-sm"
                 >
                   {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                 </button>
              </div>
           </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
           {loading ? (
             <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#5B5FFB] mx-auto" /></div>
           ) : comments.length === 0 ? (
             <div className="py-12 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MessageSquare className="w-6 h-6 text-gray-200" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Be the first to start the discussion!</p>
             </div>
           ) : (
             comments.map((c) => {
               const hasLiked = currentUser && c.likes?.includes(currentUser.uid);
               return (
                 <div key={c.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 font-bold border border-gray-50">
                       {c.userPhoto ? <img loading="lazy" src={c.userPhoto} className="w-full h-full rounded-xl object-cover" /> : c.userName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="bg-gray-50 rounded-2xl p-4 relative">
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="text-sm font-bold text-gray-900">{c.userName}</h4>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                               {c.createdAt ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                             </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
                       </div>
                       
                       <div className="flex items-center gap-6 mt-2 px-2">
                          <button 
                            onClick={() => handleLike(c.id, !!hasLiked)}
                            className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-colors ${hasLiked ? 'text-[#5B5FFB]' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                             <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                             {c.likes?.length || 0}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#5B5FFB] transition-colors">
                             <Reply className="w-3.5 h-3.5" />
                             Reply
                          </button>
                          <button 
                            onClick={() => handleReport(c.id)}
                            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <Flag className="w-3.5 h-3.5" />
                             Report
                          </button>
                       </div>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </div>
      
      <div className="p-4 bg-[#F8FAFC] border-t border-gray-50 text-center">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Guidelines: Be respectful and helpful to your peers.</p>
      </div>
    </div>
  );
}
