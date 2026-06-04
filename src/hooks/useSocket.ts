import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../lib/socket';

export function useSocket(
  event: string,
  handler: (data: any) => void,
  deps: any[] = [],
) {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    let mounted = true;
    getSocket().then((socket) => {
      if (!mounted) return;
      socketRef.current = socket;
      socket.on(event, handler);
    });
    return () => {
      mounted = false;
      socketRef.current?.off(event, handler);
    };
  }, deps);
}

export function useJoinConversation(conversationId: string | null) {
  useEffect(() => {
    if (!conversationId) return;
    getSocket().then((socket) => {
      socket.emit('join_conversation', { conversationId });
    });
  }, [conversationId]);
}
