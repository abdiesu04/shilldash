'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useAuth, SignInButton } from '@clerk/nextjs';
import { Menu, X, ChevronDown, Rocket, BarChart2, Wallet, Home, LineChart, Star, Settings, Sun, Moon, AlertTriangle, LogIn, Twitter, Eye } from 'lucide-react';
import { useTheme } from 'next-themes';
import AddTokenForm from '../tokens/AddTokenForm';
import SignInDialog from '../ui/SignInDialog';

const navigation = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
  { id: 'shilldash', name: 'Shill Vision', href: '/shilldash', icon: Eye },
  { id: 'portfolio', name: 'Portfolio', href: '/portfolio', icon: Wallet },
];

const menuOptions = [
  { id: 'your-tokens', name: 'Your Tokens', icon: Star },
  { id: 'saved-tokens', name: 'Saved Tokens', icon: LineChart }
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [signInMessage, setSignInMessage] = useState({ title: '', message: '' });
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset auth error when auth state changes
  useEffect(() => {
    if (isLoaded) {
      setAuthError(null);
    }
  }, [isLoaded, isSignedIn]);

  const handleProtectedAction = (action: string) => {
    if (!isSignedIn) {
      let title = 'Sign In Required';
      let message = 'Please sign in to access this feature';

      switch (action) {
        case 'portfolio':
          title = 'Access Your Portfolio';
          message = 'Sign in to view and manage your token portfolio';
          break;
        case 'your-tokens':
          title = 'View Your Tokens';
          message = 'Sign in to access your tracked tokens';
          break;
        case 'saved-tokens':
          title = 'Access Saved Tokens';
          message = 'Sign in to view your saved tokens';
          break;
      }

      setSignInMessage({ title, message });
      setShowSignInDialog(true);
      return false;
    }
    return true;
  };

  const handleMenuOptionSelect = async (optionId: string) => {
    if (handleProtectedAction(optionId)) {
      switch (optionId) {
        case 'your-tokens':
          router.push('/dashboard?view=my-tokens');
          break;
        case 'saved-tokens':
          router.push('/dashboard?view=saved');
          break;
        case 'settings':
          // Implement Settings feature
          break;
      }
    }
    setIsMenuOptionsOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 dark:bg-[#0A0F1F]/80 backdrop-blur-lg' : 'bg-white dark:bg-[#0A0F1F]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Rocket className="w-8 h-8 text-[#03E1FF]" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#03E1FF] to-[#00FFA3] text-transparent bg-clip-text">
                ShillDash
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-[#03E1FF]/10 text-[#03E1FF]'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Join Community Link */}
            <a
              href="https://x.com/ShillDash?t=a5ZuRAONXjXzMt5t5EBc5g&s=35"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span>Join Community</span>
            </a>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            </button>

           

            {/* User Button */}
            {isLoaded && !isSignedIn ? (
              <SignInButton mode="modal">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            ) : isLoaded && userId ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-gray-200 dark:ring-[#03E1FF]/20 hover:ring-[#03E1FF]/40 transition-all duration-300",
                    userButtonPopoverCard: "bg-white dark:bg-[#0A0F1F] border border-gray-200 dark:border-[#03E1FF]/20 shadow-lg dark:shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)]",
                    userButtonPopoverActionButton: "hover:bg-gray-100 dark:hover:bg-white/5",
                    userButtonPopoverActionButtonText: "text-gray-900 dark:text-white",
                    userButtonPopoverFooter: "border-t border-gray-200 dark:border-[#03E1FF]/20",
                  },
                }}
              />
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-4 space-y-2 bg-white dark:bg-[#0A0F1F] border-t border-gray-200 dark:border-gray-800">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-[#03E1FF]/10 text-[#03E1FF]'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {menuOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => {
                  handleMenuOptionSelect(option.id);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span>{option.name}</span>
              </button>
            );
          })}

         

          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-3 text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              {mounted && (
                <>
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </>
              )}
            </button>
            
          </div>
           {/* Mobile User Profile */}
           <div className="px-4 py-3">
            {isLoaded && !isSignedIn ? (
              <SignInButton mode="modal">
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            ) : isLoaded && userId ? (
              <div className="flex items-center space-x-3 px-4 py-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-gray-200 dark:ring-[#03E1FF]/20 hover:ring-[#03E1FF]/40 transition-all duration-300",
                      userButtonPopoverCard: "bg-white dark:bg-[#0A0F1F] border border-gray-200 dark:border-[#03E1FF]/20 shadow-lg dark:shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)]",
                      userButtonPopoverActionButton: "hover:bg-gray-100 dark:hover:bg-white/5",
                      userButtonPopoverActionButtonText: "text-gray-900 dark:text-white",
                      userButtonPopoverFooter: "border-t border-gray-200 dark:border-[#03E1FF]/20",
                    },
                  }}
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Account Settings</span>
              </div>
            ) : null}
          </div>
          
        </div>
      </div>
       {/* Mobile User Profile */}
       

      {/* Add Token Modal */}
      {showAddToken && (
        <AddTokenForm onSuccess={() => setShowAddToken(false)} />
      )}

      {/* Sign In Dialog */}
      <SignInDialog
        isOpen={showSignInDialog}
        onClose={() => setShowSignInDialog(false)}
        title={signInMessage.title}
        message={signInMessage.message}
      />
    </nav>
  );
};

export default Navbar; 