'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  // 상태 관리
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'WAITING' | 'ACTIVE'>('IDLE');
  const [position, setPosition] = useState<number>(0);

  // 1. 대기열 진입 함수
  const handleEnterQueue = async () => {
    if (!userId) return alert('유저 ID를 입력해주세요!');

    const res = await fetch('http://localhost:3000/queue/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    
    const data = await res.json();
    setPosition(data.position);
    setStatus(data.status);
  };

  // 2. 실시간 SSE 연결 로직
  useEffect(() => {
    let eventSource: EventSource;

    if (status === 'WAITING') {
      // 대기 상태가 되면 백엔드 SSE 엔드포인트와 연결
      eventSource = new EventSource(`http://localhost:3000/queue/stream?userId=${userId}`);

      // 메시지 수신 이벤트 핸들러
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setPosition(data.position);
        
        // 순번이 줄어들다가 ACTIVE 상태가 되면 연결 종료 및 화면 전환
        if (data.status === 'ACTIVE') {
          setStatus('ACTIVE');
          eventSource.close();
        }
      };

      // 에러 발생 시 안전하게 연결 종료
      eventSource.onerror = () => {
        eventSource.close();
      };
    }

    // 컴포넌트 언마운트 시 메모리 누수 방지를 위해 연결 정리
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [status, userId]);

  // 3. 상태에 따른 화면 렌더링
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        
        {/* 상태 1: 진입 전 (IDLE) */}
        {status === 'IDLE' && (
          <>
            <h1 className="text-2xl font-bold mb-4">👟 한정판 스니커즈 드로우</h1>
            <input
              type="text"
              placeholder="테스트용 유저 ID 입력"
              className="w-full p-3 border rounded-lg mb-4"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <button
              onClick={handleEnterQueue}
              className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition"
            >
              구매 대기열 진입하기
            </button>
          </>
        )}

        {/* 상태 2: 대기 중 (WAITING) */}
        {status === 'WAITING' && (
          <div className="animate-pulse">
            <h2 className="text-xl font-bold text-gray-700 mb-2">접속 대기 중입니다...</h2>
            <p className="text-sm text-gray-500 mb-6">새로고침을 누르지 마세요. 순서가 뒤로 밀릴 수 있습니다.</p>
            <div className="bg-gray-100 p-6 rounded-lg">
              <span className="block text-sm text-gray-500 mb-1">내 앞에 남은 인원</span>
              <span className="text-4xl font-extrabold text-blue-600">{position}명</span>
            </div>
          </div>
        )}

        {/* 상태 3: 통과 완료 (ACTIVE) */}
        {status === 'ACTIVE' && (
          <div>
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">접속 성공!</h2>
            <p className="text-gray-600 mb-6">이제 안전하게 상품을 구매하실 수 있습니다.</p>
            
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('accessToken');

                  const res = await fetch('http://localhost:3000/order/purchase', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userId }), 
                  });
                  const data = await res.json();
                  
                  if (res.ok) {
                    alert(`${data.message}\n남은 재고: ${data.remainStock}개`);
                  } else {
                    alert(`구매 실패: ${data.message}`);
                  }
                } catch (error) {
                  alert('결제 처리 중 오류가 발생했습니다.');
                }
              }}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              스니커즈 결제하기 (재고 차감)
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}