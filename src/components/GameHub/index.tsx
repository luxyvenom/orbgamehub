'use client';

import { Verify } from '@/components/Verify';
import { useRouter } from 'next/navigation';

export const GameHub = () => {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to OrbGameHub</h1>
        <p className="text-gray-500 text-sm mt-1">
          Prove you&apos;re human. Play fair. Win WLD.
        </p>
      </div>

      {/* Eye Fighter Game Card */}
      <button
        onClick={() => router.push('/play/eye-fighter')}
        className="w-full bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl p-6 text-left text-white shadow-lg active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl mb-2">👁 VS 🤖</div>
            <h2 className="text-xl font-bold">Eye Fighter</h2>
            <p className="text-purple-200 text-sm mt-1">
              Stare down the AI. Blink and you lose!
            </p>
          </div>
          <div className="text-4xl">→</div>
        </div>
        <div className="flex gap-2 mt-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs">Camera</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs">WLD Bet</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs">World ID</span>
        </div>
      </button>

      {/* Coming Soon Games */}
      <div className="w-full bg-gray-100 rounded-2xl p-6 opacity-60">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl mb-2">🎮</div>
            <h2 className="text-lg font-bold text-gray-800">Supersize</h2>
            <p className="text-gray-500 text-sm mt-1">
              Eat or be eaten. agar.io style.
            </p>
          </div>
          <span className="bg-gray-300 px-3 py-1 rounded-full text-xs text-gray-600">
            Coming Soon
          </span>
        </div>
      </div>

      {/* World ID Section */}
      <div className="w-full">
        <Verify />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-gray-500">Games</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-gray-500">Wins</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">0.0</p>
          <p className="text-xs text-gray-500">WLD Won</p>
        </div>
      </div>
    </div>
  );
};
