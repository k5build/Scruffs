'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';

const GREETINGS = [
  (name: string) => `Your pet just got a VIP membership, ${name}.`,
  (name: string) => `${name}, the grooming van is basically already on its way.`,
  (name: string) => `Welcome to the pack, ${name}. Your fur baby deserves this.`,
  (name: string) => `${name}, consider your pet officially spoiled from here on.`,
];

export default function WelcomeModal() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [show,     setShow]     = useState(false);
  const [name,     setName]     = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (searchParams.get('welcome') !== '1') return;

    // Remove ?welcome=1 from URL immediately
    router.replace('/');

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        const firstName = (d.user?.name ?? '').split(' ')[0] || 'there';
        setName(firstName);
        const fn = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
        setGreeting(fn(firstName));
      })
      .catch(() => {
        setName('there');
        setGreeting('Your fur baby deserves the best — and now they\'ve got it.');
      });

    setShow(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => setShow(false);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
        onClick={dismiss}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-card border-t border-border rounded-t-3xl max-w-lg mx-auto overflow-hidden">

          {/* Green header bar */}
          <div className="bg-primary px-6 pt-6 pb-8 relative">
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:bg-primary-foreground/20 transition-colors"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-icon-beige.png"
                alt="Scruffs"
                width={44}
                height={44}
                className="rounded-2xl"
              />
              <div>
                <p className="text-primary-foreground/60 text-[10px] font-bold tracking-[0.25em] uppercase">You&apos;re in</p>
                <p className="text-primary-foreground font-black text-lg tracking-wider">SCRUFFS</p>
              </div>
            </div>

            <h2 className="text-primary-foreground font-bold text-[22px] leading-snug">
              {greeting}
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 pt-5 pb-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={14} className="text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">What&apos;s waiting for you</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Save your pets, rebook in 30 seconds, track every session — your whole pet care life in one place.
                </p>
              </div>
            </div>

            <Link
              href="/book"
              onClick={dismiss}
              className="w-full flex items-center justify-center bg-primary text-primary-foreground h-12 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Book First Session
            </Link>

            <button
              onClick={dismiss}
              className="w-full h-10 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              I&apos;ll look around first
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
