import { create } from 'zustand';
import type { FloorPlanItem } from '../types';

export type RoomStatusType = 'empty' | 'inClass' | 'break' | 'maintenance' | 'staffOnly';

export interface RoomStatus {
    status: RoomStatusType;
    group?: string;
    period?: string;
    topic?: string;
    instructor?: string;
}

type FloorName = "Ground" | "1st" | "2nd" | "3rd";

interface KioskState {
    selectedRoom: FloorPlanItem | null;
    selectedGroup: string | null;
    roomStatusById: Record<string, RoomStatus>;
    kioskMode: 'student' | 'admin';
    selectedFloor: FloorName;
    setSelectedRoom: (room: FloorPlanItem | null) => void;
    setSelectedGroup: (group: string | null) => void;
    setRoomStatus: (roomId: string, status: RoomStatus) => void;
    setRoomStatuses: (statuses: Record<string, RoomStatus>) => void;
    clearSelection: () => void;
    setKioskMode: (mode: 'student' | 'admin') => void;
    setSelectedFloor: (floor: FloorName) => void;
}

const useKioskStore = create<KioskState>((set) => ({
    selectedRoom: null,
    selectedGroup: null,
    roomStatusById: {},
    kioskMode: 'student', // Default to student mode
    selectedFloor: '2nd',
    setSelectedRoom: (room) => set({ selectedRoom: room, selectedGroup: null }),
    setSelectedGroup: (group) => set({ selectedGroup: group, selectedRoom: null }),
    setRoomStatus: (roomId, status) => set(state => ({
        roomStatusById: {
            ...state.roomStatusById,
            [roomId]: status,
        }
    })),
    setRoomStatuses: (statuses) => set({ roomStatusById: statuses }),
    clearSelection: () => set({ selectedRoom: null, selectedGroup: null }),
    setKioskMode: (mode) => set({ kioskMode: mode }),
    setSelectedFloor: (floor) => set({ selectedFloor: floor }),
}));

export default useKioskStore;