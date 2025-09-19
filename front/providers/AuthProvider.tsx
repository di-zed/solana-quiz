'use client';

/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Authenticated User Type.
 */
type CurrentUser = {
  id: number;
  wallet: string;
};

/**
 * Auth Context Type.
 */
type AuthContextType = {
  user: CurrentUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider.
 *
 * @param children
 * @constructor
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, signMessage } = useWallet();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Set Current User.
   */
  const setCurrentUser = async (): Promise<void> => {
    try {
      let currentUser = await getCurrentUser();
      if (!currentUser) {
        currentUser = await refresh();
      }

      if (!currentUser) {
        throw new Error('Unauthorized');
      }

      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login.
   */
  const login = async (): Promise<void> => {
    if (!publicKey || !connected || !signMessage) {
      setUser(null);
      return;
    }

    try {
      // 1. We receive a nonce
      const resNonce = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/auth/nonce`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!resNonce.ok) {
        setUser(null);
        return null;
      }

      const { nonce } = await resNonce.json();

      if (!nonce) {
        setUser(null);
        return null;
      }

      // 2. Signing the message
      const encoded = new TextEncoder().encode(`Login nonce: ${nonce}`);
      const signature = await signMessage(encoded);
      const signatureBase58 = bs58.encode(signature);

      // 3. Sending to the server
      const resLogin = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          signature: signatureBase58,
          nonce,
        }),
      });

      if (!resLogin.ok) {
        setUser(null);
        return null;
      }

      const { status } = await resLogin.json();

      if (status === 'success') {
        await setCurrentUser();
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  /**
   * Logout.
   */
  const logout = async (): Promise<void> => {
    await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    setUser(null);
  };

  /**
   * Get Current User.
   */
  const getCurrentUser = async (): Promise<CurrentUser | null> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const { status, data } = await res.json();

    if (status !== 'success' || !data || !data.user) {
      return null;
    }

    return data.user;
  };

  /**
   * Refresh Token.
   */
  const refresh = async (): Promise<CurrentUser | null> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const { status, data } = await res.json();

    if (status !== 'success' || !data || !data.user) {
      return null;
    }

    return data.user;
  };

  useEffect(() => {
    setCurrentUser();

    // background check every 5 minutes
    const interval = setInterval(setCurrentUser, 5 * 60 * 1000);

    // check when returning to the tab
    const onFocus = () => setCurrentUser();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
