'use client';

import { FaUser, FaShoppingCart } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/40 bg-white/35 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="text-xl font-bold tracking-tight text-amber-950">Two hand</div>
        <div className="mx-4 flex-1">
          <input
            type="text"
            placeholder="ค้นหาของมือสอง..."
            className="w-full rounded-full border border-white/50 bg-white/50 px-4 py-2 text-amber-950 placeholder:text-amber-900/40 outline-none backdrop-blur-md focus:border-amber-400"
          />
        </div>
        <div className="flex items-center space-x-4 text-amber-950">
          <FaUser className="h-5 w-5" />
          <FaShoppingCart className="h-5 w-5" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
