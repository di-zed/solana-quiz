'use client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

//handle wallet balance fixed to 2 decimal numbers without rounding
export function toFixed(num: number, fixed: number): string {
  const re = new RegExp(`^-?\\d+(?:\\.\\d{0,${fixed || -1}})?`);
  return num.toString().match(re)![0];
}

const WalletConnection = () => {
  const { connection } = useConnection();
  const { select, wallets, publicKey, disconnect, connecting } = useWallet();

  const [open, setOpen] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [userWalletAddress, setUserWalletAddress] = useState<string>('');

  useEffect(() => {
    if (!connection || !publicKey) {
      return;
    }

    connection.onAccountChange(
      publicKey,
      (updatedAccountInfo) => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
      },
      'confirmed',
    );

    connection.getAccountInfo(publicKey).then((info) => {
      if (info) {
        setBalance(info?.lamports / LAMPORTS_PER_SOL);
      }
    });
  }, [publicKey, connection]);

  useEffect(() => {
    setUserWalletAddress(publicKey?.toBase58()!);
  }, [publicKey]);

  const handleWalletSelect = async (walletName: any) => {
    if (walletName) {
      try {
        select(walletName);
        setOpen(false);
      } catch (error) {
        console.log('wallet connection err : ', error);
      }
    }
  };

  const handleDisconnect = async () => {
    disconnect();
  };

  return (
    <div className="text-white">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex gap-2 items-center">
          {!publicKey ? (
            <>
              <DialogTrigger asChild>
                <Button className="bg-black text-[20px] md:text-[30px] text-white ring-black ring-2 h-[40px] md:h-[60px] border-2 border-white font-slackey z-50">
                  {connecting ? 'connecting...' : 'Connect Wallet'}
                </Button>
              </DialogTrigger>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex gap-2 bg-black text-[20px] md:text-[30px] text-white ring-black ring-2 h-[40px]  md:h-[60px] border-2 border-white font-slackey z-50">
                  <div className="">
                    <div className=" truncate md:w-[150px] w-[100px]  ">{publicKey.toBase58()}</div>
                  </div>
                  {balance ? <div>{toFixed(balance, 2)} SOL</div> : <div>0 SOL</div>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] bg-black hover:bg-black">
                <DropdownMenuItem className="flex justify-center">
                  <Button className="bg-[#ff5555] z-50 text-[20px]  text-white  border-2 border-white font-slackey" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DialogContent
            className="max-w-[450px] bg-black "
            style={{
              borderRadius: '30px',
            }}
          >
            <div className="flex w-full justify-center items-center ">
              <div className="flex flex-col justify-start items-center space-y-5  w-[300px] md:w-[400px] overflow-y-auto ">
                {wallets.map((wallet) => (
                  <Button
                    key={wallet.adapter.name}
                    //onClick={() => select(wallet.adapter.name)}
                    onClick={() => handleWalletSelect(wallet.adapter.name)}
                    variant={'ghost'}
                    className=" h-[40px] hover:bg-transparent hover:text-white text-[20px] text-white font-slackey flex w-full justify-center items-center "
                  >
                    <div className="flex">
                      <Image src={wallet.adapter.icon} alt={wallet.adapter.name} height={30} width={30} className="mr-5 " />
                    </div>
                    <div className="font-slackey text-white wallet-name text-[20px]">{wallet.adapter.name}</div>
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </div>
      </Dialog>
    </div>
  );
};

export default WalletConnection;
