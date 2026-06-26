import { useTheme } from '../context/ThemeContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-surface dark:bg-black text-on-surface dark:text-gray-100 transition-colors duration-300">
        <main className="max-w-md mx-auto min-h-screen flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
