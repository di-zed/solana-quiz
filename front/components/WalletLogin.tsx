'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';
import { useState } from 'react';

export default function WalletLogin() {
  const { publicKey, connected, signMessage } = useWallet();
  const [status, setStatus] = useState('');

  /**
   * Hande Login.
   */
  const handleLogin = async () => {
    if (!publicKey || !signMessage || !process.env.NEXT_PUBLIC_NODE_URL) {
      return;
    }

    try {
      // 1. We receive a nonce
      const resNonce = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/auth/nonce`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const { nonce } = await resNonce.json();

      // 2. Signing the message
      const encoded = new TextEncoder().encode(`Login nonce: ${nonce}`);
      const signature = await signMessage(encoded);
      const signatureBase58 = bs58.encode(signature);

      // 3. Sending to the server
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          signature: signatureBase58,
          nonce,
        }),
      });

      const data = await res.json();
      setStatus(data.success ? '✅ Logged in!' : '❌ Login failed!');
    } catch (error) {
      console.error(error);
      setStatus('⚠️ Error!');
    }
  };

  return (
    <>
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <WalletMultiButton />
        {/*{connected ? (*/}
        {/*) : (*/}
        {/*)}*/}
        <button
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
          onClick={handleLogin}
        >
          Login
        </button>
        <button
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px] cursor-pointer"
          // onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </>
  );
}
