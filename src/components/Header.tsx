import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';

export default function Header() {
  return (
    <div className="fixed p-4 leading-none w-full z-50">
      <div className="grid grid-cols-2 p-3 px-4 bg-slate-500 w-full bg-opacity-50 backdrop-blur rounded-xl drop-shadow-lg justify-center items-center">
        <div className="font-bold text-lg text-white">
          <Link to={'/'} className="hidden md:flex">
            Futureverse Workshop
          </Link>
          <Link to={'/'} className="flex md:hidden">
            FV Workshop
          </Link>
        </div>
        <div className="flex justify-end">
          <Navigation />
        </div>
      </div>
    </div>
  );
}
