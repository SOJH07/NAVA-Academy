import type { FloorPlanItem } from '../types';

export const groundFloorLayout: FloorPlanItem[] = [
    // Top Left Bank
    { name: 'WS-07 & 08 EV-Service HVAC System', type: 'lab', gridColumn: '3 / span 2', gridRow: '1 / span 2', capacity: 16 },
    { name: 'WS-06 EV-INDUSTRIAL Electrical Lab-01', type: 'lab', gridColumn: '5 / span 1', gridRow: '1 / span 2', capacity: 16 },
    { name: 'WS-05 EV-INDUSTRIAL Electro-mechanical Lab-01', type: 'lab', gridColumn: '6 / span 1', gridRow: '1 / span 2', capacity: 16 },
    
    // Bottom Left Bank
    { name: 'WS-09 & 10 EV-INDUSTRIAL (Smart Mfg)', type: 'lab', gridColumn: '3 / span 2', gridRow: '4 / span 2', capacity: 16 },
    { name: 'WS-11 EV-INDUSTRIAL Electrical Lab-02', type: 'lab', gridColumn: '5 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'WS-12 EV-INDUSTRIAL Electrical Advance', type: 'lab', gridColumn: '6 / span 1', gridRow: '4 / span 2', capacity: 16 },

    // Center Area
    { name: 'Waiting Lobby', type: 'static', gridColumn: '7 / span 1', gridRow: '1 / span 2' },
    { name: 'Main Reception Lobby', type: 'static', gridColumn: '5 / span 5', gridRow: '3 / span 1' },
    { name: 'Mechanical Room', type: 'static', gridColumn: '10 / span 1', gridRow: '1 / span 2' },
    { name: 'Admin Office - 1', type: 'static', gridColumn: '10 / span 1', gridRow: '4 / span 2' },

    // Top Right Bank
    { name: 'WS-04 EV-INDUSTRIAL Pneumatic Lab-01', type: 'lab', gridColumn: '11 / span 1', gridRow: '1 / span 2', capacity: 16 },
    { name: 'WS-03 EV-INDUSTRIAL PLC Lab-01', type: 'lab', gridColumn: '12 / span 1', gridRow: '1 / span 2', capacity: 16 },
    { name: 'Recreational Room', type: 'static', gridColumn: '13 / span 1', gridRow: '1 / span 1' },
    { name: 'Temporary Dining Hall-01', type: 'static', gridColumn: '13 / span 1', gridRow: '2 / span 1' },
    { name: 'Store Room', type: 'static', gridColumn: '14 / span 1', gridRow: '1 / span 1' },
    { name: 'Temporary Dining Hall-02', type: 'static', gridColumn: '14 / span 1', gridRow: '2 / span 1' },
    { name: 'Store Room Top', type: 'static', gridColumn: '15 / span 1', gridRow: '1 / span 1' },
    
    // Bottom Right Bank
    { name: 'WS-13 EV-INDUSTRIAL Pneumatic Lab-02', type: 'lab', gridColumn: '11 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'WS-14 EV-INDUSTRIAL PLC Lab-02', type: 'lab', gridColumn: '12 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'Recreational Room 2', type: 'static', gridColumn: '13 / span 1', gridRow: '4 / span 2' },
    { name: 'Store Room Bottom', type: 'static', gridColumn: '15 / span 1', gridRow: '4 / span 2' },
];

export const firstFloorLayout: FloorPlanItem[] = [
    // Top Left Bank
    { name: 'Room 1.12 Computer Lab', type: 'lab', gridColumn: '2 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Lab-03 High Voltage L2/L3', type: 'lab', gridColumn: '3 / span 1', gridRow: '1 / span 2', capacity: 16 },
    { name: 'Lab-01 Basic Electrical', type: 'lab', gridColumn: '4 / span 1', gridRow: '1 / span 2', capacity: 16 },
    
    // Bottom Left Bank
    { name: 'Lab-05 Lighting System', type: 'lab', gridColumn: '2 / span 2', gridRow: '4 / span 2', capacity: 16 },
    { name: 'Lab-04 Advance Electronics', type: 'lab', gridColumn: '4 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'Lab-02 Elec & HV Basics', type: 'lab', gridColumn: '5 / span 1', gridRow: '4 / span 2', capacity: 16 },

    // Center Area
    { name: 'Cafeteria', type: 'static', gridColumn: '6 / span 2', gridRow: '1 / span 1' },
    { name: 'Library', type: 'static', gridColumn: '6 / span 1', gridRow: '2 / span 1' },
    { name: 'Classroom L-116', type: 'classroom', gridColumn: '5 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Cubical 102', type: 'static', gridColumn: '6 / span 1', gridRow: '4 / span 1' },
    { name: 'Cubical 101', type: 'static', gridColumn: '6 / span 1', gridRow: '5 / span 1' },
    { name: 'Staff Room', type: 'static', gridColumn: '7 / span 1', gridRow: '5 / span 1' },
    { name: 'Meeting Room', type: 'static', gridColumn: '7 / span 1', gridRow: '4 / span 1' },
    { name: 'Prayer Area', type: 'static', gridColumn: '10 / span 1', gridRow: '1 / span 2' },

    // Top Right Bank
    { name: 'Lab-06 HV L3', type: 'lab', gridColumn: '11 / span 1', gridRow: '1 / span 2', capacity: 16 },
    { name: 'Classroom R-107', type: 'classroom', gridColumn: '12 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom R-106', type: 'classroom', gridColumn: '13 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'ROOM 1.05 Hydraulics Lab', type: 'lab', gridColumn: '14 / span 1', gridRow: '1 / span 2', capacity: 16 },

    // Bottom Right Bank
    { name: 'ROOM 1.01 Robotics Lab-I', type: 'lab', gridColumn: '11 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'ROOM 1.02 Robotics Lab-II', type: 'lab', gridColumn: '12 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'ROOM 1.03 HVAC Lab', type: 'lab', gridColumn: '13 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'ROOM 1.04 Mechanical Lab', type: 'lab', gridColumn: '14 / span 1', gridRow: '4 / span 2', capacity: 16 },
];

export const secondFloorLayout: FloorPlanItem[] = [
    // Top Left Bank
    { name: 'Room 2.14 Computer Lab-II', type: 'lab', gridColumn: '2 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom L-213', type: 'classroom', gridColumn: '4 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom L-212', type: 'classroom', gridColumn: '5 / span 1', gridRow: '1 / span 2', capacity: 20 },
    // Bottom Left Bank
    { name: 'EV Service Theory Class DPST-01', type: 'classroom', gridColumn: '2 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'EV Service Theory Class DPST-02', type: 'classroom', gridColumn: '3 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'EV Service Theory Class DPST-03', type: 'classroom', gridColumn: '4 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'EV Service Theory Class DPST-04', type: 'classroom', gridColumn: '5 / span 1', gridRow: '4 / span 2', capacity: 20 },

    // Center
    { name: 'Cafeteria', type: 'static', gridColumn: '6 / span 2', gridRow: '1 / span 2' },
    { name: 'Classroom R-210', type: 'classroom', gridColumn: '9 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom L-219', type: 'classroom', gridColumn: '6 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'Staff Room C-202', type: 'static', gridColumn: '7 / span 1', gridRow: '4 / span 2' },

    // Top Right Bank
    { name: 'EV Industry Theory Class DPIT-09', type: 'classroom', gridColumn: '10 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'EV Industry Theory Class DPIT-08', type: 'classroom', gridColumn: '11 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'EV Industry Theory Class DPIT-07', type: 'classroom', gridColumn: '12 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'EV Industry Theory Class DPIT-06', type: 'classroom', gridColumn: '13 / span 1', gridRow: '1 / span 2', capacity: 20 },

    // Bottom Right Bank
    { name: 'EV Industry Theory Class DPIT-01', type: 'classroom', gridColumn: '9 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'EV Industry Theory Class DPIT-02', type: 'classroom', gridColumn: '10 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'EV Industry Theory Class DPIT-03', type: 'classroom', gridColumn: '11 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'EV Industry Theory Class DPIT-04', type: 'classroom', gridColumn: '12 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'EV Industry Theory Class DPIT-05', type: 'classroom', gridColumn: '13 / span 1', gridRow: '4 / span 2', capacity: 20 },
];

export const thirdFloorLayout: FloorPlanItem[] = [
    // Top Left Bank
    { name: 'Classroom L-214', type: 'classroom', gridColumn: '2 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom L-213', type: 'classroom', gridColumn: '3 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom L-212', type: 'classroom', gridColumn: '4 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom L-311', type: 'classroom', gridColumn: '5 / span 1', gridRow: '1 / span 2', capacity: 20 },
    // Bottom Left Bank
    { name: 'Classroom L-215', type: 'classroom', gridColumn: '2 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'Classroom L-216', type: 'classroom', gridColumn: '3 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'Classroom L-217', type: 'classroom', gridColumn: '4 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'Classroom L-218', type: 'classroom', gridColumn: '5 / span 1', gridRow: '4 / span 2', capacity: 20 },
    
    // Center
    { name: 'Cafeteria', type: 'static', gridColumn: '6 / span 2', gridRow: '1 / span 2' },
    { name: 'Classroom L-219', type: 'classroom', gridColumn: '6 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'Staff Room C-303', type: 'static', gridColumn: '8 / span 1', gridRow: '4 / span 2' },

    // Top Right Bank
    { name: 'Classroom R-210', type: 'classroom', gridColumn: '9 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom R-209', type: 'classroom', gridColumn: '10 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom R-308', type: 'classroom', gridColumn: '11 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom R-307', type: 'classroom', gridColumn: '12 / span 1', gridRow: '1 / span 2', capacity: 20 },
    { name: 'Classroom R-306', type: 'classroom', gridColumn: '13 / span 1', gridRow: '1 / span 2', capacity: 20 },
    
    // Bottom Right Bank
    { name: 'Temporary Electrical Lab-01', type: 'lab', gridColumn: '9 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'Temporary Electrical Lab-02', type: 'lab', gridColumn: '10 / span 1', gridRow: '4 / span 2', capacity: 16 },
    { name: 'Classroom R-303', type: 'classroom', gridColumn: '11 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'Classroom R-304', type: 'classroom', gridColumn: '12 / span 1', gridRow: '4 / span 2', capacity: 20 },
    { name: 'Classroom R-305', type: 'classroom', gridColumn: '13 / span 1', gridRow: '4 / span 2', capacity: 20 },
];

export const incubatorLayout: FloorPlanItem[] = [
    { name: 'INCUBATOR 10: Electro-Mechanical', type: 'workshop', gridColumn: '1 / span 2', gridRow: '1 / span 6', capacity: 20 },
    { name: 'INCUBATOR 9: Automation/Robotics', type: 'workshop', gridColumn: '3 / span 2', gridRow: '1 / span 6', capacity: 20 },
    { name: 'INCUBATOR 8: Glass Repair & Body Paint', type: 'workshop', gridColumn: '5 / span 2', gridRow: '1 / span 6', capacity: 20 },
    { name: 'INCUBATOR 7: High Voltage & Diagnostics', type: 'workshop', gridColumn: '7 / span 1', gridRow: '1 / span 6', capacity: 12 },
    { name: 'INCUBATOR 6: High Voltage DGUV', type: 'workshop', gridColumn: '8 / span 1', gridRow: '1 / span 6', capacity: 12 },
    { name: 'INCUBATOR 5: Break, Steering Wheel', type: 'workshop', gridColumn: '9 / span 2', gridRow: '1 / span 6', capacity: 16 },
    { name: 'INCUBATOR 4: Tires, Breaks, Wheels', type: 'workshop', gridColumn: '11 / span 2', gridRow: '1 / span 6', capacity: 16 },
    { name: 'INCUBATOR 3: Accessories, Lighting', type: 'workshop', gridColumn: '13 / span 2', gridRow: '1 / span 6', capacity: 16 },
    { name: 'INCUBATOR 2 & 1', type: 'workshop', gridColumn: '15 / span 1', gridRow: '1 / span 6', capacity: 16 },
];

export const allFloorLayouts = {
    third: thirdFloorLayout,
    second: secondFloorLayout,
    first: firstFloorLayout,
    ground: groundFloorLayout,
    incubator: incubatorLayout
};