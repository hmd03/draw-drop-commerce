'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StorePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // 하이드레이션 에러 방지 및 로그인 상태 체크
  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
    }
  }, [router]);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* 네비게이션 바 */}
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-8">
        <h1 className="text-2xl font-black tracking-tighter">DRAW / DROP</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('accessToken');
            router.push('/login');
          }}
          className="text-sm font-bold text-gray-500 hover:text-red-500 transition"
        >
          로그아웃
        </button>
      </header>

      {/* 이벤트 배너 */}
      <div className="bg-black text-white rounded-2xl p-8 mb-10 shadow-lg">
        <span className="bg-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
          Upcoming Drop
        </span>
        <h2 className="text-4xl font-extrabold mb-2">Air Max 'Lunar' Limited</h2>
        <p className="text-gray-400 mb-6">전 세계 단 50족. 오늘 오후 12시 선착순 발매 시작.</p>
      </div>

      {/* 상품 리스트 (현재는 단일 상품) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition flex flex-col items-center">
          <div className="w-full h-48 bg-gray-200 rounded-xl mb-6 flex items-center justify-center text-4xl">
            👟
          </div>
          <h3 className="text-xl font-bold mb-1">Air Max 'Lunar'</h3>
          <p className="text-gray-500 mb-4">₩ 239,000</p>
          
          <button 
            onClick={() => router.push('/')} // 우리가 만들어둔 대기열 페이지(Root)로 이동
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            선착순 구매 대기열 참여하기
          </button>
        </div>
      </div>
    </div>
  );
}