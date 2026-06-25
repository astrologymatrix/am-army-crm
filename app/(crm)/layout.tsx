'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { LayoutDashboard, Users, FileText, Package, Shield, LogOut } from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/creators', label: 'Creators', icon: Users },
  { href: '/agreements', label: 'Agreements', icon: FileText },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/team', label: 'Team Access', icon: Shield },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          email: user.email ?? '',
          name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex min-h-screen bg-[#111111] text-white">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#1a1a1a] flex flex-col fixed h-full z-20 border-r border-white/5">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-black flex items-center justify-center flex-shrink-0">
              <Image src="/logo-icon.png" alt="AM" width={36} height={36} className="object-cover" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">ASTROLOGY</div>
              <div className="text-[#c9a84c] text-[10px] font-semibold tracking-widest italic">Matrix</div>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 tracking-widest mt-2 font-medium uppercase">AM Army CRM</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {user && (
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#c9a84c]">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-300 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" />
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[220px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
