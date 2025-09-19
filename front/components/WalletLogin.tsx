'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../providers/AuthProvider';

export default function WalletLogin() {
  const { connected } = useWallet();
  const { user, loading, login, refresh, logout } = useAuth();

  return (
    <>
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <WalletMultiButton />

        {connected ? (
          <>
            {user ? (
              <button
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px] cursor-pointer"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <button
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
                onClick={login}
              >
                Login
              </button>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
