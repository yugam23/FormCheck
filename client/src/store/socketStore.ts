// socketStore.ts
//
// Global WebSocket state store using Zustand.
//
// Why Zustand instead of React Context:
//   WebSocket state is accessed by multiple components at different tree
//   levels (WebcamCapture, StatusIndicator, etc.). Zustand provides simpler
//   access patterns without prop drilling or context provider nesting.
//
// Note: This store is currently defined but may not be actively used if
// the WebSocket state is being managed locally in WebcamCapture.tsx.
// Consider consolidating if you need cross-component WS status sharing.

import { create } from 'zustand';
import { ReadyState } from 'react-use-websocket';

interface SocketState {
  readyState: ReadyState;
  setReadyState: (state: ReadyState) => void;
  lastMessage: string | null;
  setLastMessage: (msg: string | null) => void;
  lastPong: number;
  updatePong: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  readyState: ReadyState.UNINSTANTIATED,
  setReadyState: (state) => set({ readyState: state }),
  lastMessage: null,
  setLastMessage: (msg) => set({ lastMessage: msg }),
  lastPong: Date.now(),
  updatePong: () => set({ lastPong: Date.now() }),
}));
