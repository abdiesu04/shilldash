'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, useAuth, SignInButton } from '@clerk/nextjs';
import { Menu, X, LineChart, Moon, Sun, Wallet, Activity, LogIn, User, Bookmark, Sparkles, AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';
import Modal from '../ui/Modal';
import AddTokenForm from '../tokens/AddTokenForm';
import SignInDialog from '../ui/SignInDialog';

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
        case 'shill-vision':
          // Implement Shill Vision feature
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

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Market', href: '/', icon: LineChart },
    { name: 'Portfolio', href: '/portfolio', icon: Wallet, requiresAuth: true },
  ];

  const isActive = (path: string) => pathname === path;

  const menuOptions = [
    { id: 'your-tokens', label: 'Your Tokens', icon: User },
    { id: 'saved-tokens', label: 'Saved Tokens', icon: Bookmark },
    { id: 'shill-vision', label: 'Shill Vision', icon: Sparkles },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 z-40 w-full transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#0A0F1F]/95 backdrop-blur-2xl shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)]' 
            : 'bg-[#0A0F1F]/80 backdrop-blur-xl'
        }`}
      >
        {authError && (
          <div className="absolute top-full left-0 right-0 bg-gradient-to-r from-[#00FFA3]/5 via-[#03E1FF]/5 to-[#DC1FFF]/5 backdrop-blur-xl border-b border-[#03E1FF]/20 p-3">
            <div className="flex items-center justify-center space-x-2 text-center">
              <AlertTriangle className="w-4 h-4 text-[#03E1FF]" />
              <p className="text-sm text-white">
                {authError}
                <SignInButton mode="modal">
                  <button className="ml-2 text-[#03E1FF] hover:text-[#00FFA3] transition-colors duration-300">
                    Sign in now
                  </button>
                </SignInButton>
              </p>
            </div>
          </div>
        )}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button - Moved to left */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative inline-flex items-center justify-center p-2 text-gray-400 rounded-lg hover:text-white transition-all duration-300 group mr-3"
              >
                <div className="absolute inset-0 rounded-lg border border-[#03E1FF]/0 group-hover:border-[#03E1FF]/20 transition-all duration-300" />
                {isMenuOpen ? (
                  <X className="w-5 h-5 relative z-10" />
                ) : (
                  <Menu className="w-5 h-5 relative z-10" />
                )}
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center flex-1 md:flex-none">
              <Link href="/" className="flex items-center group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-0 blur-xl group-hover:opacity-20 transition-all duration-700" />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent transform transition-all duration-500 group-hover:scale-[1.02]">
                  ShillDash
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        if (item.requiresAuth && !isSignedIn) {
                          e.preventDefault();
                          setAuthError('Please sign in to access this feature');
                          setTimeout(() => setAuthError(null), 3000);
                          return;
                        }
                      }}
                      className={`group flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 text-white border border-[#03E1FF]/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2 transition-all duration-300 ${
                        isActive(item.href) 
                          ? 'text-[#03E1FF]' 
                          : 'group-hover:text-[#03E1FF]'
                      }`} />
                      <span className="relative">
                        {item.name}
                        <span className={`absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] transition-all duration-300 ${
                          isActive(item.href) ? 'w-full' : 'group-hover:w-full'
                        }`} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {!isLoaded ? null : !isSignedIn ? (
                <SignInButton mode="modal">
                  <button className="group relative flex items-center px-4 py-2 text-sm font-medium text-white overflow-hidden rounded-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="absolute inset-[1px] bg-[#0A0F1F] rounded-lg group-hover:bg-transparent transition-all duration-300" />
                    <LogIn className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">Sign In</span>
                  </button>
                </SignInButton>
              ) : null}

              {/* Three Dots Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOptionsOpen(!isMenuOptionsOpen)}
                  className="group relative p-2 text-gray-400 hover:text-white rounded-lg transition-all duration-300 hover:bg-white/5"
                >
                  <div className="absolute inset-0 rounded-lg border border-[#03E1FF]/0 group-hover:border-[#03E1FF]/20 transition-all duration-300" />
                  <div className="flex flex-col space-y-1">
                    <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#03E1FF] transition-all duration-300" />
                    <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#03E1FF] transition-all duration-300" />
                    <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-[#03E1FF] transition-all duration-300" />
                  </div>
                </button>

                {isMenuOptionsOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0A0F1F]/95 backdrop-blur-xl border border-[#03E1FF]/20 shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)] overflow-hidden z-50">
                    <div className="py-2">
                      {menuOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              handleMenuOptionSelect(option.id);
                              setIsMenuOptionsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 group"
                          >
                            <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#03E1FF] transition-colors duration-300" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative p-2 text-gray-400 hover:text-white rounded-lg transition-all duration-300 hover:bg-white/5 group"
              >
                <div className="absolute inset-0 rounded-lg border border-[#03E1FF]/0 group-hover:border-[#03E1FF]/20 transition-all duration-300" />
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 relative z-10" />
                ) : (
                  <Moon className="w-5 h-5 relative z-10" />
                )}
              </button>

              {isLoaded && userId ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 ring-2 ring-[#03E1FF]/20 hover:ring-[#03E1FF]/40 transition-all duration-300',
                      userButtonPopoverCard: 'bg-[#0A0F1F] border border-[#03E1FF]/20 shadow-[0_0_30px_-15px_rgba(0,255,163,0.3)]',
                      userButtonPopoverActionButton: 'hover:bg-white/5',
                      userButtonPopoverActionButtonText: 'text-white',
                      userButtonPopoverFooter: 'border-t border-[#03E1FF]/20',
                    },
                  }}
                />
              ) : null}
            </div>
          </div>

          {/* Mobile Navigation - Updated styling */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-[#03E1FF]/10 mt-2">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        if (item.requiresAuth && !isSignedIn) {
                          e.preventDefault();
                          setAuthError('Please sign in to access this feature');
                          setTimeout(() => setAuthError(null), 3000);
                          return;
                        }
                        setIsMenuOpen(false);
                      }}
                      className={`group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-[#00FFA3]/10 via-[#03E1FF]/10 to-[#DC1FFF]/10 text-white border border-[#03E1FF]/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 transition-all duration-300 ${
                        isActive(item.href) 
                          ? 'text-[#03E1FF]' 
                          : 'group-hover:text-[#03E1FF]'
                      }`} />
                      <span className="relative">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
                
                {/* Additional mobile menu items */}
                <div className="pt-2 border-t border-[#03E1FF]/10">
                  {menuOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          handleMenuOptionSelect(option.id);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 group"
                      >
                        <Icon className="w-5 h-5 mr-3 group-hover:text-[#03E1FF] transition-colors duration-300" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Add Token Modal */}
      <Modal
        isOpen={showAddToken}
        onClose={() => setShowAddToken(false)}
        title="Add New Token"
        size="md"
      >
        <AddTokenForm onSuccess={() => setShowAddToken(false)} />
      </Modal>

      {/* Sign In Dialog */}
      {showSignInDialog && (
        <SignInDialog
          title={signInMessage.title}
          message={signInMessage.message}
          onClose={() => setShowSignInDialog(false)}
          showHome={false}
        />
      )}
    </>
  );
};

export default Navbar; 