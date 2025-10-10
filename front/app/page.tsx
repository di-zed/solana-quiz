import Image from 'next/image';
import QuizButtons from '@/components/quiz-buttons';
import WalletLogin from '@/components/wallet-login';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image src="/solana.svg" alt="Solana" width={180} height={38} priority />

        <WalletLogin />

        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="tracking-[-.01em]">
            <strong>Click "Select Wallet"</strong> - choose your Solana wallet and connect it to the app.
          </li>
          <li className="tracking-[-.01em]">
            <strong>Click "Login"</strong> - sign in securely through the Solana network.
          </li>
          <li className="tracking-[-.01em]">
            <strong>Go to the Quiz section</strong> - start today’s quiz and test your knowledge!
          </li>
          <li className="tracking-[-.01em]">
            <strong>New quiz every day</strong> - fresh questions appear daily.
          </li>
          <li className="tracking-[-.01em]">
            <strong>Earn tokens</strong> - each correct answer gives you 1 token.
          </li>
          <li className="tracking-[-.01em]">
            <strong>Double your reward</strong> - answer all questions correctly to double your tokens!
          </li>
          <li className="tracking-[-.01em]">
            <strong>Important:</strong> you must complete <strong>all questions</strong> in the quiz to receive your tokens.
          </li>
        </ol>

        <QuizButtons />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://solana.com/developers/courses"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="Solana Development Courses" width={16} height={16} />
          Solana Development
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://solscan.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Explore Solana Blockchain" width={16} height={16} />
          Explore Blockchain
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/di-zed/solana-quiz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="GitHub Repo" width={16} height={16} />
          Go to GitHub repo →
        </a>
      </footer>
    </div>
  );
}
