'use client';

import Link from 'next/link';
import { Github, Twitter, MessageSquare, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#0A0F1F] border-t border-gray-200 dark:border-[#03E1FF]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-0 blur-xl group-hover:opacity-20 transition-all duration-700" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent transform transition-all duration-500 group-hover:scale-[1.02]">
                ShillDash
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track and manage your favorite tokens in the crypto space with our premium dashboard.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/ShillDash?t=a5ZuRAONXjXzMt5t5EBc5g&s=35"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
                title="Join our Community"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Dashboard', 'Portfolio', 'Add Token'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm transition-colors duration-300 flex items-center group"
                  >
                    <span className="relative">
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://x.com/ShillDash?t=a5ZuRAONXjXzMt5t5EBc5g&s=35"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm transition-colors duration-300 flex items-center group"
                >
                  <span className="relative flex items-center space-x-2">
                    <Twitter className="w-4 h-4" />
                    <span>Join Community</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] transition-all duration-300 group-hover:w-full" />
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {['Documentation', 'API Reference', 'Status', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm transition-colors duration-300 flex items-center group"
                  >
                    <span className="relative">
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#00FFA3] to-[#03E1FF] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-[#03E1FF]/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03E1FF]/50 transition-all duration-300"
              />
              <button
                type="submit"
                className="w-full relative flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                <span className="relative">Subscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-[#03E1FF]/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} ShillDash. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 