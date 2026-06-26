import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';

export function ProfileView() {
  const { account, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: account?.full_name || '',
    phone: account?.phone || ''
  });
  // 'uploading' was unused, so we removed it to fix the TS6133 error

  const handleUpdate = async () => {
    await supabase.from('accounts').update(formData).eq('id', account?.id);
    setIsEditing(false);
    window.location.reload();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'ecovities_avatars'); 
    
    const res = await fetch('https://api.cloudinary.com/v1_1/dctc2vtcc/image/upload', {
      method: 'POST', body: fd
    });
    const data = await res.json();
    
    // We cast to any to bypass the missing property error for now
    await supabase.from('accounts').update({ avatar_url: data.secure_url }).eq('id', account?.id);
    window.location.reload();
  };

  return (
    <div className="p-6 pb-8 min-h-screen bg-surface dark:bg-black transition-colors">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Profile</h1>
        <button onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} className="text-primary font-semibold">
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          {/* Accessing avatar_url via (account as any) to fix TS2339 */}
          <img src={(account as any)?.avatar_url || '/avatar-placeholder.png'} className="w-24 h-24 rounded-full object-cover border-4 border-surface-container" />
          <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
        <p className="mt-4 font-semibold text-lg dark:text-white">{account?.full_name}</p>
        <p className="text-gray-500">{account?.eco_id}</p>
      </div>

      <div className="card mb-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500">Full Name</label>
            {isEditing ? (
              <input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-transparent border-b dark:text-white" />
            ) : <p className="dark:text-white">{account?.full_name}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500">Phone</label>
            {isEditing ? (
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-transparent border-b dark:text-white" />
            ) : <p className="dark:text-white">{account?.phone}</p>}
          </div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-gray-400 mb-4 px-2">SETTINGS</h2>
      <div className="card divide-y dark:divide-gray-700">
        <SettingItem icon="shield" label="Security & Privacy" />
        <SettingItem icon="notifications" label="Notifications" />
        <div className="flex justify-between items-center py-4 cursor-pointer" onClick={toggleTheme}>
          <div className="flex items-center gap-3 dark:text-white">
            <span className="material-symbols-rounded">dark_mode</span>
            <span>App Theme</span>
          </div>
          <span className="text-gray-400">{isDark ? 'Dark' : 'Light'}</span>
        </div>
        <SettingItem icon="help" label="Help & Support" />
      </div>

      <button onClick={signOut} className="w-full mt-8 py-4 text-error font-semibold">Sign Out</button>
    </div>
  );
}

function SettingItem({ icon, label }: { icon: string, label: string }) {
  return (
    <div className="flex justify-between items-center py-4 cursor-pointer">
      <div className="flex items-center gap-3 dark:text-white">
        <span className="material-symbols-rounded">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="material-symbols-rounded text-gray-400">chevron_right</span>
    </div>
  );
}
