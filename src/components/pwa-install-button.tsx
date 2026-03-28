'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Share2Icon, XIcon, PlusSquareIcon, SmartphoneIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
}

export function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) { setInstalled(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed || dismissed) return null;
  if (!installPrompt && !isIOS()) return null;

  const handleInstall = async () => {
    if (isIOS()) { setShowIOSGuide(true); return; }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  return (
    <>
      {/* Floating install banner */}
      <AnimatePresence>
        {!showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', bounce: 0.3, delay: 1.5 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-green-800 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-72x72.png" alt="Golden Roots" className="size-12 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Install Golden Roots</p>
                <p className="text-white/70 text-xs">Add to your home screen for quick access</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="bg-amber-400 hover:bg-amber-300 text-green-900 font-semibold text-xs h-8 px-3"
                >
                  <DownloadIcon className="size-3 mr-1" />
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs h-6 px-2"
                >
                  Not now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS step-by-step guide modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.25 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/icon-72x72.png" alt="Golden Roots" className="size-10 rounded-xl" />
                  <div>
                    <p className="font-bold text-sm text-neutral-800">Install Golden Roots</p>
                    <p className="text-xs text-neutral-500">3 quick steps</p>
                  </div>
                </div>
                <button onClick={() => setShowIOSGuide(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                  <XIcon className="size-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <Step number={1} icon={<Share2Icon className="size-5 text-green-700" />} title='Tap the Share button' description='Find the share icon at the bottom of your Safari browser' />
                <Step number={2} icon={<PlusSquareIcon className="size-5 text-green-700" />} title='Add to Home Screen' description='Scroll down in the share menu and tap "Add to Home Screen"' />
                <Step number={3} icon={<SmartphoneIcon className="size-5 text-green-700" />} title='Tap Add' description='Confirm by tapping "Add" in the top right corner' />
              </div>

              <Button
                className="w-full mt-6 bg-green-800 hover:bg-green-700 text-white"
                onClick={() => { setShowIOSGuide(false); setDismissed(true); }}
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-7 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 text-green-800 font-bold text-xs mt-0.5">
        {number}
      </div>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-neutral-800">{title}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
