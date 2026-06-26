import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

export function ProfileView() {
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
      console.error("Failed to update profile:", err);
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
      console.error("Cloudinary upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 pb-8 min-h-screen bg-surface dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-on-surface dark:text-white">Profile</h1>
        <button 
          onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} 
          className="text-primary font-semibold text-sm tracking-wide"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <label className="relative cursor-pointer group">
          <div className="w-24 h-24 rounded-full bg-surface-container dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-surface-container-high dark:border-gray-700 shadow-sm transition-all">
            {uploading ? (
              <span className="material-symbols-rounded text-3xl text-primary animate-spin">progress_activity</span>
            ) : (account as any)?.avatar_url ? (
              <img 
                src={(account as any).avatar_url} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback safely if url fails to load, avoiding console 404 blockages
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="material-symbols-rounded text-4xl text-gray-400">person</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md flex items-center justify-center">
            <span className="material-symbols-rounded text-sm">photo_camera</span>
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
        </label>
        <p className="mt-4 font-semibold text-lg text-on-surface dark:text-white">{account?.full_name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{account?.eco_id}</p>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 transition-colors">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">FULL NAME</label>
            {isEditing ? (
              <input 
                type="text"
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 text-on-surface dark:text-white focus:border-primary" 
              />
            ) : (
              <p className="text-on-surface dark:text-gray-200 font-medium">{account?.full_name}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">PHONE NUMBER</label>
            {isEditing ? (
              <input 
                type="tel"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 text-on-surface dark:text-white focus:border-primary" 
              />
            ) : (
              <p className="text-on-surface dark:text-gray-200 font-medium">{account?.phone || 'Not added'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Menu Block */}
      <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 px-2 tracking-widest">SETTINGS</h2>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden transition-colors">
        <SettingItem icon="shield" label="Security & Privacy" />
        <SettingItem icon="notifications" label="Notifications" />
        
        {/* Dynamic Theme Interactive Toggle */}
        <div 
          onClick={toggleTheme} 
          className="flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5 text-on-surface dark:text-gray-200">
            <span className="material-symbols-rounded text-[22px] text-gray-500 dark:text-gray-400">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="font-medium text-[15px]">App Theme</span>
          </div>
          <span className="text-sm font-semibold text-primary bg-primary-container/30 px-3 py-1 rounded-full">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </div>

        <SettingItem icon="help" label="Help & Support" />
      </div>

      {/* Sign Out Action */}
      <button 
        onClick={signOut} 
        className="w-full mt-8 py-4 bg-red-50 dark:bg-red-950/20 text-error hover:bg-red-100/60 font-semibold rounded-2xl text-[15px] tracking-wide active:scale-[0.99] transition-all"
      >
        Sign Out
      </button>
    </div>
  );
}

function SettingItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer active:scale-[0.99] transition-all">
      <div className="flex items-center gap-3.5 text-on-surface dark:text-gray-200">
        <span className="material-symbols-rounded text-[22px] text-gray-400 dark:text-gray-500">{icon}</span>
        <span className="font-medium text-[15px]">{label}</span>
      </div>
      <span className="material-symbols-rounded text-gray-400 dark:text-gray-600 text-[20px]">chevron_right</span>
    </div>
  );
}
