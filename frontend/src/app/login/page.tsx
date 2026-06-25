'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // 상태 관리
  const [isLogin, setIsLogin] = useState(true); // true: 로그인 모드, false: 회원가입 모드
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // 폼 제출 핸들러 (백엔드 API 호출)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 모드에 따라 호출할 백엔드 주소와 데이터 세팅
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          // 로그인 성공 시 JWT 토큰을 로컬 스토리지에 저장하고 메인으로 이동
          localStorage.setItem('accessToken', data.accessToken);
          alert('로그인에 성공했습니다! 🎉');
          router.push('/store')
        } else {
          // 회원가입 성공 시 로그인 화면으로 전환
          alert('회원가입이 완료되었습니다. 이제 로그인해 주세요!');
          setIsLogin(true);
          setPassword(''); // 비밀번호 초기화
        }
      } else {
        // 백엔드에서 보낸 에러 메시지 출력 (예: 이미 존재하는 이메일입니다)
        alert(`오류: ${data.message || '요청 처리에 실패했습니다.'}`);
      }
    } catch (error) {
      alert('서버와 통신할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해 주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          {isLogin ? '로그인' : '회원가입'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-3.5 rounded-lg hover:bg-gray-800 transition shadow-md"
          >
            {isLogin ? '로그인' : '계정 만들기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-500 hover:text-black font-medium transition"
          >
            {isLogin ? '아직 계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}