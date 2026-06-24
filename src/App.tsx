import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { BottomNav } from "./components/BottomNav";
import { LoginView } from "./views/LoginView";
import { HomeView } from "./views/HomeView";
import { ContactsView } from "./views/ContactsView";
import { PayView } from "./views/PayView";
import { ReceiveView } from "./views/ReceiveView";
import { ScanView } from "./views/ScanView";
import { HistoryView } from "./views/HistoryView";
import { ProfileView } from "./views/ProfileView";
import { NotificationsView } from "./views/NotificationsView";

// Routes that render full-screen, without the bottom nav.
const NO_NAV_ROUTES = ["/contacts", "/scan", "/receive", "/notifications"];
const isPayRoute = (path: string) => path.startsWith("/pay/");

function AuthedApp() {
  const location = useLocation();
  const showNav = !NO_NAV_ROUTES.includes(location.pathname) && !isPayRoute(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/contacts" element={<ContactsView />} />
        <Route path="/pay/:ecoId" element={<PayView />} />
        <Route path="/receive" element={<ReceiveView />} />
        <Route path="/scan" element={<ScanView />} />
        <Route path="/history" element={<HistoryView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/notifications" element={<NotificationsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

function AccountPendingNotice() {
  const { account, signOut } = useAuth();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
      <span className="material-symbols-rounded text-5xl text-gray-400">hourglass_top</span>
      <h2 className="text-lg font-medium text-gray-900">Waiting for approval</h2>
      <p className="text-sm text-gray-500">
        Your institution needs to approve your account before your wallet is created
        {account?.status === "suspended" ? " — this account is currently suspended." : "."}
      </p>
      <button
        onClick={signOut}
        className="mt-2 bg-surface-container-high text-gray-900 px-5 py-2.5 rounded-full text-sm font-medium"
      >
        Sign out
      </button>
    </div>
  );
}

function Root() {
  const { session, account, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-rounded text-4xl text-primary animate-pulse">eco</span>
      </div>
    );
  }

  if (!session) return <LoginView />;
  if (!account || account.status !== "approved") return <AccountPendingNotice />;

  return <AuthedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell>
        <Root />
      </AppShell>
    </AuthProvider>
  );
}
