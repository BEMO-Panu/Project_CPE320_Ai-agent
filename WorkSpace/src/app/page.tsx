'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import PixelAgent from '../components/PixelAgent';

const thumbs = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80',
];

const ProductDetailPage = () => {
  const [hero, setHero] = useState(thumbs[0]);
  const [bid, setBid] = useState('');
  const currentPrice = 100;

  return (
    <div className="relative z-10">
      <Navbar />
      <div className="container mx-auto flex flex-col gap-6 p-4 pb-36 md:flex-row">
        <div className="w-full p-2 md:w-2/3">
          <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/25 shadow-[0_20px_60px_rgba(92,47,18,0.12)] backdrop-blur-xl">
            <img src={hero} alt="หนังสือมือสองสภาพดี" className="h-[420px] w-full object-cover" />
          </div>
          <div className="mt-4 flex space-x-3">
            {thumbs.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setHero(src)}
                className={`overflow-hidden rounded-2xl border bg-white/30 backdrop-blur-md transition ${
                  hero === src ? 'border-amber-500 ring-2 ring-amber-400/60' : 'border-white/40'
                }`}
              >
                <img src={src} alt="Thumbnail" className="h-20 w-24 object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-32 w-full p-2 md:mb-0 md:w-1/3">
          <div className="rounded-3xl border border-white/50 bg-white/30 p-6 shadow-[0_20px_60px_rgba(92,47,18,0.12)] backdrop-blur-xl">
            <p className="text-xs font-medium tracking-widest text-amber-700/80 uppercase">
              ของมือสอง · สภาพดี
            </p>
            <h2 className="mt-1 text-2xl font-bold text-amber-950">หนังสือมือสองสภาพดี</h2>
            <div className="mt-3 flex items-center gap-3 text-sm text-amber-900/70">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/70 text-xs font-semibold text-amber-900">
                JD
              </span>
              ผู้ขาย John Doe · ⭐ 4.8
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/50 bg-white/15 p-5 shadow-[0_20px_60px_rgba(92,47,18,0.18)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber-300/50 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-orange-400/40 blur-2xl" />
            <h3 className="relative text-sm font-semibold tracking-wide text-amber-900/80">
              พื้นที่ประมูล
            </h3>
            <div className="relative mt-3 text-3xl font-bold text-amber-950">
              {currentPrice.toLocaleString('th-TH')} บาท
            </div>
            <p className="relative mt-1 text-sm text-amber-900/60">ราคาประมูลปัจจุบัน</p>
            <div className="relative mt-3 inline-flex rounded-full bg-white/40 px-3 py-1 text-xs text-amber-900/80 backdrop-blur-md">
              เวลาที่เหลือ 01:23:45
            </div>
            <input
              type="number"
              min={currentPrice + 1}
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              placeholder="ใส่ราคาที่เสนอ"
              className="relative mt-4 w-full rounded-2xl border border-white/50 bg-white/35 px-4 py-3 text-amber-950 placeholder:text-amber-900/40 outline-none backdrop-blur-md focus:border-amber-400"
            />
            <button
              type="button"
              className="relative mt-3 w-full rounded-2xl bg-amber-400 py-3 font-semibold text-amber-950 shadow-lg shadow-amber-900/20 transition hover:bg-amber-300"
            >
              เสนอราคา
            </button>
          </div>
        </div>
      </div>
      <PixelAgent />
    </div>
  );
};

export default ProductDetailPage;
