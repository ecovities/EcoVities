import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

export function ProfileView() {
  const { account } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ecovities_avatars'); // From your Cloudinary setup

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dctc2vtcc/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      // Update profile in Supabase
      await supabase.from('accounts').update({ avatar_url: data.secure_url }).eq('id', account?.id);
      window.location.reload(); 
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-surface dark:bg-gray-900 min-h-screen transition-colors">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>
      
      {/* Profile Image */}
      <div className="flex items-center gap-4 mb-8">
        <img src={account?.avatar_url || '/default-avatar.png'} className="w-20 h-20 rounded-full" />
        <input type="file" onChange={handleImageUpload} disabled={uploading} className="text-sm" />
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm">
        <div className="flex justify-between items-center py-4 border-b dark:border-gray-700">
          <span className="dark:text-white">App Theme</span>
          <button onClick={toggleTheme} className="px-4 py-1 bg-primary text-white rounded-full text-sm">
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
        {/* Add more options here... */}
      </div>
    </div>
  );
}
