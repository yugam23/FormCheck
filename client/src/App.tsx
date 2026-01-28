import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CockpitLayout } from './components/CockpitLayout';
import { LandingPage } from './components/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<CockpitLayoutWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

// Wrapper to handle socket connection only when entering the App
import useWebSocket from 'react-use-websocket';
import { useEffect } from 'react';
import { useSocketStore } from './store/socketStore';

function CockpitLayoutWrapper() {
    const { setReadyState, setLastMessage } = useSocketStore();

    const { lastMessage, readyState } = useWebSocket('ws://127.0.0.1:8000/ws', {
        shouldReconnect: () => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
        share: true // Share connection with VideoFeed
    });

    useEffect(() => {
        setReadyState(readyState);
    }, [readyState, setReadyState]);

    useEffect(() => {
        if (lastMessage !== null) {
        setLastMessage(lastMessage.data);
        useSocketStore.getState().updatePong();
        }
    }, [lastMessage, setLastMessage]);

    return <CockpitLayout />;
}

export default App;
