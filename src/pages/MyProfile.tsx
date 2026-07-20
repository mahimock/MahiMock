import React, { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, User as UserIcon, Mail, Phone, Calendar, MapPin, Target, Trophy, Activity, Award, Settings, LogOut, ChevronRight, Moon, Bell, Globe, Shield, HelpCircle, Heart, Lock, FileQuestion, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { useNavigate, Link } from 'react-router-dom';

export default function MyProfile() {
  const { currentUser, userProfile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile Data
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    gender: '',
    dob: '',
    state: '',
    district: '',
    category: ''
  });

  const [stats, setStats] = useState({
    testsAttempted: 0,
    avgAccuracy: 0,
    totalScore: 0,
    timeTaken: 0,
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        mobile: (userProfile as any).mobile || '',
        gender: (userProfile as any).gender || '',
        dob: (userProfile as any).dob || '',
        state: (userProfile as any).state || '',
        district: (userProfile as any).district || '',
        category: (userProfile as any).category || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) return;
      try {
        const resQuery = query(collection(db, 'results'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(resQuery);
        
        let totalAttempted = snap.docs.length;
        let totalAccuracy = 0;
        let totalScore = 0;
        let totalTime = 0;
        
        const activities: any[] = [];

        snap.docs.forEach(docSnap => {
          const data = docSnap.data();
          
          let score = data.score || 0;
          let accuracy = data.accuracy || 0;
          let timeTaken = data.timeTaken || 0;
          
          totalScore += score;
          totalAccuracy += accuracy;
          totalTime += timeTaken;
          
          activities.push({
            id: docSnap.id,
            testId: data.testId,
            score: score,
            submittedAt: data.submittedAt,
            accuracy: accuracy
          });
        });

        // Try to get test names for recent activity
        activities.sort((a, b) => b.submittedAt - a.submittedAt);
        const topActivities = activities.slice(0, 3);
        
        for (const act of topActivities) {
          try {
            const tSnap = await getDoc(doc(db, 'tests', act.testId));
            if (tSnap.exists()) {
              act.testName = tSnap.data().title || 'Mock Test';
            } else {
              act.testName = 'Unknown Test';
            }
          } catch(e) {
            act.testName = 'Mock Test';
          }
        }
        
        setStats({
          testsAttempted: totalAttempted,
          avgAccuracy: totalAttempted > 0 ? Math.round(totalAccuracy / totalAttempted) : 0,
          totalScore: Math.round(totalScore),
          timeTaken: totalTime,
          loading: false
        });
        
        setRecentActivity(topActivities);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({...prev, loading: false}));
      }
    };
    
    fetchUserStats();
  }, [currentUser]);

  const handleRemovePhoto = async () => {
    if (!currentUser) return;
    setUploading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { photoURL: null }, { merge: true });
      await refreshProfile();
      toast.success('Profile photo removed');
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, JPEG and SVG are allowed');
      return;
    }

    setUploading(true);
    try {
      const downloadURL = await uploadImageToCloudinary(file);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { photoURL: downloadURL }, { merge: true });
      
      await refreshProfile();
      toast.success('Profile photo updated successfully');
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, formData, { merge: true });
      await refreshProfile();
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#12121A]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB] mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Unknown date';
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#12121A] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 pb-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Photo & Stats */}
          <div className="space-y-6">
            {/* Profile Photo Card */}
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5B5FFB]/10 to-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              {userProfile?.photoURL && !uploading && (
                <button 
                  onClick={handleRemovePhoto}
                  className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/50 hover:bg-red-50 dark:hover:bg-red-500/20 text-red-500 rounded-full backdrop-blur-md transition-colors z-10"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="relative w-[140px] h-[140px] rounded-full border-4 border-white dark:border-[#2A2A3D] shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 mb-6">
                {userProfile?.photoURL ? (
                  <img loading="lazy" src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 uppercase">
                    {userProfile?.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
                  </div>
                )}

                <div 
                  className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  <Camera className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept=".png,.jpg,.jpeg,.svg" 
                className="hidden" 
              />
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{userProfile?.name || 'User'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{currentUser.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5B5FFB]/10 border border-[#5B5FFB]/20">
                <span className="text-xs font-black text-[#5B5FFB] uppercase tracking-wider">{userProfile?.role || 'Student'}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Statistics</h3>
              {stats.loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#5B5FFB] animate-spin" />
                </div>
              ) : stats.testsAttempted === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p>No tests attempted yet.</p>
                  <Link to="/exams" className="text-[#5B5FFB] font-medium text-sm mt-2 inline-block">Start practicing</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl">
                    <Activity className="w-6 h-6 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.testsAttempted}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Attempted</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl">
                    <Target className="w-6 h-6 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgAccuracy}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Avg Accuracy</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-2xl">
                    <Award className="w-6 h-6 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Score</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-2xl">
                    <Clock className="w-6 h-6 text-orange-500 mb-2" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-1">{formatTime(stats.timeTaken)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Time Spent</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              {stats.loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-[#5B5FFB] animate-spin" />
                </div>
              ) : recentActivity.length === 0 ? (
                 <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p>No recent activity available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => {
                    const colors = ['blue', 'emerald', 'purple'];
                    const color = colors[idx % colors.length];
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2A2A3D] transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-200 dark:border-white/5 cursor-pointer" onClick={() => navigate(`/test-result/${activity.testId}`)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-${color}-50 dark:bg-${color}-500/10 flex items-center justify-center`}>
                            <FileQuestion className={`w-5 h-5 text-${color}-500`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{activity.testName}</p>
                            <p className="text-xs text-gray-500">{formatDate(activity.submittedAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{activity.score}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] focus:outline-none dark:text-white transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={currentUser.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" /> Mobile Number
                  </label>
                  <input 
                    type="tel" 
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] focus:outline-none dark:text-white transition-all"
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Date of Birth
                  </label>
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] focus:outline-none dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" /> Gender
                  </label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] focus:outline-none dark:text-white transition-all appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> State
                  </label>
                  <input 
                    type="text" 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] focus:outline-none dark:text-white transition-all"
                    placeholder="Enter your state"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> District
                  </label>
                  <input 
                    type="text" 
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] focus:outline-none dark:text-white transition-all"
                    placeholder="Enter your district"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" /> Preferred Exam Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] focus:outline-none dark:text-white transition-all appearance-none"
                  >
                    <option value="">Select Category</option>
                    <option value="upsc">UPSC Civil Services</option>
                    <option value="ssc">SSC Exams</option>
                    <option value="banking">Banking & Insurance</option>
                    <option value="railway">Railway Exams</option>
                    <option value="teaching">Teaching Exams</option>
                    <option value="defence">Defence Exams</option>
                    <option value="state">State PSC</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 bg-[#5B5FFB] hover:bg-[#4A4EEA] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
                <button className="w-full sm:w-auto px-8 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Change Password
                </button>
              </div>
            </div>

            {/* Settings Menu */}
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] p-4 shadow-sm border border-gray-100 dark:border-white/5">
              <div className="space-y-1">
                {[
                  { icon: Moon, label: 'Dark Mode', action: 'toggle' },
                  { icon: Bell, label: 'Notifications', action: 'link' },
                  { icon: Globe, label: 'Language', action: 'link', value: 'English' },
                  { icon: Shield, label: 'Privacy & Security', action: 'link' },
                  { icon: HelpCircle, label: 'Help & Support', action: 'link' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2A2A3D] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#5B5FFB] group-hover:text-white transition-colors">
                        <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:hover:text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.value && <span className="text-sm text-gray-500">{item.value}</span>}
                      {item.action === 'toggle' ? (
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                        </div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B5FFB]" />
                      )}
                    </div>
                  </div>
                ))}
                
                <div 
                  onClick={handleLogout}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer group mt-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                      <LogOut className="w-5 h-5 text-red-500 group-hover:text-gray-900 dark:hover:text-white" />
                    </div>
                    <span className="font-medium text-red-600 dark:text-red-400">Logout</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
