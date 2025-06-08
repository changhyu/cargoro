import React from 'react';
// import { MyComponent } from '../../../../../app/components/mycomponent';

// Simple placeholder component
const MyComponent = () => (
  <div className="rounded-lg border p-4">
    <p>마이페이지 컴포넌트 준비 중입니다.</p>
  </div>
);

export default function MyPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">My Page</h1>
      <MyComponent />
    </div>
  );
}
