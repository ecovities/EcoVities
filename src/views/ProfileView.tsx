import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

export function ProfileView() {
  const navigate = useNavigate();
  const { account, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: account?.full_name || '',
    phone: account?.phone || ''
  });

  const handleUpdate = async () => {
    try {
      await supabase.from('accounts').update(formData).eq('id', account?.id);
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to update profile changes:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'ecovities_avatars'); 
    
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dctc2vtcc/image/upload', {
        method: 'POST', 
        body: fd
      });
      const data = await res.json();
      
      if (data.secure_url) {
        await supabase.from('accounts').update({ avatar_url: data.secure_url }).eq('id', account?.id);
        window.location.reload();
      }
    } catch (err) {
      console.error("Image asset hosting failure:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 pb-8 min-h-screen bg-surface dark:bg-black text-on-surface dark:text-gray-100 transition-colors duration-300">
      {/* View Header Bar with Navigation Back Arrow */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center p-1.5 rounded-full hover:bg-surface-container-high dark:hover:bg-gray-800 transition-colors active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-rounded text-2xl">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <button 
          onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} 
          className="text-primary font-semibold text-sm tracking-wide transition-opacity hover:opacity-80"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      {/* Picture & Info Segment */}
      <div className="flex flex-col items-center mb-8">
        <label className="relative cursor-pointer select-none">
          <div className="w-24 h-24 rounded-full bg-surface-container dark:bg-gray-900 flex items-center justify-center overflow-hidden border-4 border-surface-container-high dark:border-gray-800 shadow-sm transition-all">
            {uploading ? (
              <span className="material-symbols-rounded text-3xl text-primary animate-spin">progress_activity</span>
            ) : (account as any)?.avatar_url ? (
              <img 
                src={(account as any).avatar_url} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="material-symbols-rounded text-4xl text-gray-400">person</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-105">
            <span className="material-symbols-rounded text-sm">photo_camera</span>
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
        </label>
        <p className="mt-4 font-semibold text-lg">{account?.full_name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{account?.eco_id}</p>
      </div>

      {/* Database Schema Forms */}
      <div className="bg-white dark:bg-surface-container rounded-3xl p-5 shadow-sm border border-surface-container-high dark:border-gray-800 mb-8 transition-colors duration-300">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">FULL NAME</label>
            {isEditing ? (
              <input 
                type="text"
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                className="w-full bg-transparent border-b border-surface-container-highest dark:border-gray-700 py-1 focus:border-primary transition-colors" 
              />
            ) : (
              <p className="font-medium">{account?.full_name}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">PHONE NUMBER</label>
            {isEditing ? (
              <input 
                type="tel"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="w-full bg-transparent border-b border-surface-container-highest dark:border-gray-700 py-1 focus:border-primary transition-colors" 
              />
            ) : (
              <p className="font-medium">{account?.phone || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Material Menu Block List */}
      <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 px-2 tracking-widest">SETTINGS</h2>
      <div className="bg-white dark:bg-surface-container rounded-3xl shadow-sm border border-surface-container-high dark:border-gray-800 divide-y divide-surface-container-high dark:divide-gray-800 overflow-hidden transition-colors duration-300">
        <SettingItem icon="shield" label="Security & Privacy" />
        <SettingItem icon="notifications" label="Notifications" />
        
        {/* Native Interactive Toggle Pattern */}
        <div 
          onClick={toggleTheme} 
          className="flex justify-between items-center p-4 hover:bg-surface-container-high/30 dark:hover:bg-gray-800/30 cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <span className="material-symbols-rounded text-[22px] text-gray-400 dark:text-gray-500">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="font-medium text-[15px]">App Theme</span>
          </div>
          <span className="text-sm font-semibold text-primary bg-primary-container/40 px-3 py-1 rounded-full transition-all">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </div>

        <SettingItem icon="help" label="Help & Support" />
      </div>

      {/* Premium Adaptive Sign-Out Endpoint */}
      <button 
        onClick={signOut} 
        className="w-full mt-8 py-3.5 bg-red-50 dark:bg-red-950/20 text-error hover:bg-red-100/60 dark:hover:bg-red-900/30 font-semibold rounded-2xl text-[15px] tracking-wide transition-all active:scale-[0.99] border border-red-100 dark:border-red-900/40"
      >
        Sign Out
      </button>
    </div>
  );
}

function SettingItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-surface-container-high/30 dark:hover:bg-gray-800/30 cursor-pointer transition-all active:scale-[0.99]">
      <div className="flex items-center gap-3.5">
        <span className="material-symbols-rounded text-[22px] text-gray-400 dark:text-gray-500">{icon}</span>
        <span className="font-medium text-[15px]">{label}</span>
      </div>
      <span className="material-symbols-rounded text-gray-400 dark:text-gray-600 text-[20px]">chevron_right</span>
    </div>
  );
}
