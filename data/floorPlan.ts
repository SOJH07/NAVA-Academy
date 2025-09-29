import type { FloorPlanItem } from '../types';

export const secondFloorLayout: FloorPlanItem[] = [
    // Column 1
    { name: 'C-206', type: 'classroom', gridColumn: '1', gridRow: '1' },
    { name: 'C-207', type: 'classroom', gridColumn: '1', gridRow: '2' },
    { name: 'C-208', type: 'classroom', gridColumn: '1', gridRow: '3' },
    { name: 'C-209', type: 'classroom', gridColumn: '1', gridRow: '4' },
    { name: 'C-210', type: 'classroom', gridColumn: '1', gridRow: '5' },
    { name: 'Core', type: 'static', gridColumn: '1', gridRow: '6' },
    { name: 'TUV Office', type: 'static', gridColumn: '1', gridRow: '7' },
    { name: 'C-211', type: 'classroom', gridColumn: '1', gridRow: '8' },
    { name: 'C-212', type: 'classroom', gridColumn: '1', gridRow: '9' },
    { name: 'C-213', type: 'classroom', gridColumn: '1', gridRow: '10' },
    { name: 'Computer Lab', type: 'lab', gridColumn: '1', gridRow: '11' },

    // Column 2
    { name: 'C-205', type: 'classroom', gridColumn: '2', gridRow: '1' },
    { name: 'C-204', type: 'classroom', gridColumn: '2', gridRow: '2' },
    { name: 'C-203', type: 'classroom', gridColumn: '2', gridRow: '3' },
    { name: 'C-202', type: 'classroom', gridColumn: '2', gridRow: '4' },
    { name: 'C-201', type: 'classroom', gridColumn: '2', gridRow: '5' },
    { name: 'Technical Trainers', type: 'static', gridColumn: '2', gridRow: '6' },
    { name: 'Dean Office', type: 'static', gridColumn: '2', gridRow: '7' },
    { name: 'C-218', type: 'classroom', gridColumn: '2', gridRow: '8' },
    { name: 'C-217', type: 'classroom', gridColumn: '2', gridRow: '9' },
    { name: 'C-216', type: 'classroom', gridColumn: '2', gridRow: '10' },
    { name: 'C-215', type: 'classroom', gridColumn: '2', gridRow: '11' },
];

export const firstFloorLayout: FloorPlanItem[] = [
    // Column 1
    { name: 'C-106', type: 'classroom', gridColumn: '1', gridRow: '1' },
    { name: 'C-107', type: 'classroom', gridColumn: '1', gridRow: '2' },
    { name: 'C-108', type: 'classroom', gridColumn: '1', gridRow: '3' },
    { name: 'C-109', type: 'classroom', gridColumn: '1', gridRow: '4' },
    { name: 'C-110', type: 'classroom', gridColumn: '1', gridRow: '5' },
    { name: 'Office', type: 'static', gridColumn: '1', gridRow: '6' },
    { name: 'Office', type: 'static', gridColumn: '1', gridRow: '7' },
    { name: 'C-111', type: 'classroom', gridColumn: '1', gridRow: '8' },
    { name: 'C-112', type: 'classroom', gridColumn: '1', gridRow: '9' },
    { name: 'C-113', type: 'classroom', gridColumn: '1', gridRow: '10' },
    { name: 'C-114', type: 'classroom', gridColumn: '1', gridRow: '11' },

    // Column 2
    { name: 'C-105', type: 'classroom', gridColumn: '2', gridRow: '1' },
    { name: 'C-104', type: 'classroom', gridColumn: '2', gridRow: '2' },
    { name: 'C-103', type: 'classroom', gridColumn: '2', gridRow: '3' },
    { name: 'C-102', type: 'classroom', gridColumn: '2', gridRow: '4' },
    { name: 'C-101', type: 'classroom', gridColumn: '2', gridRow: '5' },
    { name: 'Office', type: 'static', gridColumn: '2', gridRow: '6' },
    { name: 'Office', type: 'static', gridColumn: '2', gridRow: '7' },
    { name: 'C-118', type: 'classroom', gridColumn: '2', gridRow: '8' },
    { name: 'C-117', type: 'classroom', gridColumn: '2', gridRow: '9' },
    { name: 'C-116', type: 'classroom', gridColumn: '2', gridRow: '10' },
    { name: 'C-115', type: 'classroom', gridColumn: '2', gridRow: '11' },
];

export const groundFloorLayout: FloorPlanItem[] = [
    // Column 1
    { name: 'WS-0.5', type: 'workshop', gridColumn: '1', gridRow: '1' },
    { name: 'WS-G01', type: 'workshop', gridColumn: '1', gridRow: '2' },
    { name: 'WS-G03', type: 'workshop', gridColumn: '1', gridRow: '3' },
    { name: 'WS-G05', type: 'workshop', gridColumn: '1', gridRow: '4' },
    { name: 'WS-G07', type: 'workshop', gridColumn: '1', gridRow: '5' },
    { name: 'Reception', type: 'static', gridColumn: '1', gridRow: '6' },
    { name: 'Security', type: 'static', gridColumn: '1', gridRow: '7' },
    { name: 'WS-G09', type: 'workshop', gridColumn: '1', gridRow: '8' },
    { name: 'WS-G11', type: 'workshop', gridColumn: '1', gridRow: '9' },
    { name: 'WS-G13', type: 'workshop', gridColumn: '1', gridRow: '10' },
    { name: 'Maintenance', type: 'static', gridColumn: '1', gridRow: '11' },

    // Column 2
    { name: 'WS-0.6', type: 'workshop', gridColumn: '2', gridRow: '1' },
    { name: 'WS-G02', type: 'workshop', gridColumn: '2', gridRow: '2' },
    { name: 'WS-G04', type: 'workshop', gridColumn: '2', gridRow: '3' },
    { name: 'WS-G06', type: 'workshop', gridColumn: '2', gridRow: '4' },
    { name: 'WS-G08', type: 'workshop', gridColumn: '2', gridRow: '5' },
    { name: 'First Aid', type: 'static', gridColumn: '2', gridRow: '6' },
    { name: 'IT Office', type: 'static', gridColumn: '2', gridRow: '7' },
    { name: 'WS-G10', type: 'workshop', gridColumn: '2', gridRow: '8' },
    { name: 'WS-G12', type: 'workshop', gridColumn: '2', gridRow: '9' },
    { name: 'WS-G14', type: 'workshop', gridColumn: '2', gridRow: '10' },
    { name: 'Storage', type: 'static', gridColumn: '2', gridRow: '11' },
];


export const allFloorLayouts = {
    second: secondFloorLayout,
    first: firstFloorLayout,
    ground: groundFloorLayout,
};