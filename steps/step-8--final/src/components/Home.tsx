import { useAuth } from '@futureverse/auth-react';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/LoginButton';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { userSession } = useAuth();
  const { isConnected } = useAccount();

  return (
    <main className="flex min-h-[calc(100dvh-6rem-1rem)] flex-col items-center justify-center text-white">
      <div className="container grid grid-cols-6 gap-y-3 ">
        <div className="grid gap-8 col-span-full md:col-span-4 pb-52 lg:pb-0 z-20 lg:z-0">
          <h1 className="text-4xl lg:text-6xl xl:text-8xl font-bold text-left">
            Mint Your Swappables! 🚀
          </h1>
          <div className="flex justify-start">
            {!userSession || !isConnected ? (
              <LoginButton buttonText="Login to mint your NFT now!" />
            ) : (
              <Button
                asChild
                size="lg"
                className={`text-lg xl:text-xl bg-accent-foreground py-6 px-8 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors duration-300 rounded-md`}
              >
                <Link to="/mint">Mint your NFT now!</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-auto z-10">
        <img
          src="/RichieRich.webp"
          width={1200}
          height={1200}
          alt="Futureverse Workshop: Paris"
          className="h-auto w-auto"
        />
      </div>
    </main>
  );
}
