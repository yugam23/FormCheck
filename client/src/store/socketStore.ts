import { create } from 'zustand';
import { ReadyState } from 'react-use-websocket';

interface SocketState {
  readyState: ReadyState;
  setReadyState: (state: ReadyState) => void;
  lastMessage: string | null;
  setLastMessage: (msg: string | null) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  readyState: ReadyState.UNINSTANTIATED,
  setReadyState: (state) => set({ readyState: state }),
  lastMessage: null,
  setLastMessage: (msg) => set({ lastMessage: msg }),
}));
