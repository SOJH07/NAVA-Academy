import { create } from 'zustand';
import type { ClassroomState } from '../types';

interface ClassroomStore {
    classrooms: ClassroomState;
    setOutOfService: (classroomName: string, reason: string) => void;
    setAvailable: (classroomName: string) => void;
}

const useClassroomStore = create<ClassroomStore>((set) => ({
    classrooms: {},
    setOutOfService: (classroomName, reason) => {
        set(state => ({
            classrooms: {
                ...state.classrooms,
                [classroomName]: { status: 'out-of-service', reason },
            },
        }));
    },
    setAvailable: (classroomName) => {
        set(state => {
            const newClassrooms = { ...state.classrooms };
            if (newClassrooms[classroomName] && newClassrooms[classroomName].status === 'out-of-service') {
                 delete newClassrooms[classroomName];
            }
            return { classrooms: newClassrooms };
        });
    },
}));

export default useClassroomStore;