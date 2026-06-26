import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabaseClient';

export function HomeView() {
  const { account } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!account) return;
      
      // Fetch recent transactions
      const { data: txs } = await supabase
        .from('transactions')
        .select(`*, from_wallet:from_wallet_id(owner_account_id), to_wallet:to_wallet_id(owner_account_id)`)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (txs) setRecentTransactions(txs);

      // Fetch sample contacts (users in same institution)
      const { data: users } = await supabase
        .from('accounts')
        .select('*')
        .eq('institution_id', account.institution_id)
        .neq('id', account.id)
        .limit(5);
        
      if (users) setContacts(users);
    }
    loadDashboardData();
  }, [account]);

  return (
    <div className="min-h-screen bg-surface dark:bg-black transition-colors duration-300 pb-8">
      {/* App Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-primary text-[32px]">eco</span>
          <h1 className="text-xl font-bold text-on-surface dark:text-white tracking-tight">EcoVities</h1>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/notifications" className="relative text-on-surface dark:text-gray-300 hover:text-primary transition-colors">
            <span className="material-symbols-rounded text-[26px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error rounded-full border-2 border-surface dark:border-black"></span>
            )}
          </Link>
          <Link to="/profile" className="active:scale-95 transition-transform">
            <img 
              src={(account as any)?.avatar_url || '/avatar-placeholder.png'} 
              className="w-9 h-9 rounded-full border-2 border-surface-container-high dark:border-gray-700 object-cover" 
              alt="Profile"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </Link>
        </div>
      </div>

      {/* Balance Section */}
      <div className="px-6 flex flex-col items-center mt-2 mb-10">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">Available EcoPoints</p>
        <div className="flex items-baseline gap-1.5 text-on-surface dark:text-white">
          <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">EP</span>
          <span className="text-6xl font-bold tracking-tighter">{balance ?? 0}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 flex gap-3 mb-10">
        <Link to="/scan" className="flex-1 bg-primary text-white rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm">
          <span className="material-symbols-rounded text-[28px]">qr_code_scanner</span>
          <span className="text-sm font-semibold">Scan QR</span>
        </Link>
        <Link to="/contacts" className="flex-1 bg-surface-container-high dark:bg-gray-800 text-on-surface dark:text-gray-100 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm border border-transparent dark:border-gray-700">
          <span className="material-symbols-rounded text-[28px]">arrow_upward</span>
          <span className="text-sm font-semibold">Send</span>
        </Link>
        <Link to="/receive" className="flex-1 bg-surface-container-high dark:bg-gray-800 text-on-surface dark:text-gray-100 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm border border-transparent dark:border-gray-700">
          <span className="material-symbols-rounded text-[28px]">arrow_downward</span>
          <span className="text-sm font-semibold">Receive</span>
        </Link>
      </div>

      {/* People & Businesses */}
      <div className="px-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[17px] font-bold text-on-surface dark:text-white">People & businesses</h2>
          <Link to="/contacts" className="text-sm font-bold text-primary">See all</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {contacts.map((contact) => (
            <div key={contact.id} onClick={() => navigate(`/pay/${contact.eco_id}`)} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform min-w-[72px]">
              <div className="w-14 h-14 rounded-full bg-primary-container dark:bg-gray-800 flex items-center justify-center text-primary-on-container dark:text-primary font-bold text-lg border border-transparent dark:border-gray-700 shadow-sm">
                {contact.full_name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate w-full text-center">
                {contact.full_name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[17px] font-bold text-on-surface dark:text-white">Recent activity</h2>
          <Link to="/history" className="bg-primary-container dark:bg-primary/20 text-on-primary-container dark:text-primary px-4 py-1.5 rounded-full text-sm font-bold">
            View all
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">No recent transactions</div>
          ) : (
            recentTransactions.map((tx) => {
              const isCredit = tx.to_wallet?.owner_account_id === account?.id;
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container dark:bg-gray-800 flex items-center justify-center text-primary font-bold shadow-sm">
                      <span className="material-symbols-rounded text-[20px]">
                        {isCredit ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface dark:text-white text-[15px]">
                        {isCredit ? 'Received' : 'Sent'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-[15px] ${isCredit ? 'text-primary' : 'text-on-surface dark:text-white'}`}>
                    {isCredit ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
