import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Marker {
  id: string;
  x: number;
  y: number;
  color: 'green' | 'red';
}

export interface CountRecord {
  id: string;
  image: string;
  count: number;
  markers: Marker[];
  objectType: string;
  createdAt: number;
}

interface CountState {
  records: CountRecord[];
  currentImage: string | null;
  currentMarkers: Marker[];
  currentObjectType: string;
  
  addRecord: (record: CountRecord) => void;
  updateRecord: (id: string, record: Partial<CountRecord>) => void;
  deleteRecord: (id: string) => void;
  setCurrentImage: (image: string | null) => void;
  addMarker: (marker: Marker) => void;
  removeMarker: (markerId: string) => void;
  clearMarkers: () => void;
  setCurrentObjectType: (type: string) => void;
}

export const useCountStore = create<CountState>()(
  persist(
    (set) => ({
      records: [],
      currentImage: null,
      currentMarkers: [],
      currentObjectType: 'steel-pipe',

      addRecord: (record) =>
        set((state) => ({
          records: [record, ...state.records],
        })),

      updateRecord: (id, record) =>
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? { ...r, ...record } : r)),
        })),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      setCurrentImage: (image) =>
        set(() => ({
          currentImage: image,
        })),

      addMarker: (marker) =>
        set((state) => ({
          currentMarkers: [...state.currentMarkers, marker],
        })),

      removeMarker: (markerId) =>
        set((state) => ({
          currentMarkers: state.currentMarkers.filter((m) => m.id !== markerId),
        })),

      clearMarkers: () =>
        set(() => ({
          currentMarkers: [],
        })),

      setCurrentObjectType: (type) =>
        set(() => ({
          currentObjectType: type,
        })),
    }),
    {
      name: 'count-storage',
    }
  )
);
