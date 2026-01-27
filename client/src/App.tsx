import useWebSocket from 'react-use-websocket';
import { useEffect } from 'react';
import { CockpitLayout } from './components/CockpitLayout'
import { useSocketStore } from './store/socketStore';

function App() {
  const { setReadyState, setLastMessage } = useSocketStore();

  const { lastMessage, readyState } = useWebSocket('ws://localhost:8000/ws', {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    setReadyState(readyState);
  }, [readyState, setReadyState]);

  useEffect(() => {
    if (lastMessage !== null) {
      setLastMessage(lastMessage.data);
      // Rough latency estimation: update "pong" time whenever we get a message
      useSocketStore.getState().updatePong();
    }
  }, [lastMessage, setLastMessage]);

  return (
    <CockpitLayout />
  )
}

export default App
