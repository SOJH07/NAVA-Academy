export interface FloorPlanCell {
    text: string;
    category: 'ev-service' | 'ev-industrial' | 'facilities' | 'admin' | 'other';
}

export interface Floor {
    name: string;
    layout: FloorPlanCell[][];
}

export const staticFloorPlanData: Floor[] = [
    {
        name: "Ground Floor",
        layout: [
            [ {text: 'Dining Hall', category: 'facilities'}, {text: 'Gym', category: 'facilities'} ],
            [ {text: 'Dining Hall', category: 'facilities'}, {text: 'Recreational Room', category: 'facilities'} ],
            [ {text: 'WS-03\nEV-INDUSTRIAL\nPLC Lab-01', category: 'ev-industrial'}, {text: 'WS-14\nEV-INDUSTRIAL\nPLC Lab-02', category: 'ev-industrial'} ],
            [ {text: 'WS-04\nEV-INDUSTRIAL\nPneumatic Lab-01', category: 'ev-industrial'}, {text: 'WS-13\nEV-INDUSTRIAL\nPneumatic Lab-02', category: 'ev-industrial'} ],
            [ {text: 'MECHANICAL\nROOM', category: 'admin'}, {text: 'Student\nAffairs', category: 'admin'} ],
            [ {text: 'LEFT', category: 'admin'}, {text: 'MAIN RECEPTION\nLOBBY', category: 'admin'} ],
            [ {text: 'Watting LOBBY', category: 'admin'}, {text: 'MAIN RECEPTION\nLOBBY', category: 'admin'} ],
            [ {text: 'WS-05\nEV-INDUSTRIAL\nElectro-mechanical\nLAP 1', category: 'ev-industrial'}, {text: 'WS-12\nEV-INDUSTRIAL\nElectrical Advance', category: 'ev-industrial'} ],
            [ {text: 'WS-06\nEV-INDUSTRIAL\nElectrical Lab-01', category: 'ev-industrial'}, {text: 'WS-11\nEV-INDUSTRIAL\nElectrical Lab-02', category: 'ev-industrial'} ],
            [ {text: 'WS-07\nEV-Service\nHVAC System', category: 'ev-service'}, {text: 'WS-09\nEV-INDUSTRIAL\n(Smart Manufacturing\nI, II & III)', category: 'ev-industrial'} ],
            [ {text: 'WS-08\nEV-Service\nHVAC System', category: 'ev-service'}, {text: 'WS-10\nEV-INDUSTRIAL\n(Smart Manufacturing\nI, II & III)', category: 'ev-industrial'} ],
        ],
    },
    {
        name: "1st Floor",
        layout: [
            [ { text: "LAP-5\nEV-INUDSTRIAL\nHydraulics Lab", category: "ev-industrial" }, { text: "ROOM 1.04\nEV-INUDSTRIAL\nMechanical Lab", category: "ev-industrial" } ],
            [ { text: "L-107", category: "other" }, { text: "LAP-3\nEV-INUDSTRIAL\nHVAC Lab", category: "ev-industrial" } ],
            [ { text: "L-108", category: "other" }, { text: "LAP-2\nEV-INUDSTRIAL\nRobotics Lab-II", category: "ev-industrial" } ],
            [ { text: "Lab-06\nEV-SERVICE\nHV L3", category: "ev-service" }, { text: "LAP-1\nEV-INUDSTRIAL\nRobotics Lab-I", category: "ev-industrial" } ],
            [ { text: "Prayre Aeea", category: "admin" }, { text: "Staff", category: "admin" } ],
            [ { text: "LEFT", category: "admin" }, { text: "Staff", category: "admin" } ],
            [ { text: "MD Office", category: "admin" }, { text: "Staff", category: "admin" } ],
            [ { text: "Staff", category: "admin" }, { text: "Staff", category: "admin" } ],
            [ { text: "Lab-01\nEV-SERVICE\nBasic Electrical", category: "ev-service" }, { text: "Lab-02\nEV-SERVICE\nElectrical &\nElectronics\nHV Basics", category: "ev-service" } ],
            [ { text: "Lab-03\nEV-SERVICE\nHigh Voltage L2/L3", category: "ev-service" }, { text: "Lab-04\nEV-SERVICE\nAdvance Electronics\n/ Bus System", category: "ev-service" } ],
            [ { text: "Computer Lab-1", category: "other" }, { text: "Lab-05\nEV-SERVICE\nLighting System", category: "ev-service" } ]
        ],
    },
    {
        name: "2nd Floor",
        layout: [
            [ { text: "EV Industry\nTheory Class\nDPIT-06", category: "ev-industrial" }, { text: "EV Industry\nTheory Class\nDPIT-05", category: "ev-industrial" } ],
            [ { text: "EV Industry\nTheory Class\nDPIT-07", category: "ev-industrial" }, { text: "EV Industry\nTheory Class\nDPIT-04", category: "ev-industrial" } ],
            [ { text: "EV Industry\nTheory Class\nDPIT-08", category: "ev-industrial" }, { text: "EV Industry\nTheory Class\nDPIT-03", category: "ev-industrial" } ],
            [ { text: "EV Industry\nTheory Class\nDPIT-09", category: "ev-industrial" }, { text: "EV Industry\nTheory Class\nDPIT-02", category: "ev-industrial" } ],
            [ { text: "C-210", category: "other" }, { text: "EV Industry\nTheory Class\nDPIT-01", category: "ev-industrial" } ],
            [ { text: "LEFT", category: "admin" }, { text: "Staff", category: "admin" } ],
            [ { text: "Staff", category: "admin" }, { text: "Dean Office", category: "admin" } ],
            [ { text: "C-211", category: "other" }, { text: "EV Service\nTheory Class\nDPST-04", category: "ev-service" } ],
            [ { text: "C-212", category: "other" }, { text: "EV Service\nTheory Class\nDPST-03", category: "ev-service" } ],
            [ { text: "C-213", category: "other" }, { text: "EV Service\nTheory Class\nDPST-02", category: "ev-service" } ],
            [ { text: "Computer Lab-2", category: "other" }, { text: "EV Service\nTheory Class\nDPST-01", category: "ev-service" } ]
        ],
    },
    {
        name: "3rd Floor",
        layout: [
            [ { text: "C-306", category: "other" }, { text: "C-305", category: "other" } ],
            [ { text: "C-307", category: "other" }, { text: "C-304", category: "other" } ],
            [ { text: "C-308", category: "other" }, { text: "C-303", category: "other" } ],
            [ { text: "C-309", category: "other" }, { text: "Electrical Lab-02", category: "ev-industrial" } ],
            [ { text: "C-310", category: "other" }, { text: "Electrical Lab-01", category: "ev-industrial" } ],
            [ { text: "LEFT", category: "admin" }, { text: "Staff", category: "admin" } ],
            [ { text: "CAFETRIA", category: "facilities" }, { text: "C-319", category: "other" } ],
            [ { text: "C-311", category: "other" }, { text: "C-318", category: "other" } ],
            [ { text: "C-312", category: "other" }, { text: "C-317", category: "other" } ],
            [ { text: "C-313", category: "other" }, { text: "C-316", category: "other" } ],
            [ { text: "C-314", category: "other" }, { text: "C-315", category: "other" } ]
        ],
    }
];
