export type RoomType = "Workshop" | "Lab" | "Classroom" | "Facility";
export interface Cell {
  code: string;
  type: RoomType;
}
export interface FloorMatrix {
  name: "Ground" | "1st" | "2nd" | "3rd";
  rows: [Cell, Cell][];
}

export const FLOOR_PLANS: FloorMatrix[] = [
  {
    name: "Ground",
    rows: [
      [{ code: "Dining Hall", type: "Facility" }, { code: "Gym", type: "Facility" }],
      [{ code: "Dining Hall", type: "Facility" }, { code: "Recreational Room", type: "Facility" }],
      [{ code: "WS-03", type: "Workshop" }, { code: "WS-14", type: "Workshop" }],
      [{ code: "WS-04", type: "Workshop" }, { code: "WS-13", type: "Workshop" }],
      [{ code: "MECHANICAL ROOM", type: "Facility" }, { code: "Student Affairs", type: "Facility" }],
      [{ code: "LIFT", type: "Facility" }, { code: "MAIN RECEPTION LOBBY", type: "Facility" }],
      [{ code: "Waiting LOBBY", type: "Facility" }, { code: "MAIN RECEPTION LOBBY", type: "Facility" }],
      [{ code: "WS-05", type: "Workshop" }, { code: "WS-12", type: "Workshop" }],
      [{ code: "WS-06", type: "Workshop" }, { code: "WS-11", type: "Workshop" }],
      [{ code: "WS-07", type: "Workshop" }, { code: "WS-10", type: "Workshop" }],
      [{ code: "WS-08", type: "Workshop" }, { code: "WS-9", type: "Workshop" }]
    ]
  },
  {
    name: "1st",
    rows: [
      [{ code: "LAP-105", type: "Lab" }, { code: "LAP-104", type: "Lab" }],
      [{ code: "LAP-106", type: "Lab" }, { code: "LAP-103", type: "Lab" }],
      [{ code: "LAP-107", type: "Lab" }, { code: "LAP-102", type: "Lab" }],
      [{ code: "LAP-108", type: "Lab" }, { code: "LAP-101", type: "Lab" }],
      [{ code: "Prayer Area", type: "Facility" }, { code: "Staff", type: "Facility" }],
      [{ code: "LIFT", type: "Facility" }, { code: "Staff", type: "Facility" }],
      [{ code: "MD Office", type: "Facility" }, { code: "Staff", type: "Facility" }],
      [{ code: "LAP-109", type: "Lab" }, { code: "Staff", type: "Facility" }],
      [{ code: "LAP-110", type: "Lab" }, { code: "L-115", type: "Lab" }],
      [{ code: "LAP-111", type: "Lab" }, { code: "L-114", type: "Lab" }],
      [{ code: "LAP 112 Computer Lab-1", type: "Lab" }, { code: "L-113", type: "Lab" }]
    ]
  },
  {
    name: "2nd",
    rows: [
      [{ code: "C-206", type: "Classroom" }, { code: "C-205", type: "Classroom" }],
      [{ code: "C-207", type: "Classroom" }, { code: "C-204", type: "Classroom" }],
      [{ code: "C-208", type: "Classroom" }, { code: "C-203", type: "Classroom" }],
      [{ code: "C-209", type: "Classroom" }, { code: "C-202", type: "Classroom" }],
      [{ code: "C-210", type: "Classroom" }, { code: "C-201", type: "Classroom" }],
      [{ code: "LIFT", type: "Facility" }, { code: "Staff", type: "Facility" }],
      [{ code: "Staff", type: "Facility" }, { code: "Dean Office", type: "Facility" }],
      [{ code: "C-211", type: "Classroom" }, { code: "C-218", type: "Classroom" }],
      [{ code: "C-212", type: "Classroom" }, { code: "C-217", type: "Classroom" }],
      [{ code: "C-213", type: "Classroom" }, { code: "C-216", type: "Classroom" }],
      [{ code: "LAP 214 Computer Lab-2", type: "Lab" }, { code: "C-215", type: "Classroom" }]
    ]
  },
  {
    name: "3rd",
    rows: [
      [{ code: "L-306", type: "Lab" }, { code: "L-305", type: "Lab" }],
      [{ code: "L-307", type: "Lab" }, { code: "L-304", type: "Lab" }],
      [{ code: "L-308", type: "Lab" }, { code: "L-303", type: "Lab" }],
      [{ code: "L-309", type: "Lab" }, { code: "L-302", type: "Lab" }],
      [{ code: "L-310", type: "Lab" }, { code: "L-301", type: "Lab" }],
      [{ code: "LIFT", type: "Facility" }, { code: "Staff", type: "Facility" }],
      [{ code: "CAFETRIA", type: "Facility" }, { code: "L-319", type: "Lab" }],
      [{ code: "L-311", type: "Lab" }, { code: "L-318", type: "Lab" }],
      [{ code: "L-312", type: "Lab" }, { code: "L-317", type: "Lab" }],
      [{ code: "L-313", type: "Lab" }, { code: "L-316", type: "Lab" }],
      [{ code: "L-314", type: "Lab" }, { code: "L-315", type: "Lab" }]
    ]
  }
];
