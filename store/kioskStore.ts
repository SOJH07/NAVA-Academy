import { create } from 'zustand';
import type { FloorPlanItem } from '../types';

export type RoomStatusType = 'empty' | 'inClass' | 'break' | 'maintenance' | 'staffOnly';

export interface RoomStatus {
    status: RoomStatusType;
    group?: string;
    period?: string;
    topic?: string;
}

interface KioskState {
    selectedRoom: FloorPlanItem | null;
    selectedGroup: string | null;
    roomStatusById: Record<string, RoomStatus>;
    setSelectedRoom: (room: FloorPlanItem | null) => void;
    setSelectedGroup: (group: string | null) => void;
    setRoomStatus: (roomId: string, status: RoomStatus) => void;
    clearSelection: () => void;
}

const useKioskStore = create<KioskState>((set) => ({
    selectedRoom: null,
    selectedGroup: null,
    roomStatusById: {},
    setSelectedRoom: (room) => set({ selectedRoom: room, selectedGroup: null }),
    setSelectedGroup: (group) => set({ selectedGroup: group, selectedRoom: null }),
    setRoomStatus: (roomId, status) => set(state => ({
        roomStatusById: {
            ...state.roomStatusById,
            [roomId]: status,
        }
    })),
    clearSelection: () => set({ selectedRoom: null, selectedGroup: null }),
}));

export default useKioskStore;
