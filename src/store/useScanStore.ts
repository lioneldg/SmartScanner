import { create } from 'zustand';

interface ScanItem {
  id: string;
  content: string;
  type: 'text' | 'url' | 'email' | 'phone';
  timestamp: number;
}

interface ScanState {
  // Scan history
  scanHistory: ScanItem[];

  // Current scan state
  isScanning: boolean;
  lastScanResult: string | null;

  // Actions
  addScanResult: (content: string, type: ScanItem['type']) => void;
  clearHistory: () => void;
  deleteScanItem: (id: string) => void;
  setScanning: (scanning: boolean) => void;
  setLastScanResult: (result: string | null) => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  // Initial state
  scanHistory: [],
  isScanning: false,
  lastScanResult: null,

  // Actions
  addScanResult: (content: string, type: ScanItem['type']) => {
    const newScan: ScanItem = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: Date.now(),
    };

    set(state => ({
      scanHistory: [newScan, ...state.scanHistory],
      lastScanResult: content,
    }));
  },

  clearHistory: () => set({ scanHistory: [] }),

  deleteScanItem: (id: string) =>
    set(state => ({
      scanHistory: state.scanHistory.filter(item => item.id !== id),
    })),

  setScanning: (scanning: boolean) => set({ isScanning: scanning }),

  setLastScanResult: (result: string | null) => set({ lastScanResult: result }),
}));
