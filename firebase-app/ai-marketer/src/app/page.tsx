import AuthWrapper from '@/components/AuthWrapper';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <AuthWrapper>
      <ChatInterface />
    </AuthWrapper>
  );
}