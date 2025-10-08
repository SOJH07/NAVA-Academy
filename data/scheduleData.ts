import type { Assignment } from '../types';

const rawScheduleData = [
  // DPIT-01
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-01', classroom: '2.01', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-01', classroom: '2.01', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-01', classroom: '2.01', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-01', classroom: '2.01', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-01', classroom: 'WS-0.13', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-01', classroom: 'WS-0.13', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-01', classroom: 'WS-0.13', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-01', classroom: 'WS-0.13', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-01', classroom: 'WS-0.13', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-01', classroom: 'WS-0.13', instructor: 'Hesham', topic: 'U20 Pneumatics-Hydraulics Advanced' },

  // DPIT-02
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-02', classroom: '2.02', instructor: 'Rizwan Qadeer', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '2.02', instructor: 'Rizwan Qadeer', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-02', classroom: '2.02', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '2.02', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-02', classroom: '1.05', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '1.05', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-02', classroom: '1.05', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '1.05', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-02', classroom: 'WS-0.4', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-02', classroom: 'WS-0.4', instructor: 'Hanif', topic: 'U20 Pneumatics-Hydraulics Advanced' },

  // DPIT-03
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-03', classroom: '2.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-03', classroom: '2.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.11', instructor: 'Titus', topic: 'U19 Electro-Mechanical' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-03', classroom: '2.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-03', classroom: 'WS-0.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-03', classroom: 'WS-0.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-03', classroom: 'WS-0.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-03', classroom: 'WS-0.11', instructor: 'Abdul Rehman', topic: 'U19 Electro-Mechanical' },

  // DPIT-04
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U16 Fire System' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U16 Fire System' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U16 Fire System' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U16 Fire System' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U16 Fire System' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U16 Fire System' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U14 Pneumatic Fundamentals' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U14 Pneumatic Fundamentals' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U14 Pneumatic Fundamentals' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.10', instructor: 'Sahil', topic: 'U14 Pneumatic Fundamentals' },

  // DPIT-05
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-05', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-05', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-05', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-05', classroom: '2.13', instructor: 'Titus', topic: 'U12 Mechanical Fundamental' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '2.13', instructor: 'Titus', topic: 'U12 Mechanical Fundamental' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-05', classroom: '2.13', instructor: 'Titus', topic: 'U12 Mechanical Fundamental' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '2.13', instructor: 'Titus', topic: 'U12 Mechanical Fundamental' },

  // DPIT-06
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '2.06', instructor: 'Muhammad Asif', topic: 'U25 Lean Manufacturing' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.06', instructor: 'Muhammad Asif', topic: 'U25 Lean Manufacturing' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '2.06', instructor: 'Muhammad Asif', topic: 'U25 Lean Manufacturing' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.06', instructor: 'Muhammad Asif', topic: 'U25 Lean Manufacturing' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '2.06', instructor: 'Muhammad Asif', topic: 'U25 Lean Manufacturing' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.06', instructor: 'Muhammad Asif', topic: 'U25 Lean Manufacturing' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '2.06', instructor: 'Victor', topic: 'U14 Pneumatic Fundamentals' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.06', instructor: 'Victor', topic: 'U14 Pneumatic Fundamentals' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '2.06', instructor: 'Victor', topic: 'U14 Pneumatic Fundamentals' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.06', instructor: 'Victor', topic: 'U14 Pneumatic Fundamentals' },

  // DPIT-07
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Titus', topic: 'U15 HVAC' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.6', instructor: 'Muhammad Fathi', topic: 'U15 HVAC' },

  // DPIT-08
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-08', classroom: '1.05', instructor: 'Victor', topic: 'Unit 11 - Hydraulics Fundamentals' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-08', classroom: '1.05', instructor: 'Victor', topic: 'Unit 11 - Hydraulics Fundamentals' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-08', classroom: '1.05', instructor: 'Victor', topic: 'Unit 11 - Hydraulics Fundamentals' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-08', classroom: '1.05', instructor: 'Victor', topic: 'Unit 11 - Hydraulics Fundamentals' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-08', classroom: '2.08', instructor: 'Titus', topic: 'U13 Electrical Fundamental' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-08', classroom: '2.08', instructor: 'Victor', topic: 'U13 Electrical Fundamental' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-08', classroom: '2.08', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-08', classroom: '2.08', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-08', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-08', classroom: '3.01', instructor: 'Hanaa', topic: 'U13 Electrical Fundamental' },

  // DPIT-09
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-09', classroom: '2.09', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-09', classroom: '2.09', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-09', classroom: '3.02', instructor: 'Venkata', topic: 'U13 Electrical Fundamental' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-09', classroom: '3.02', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-09', classroom: '3.02', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-09', classroom: '3.02', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-09', classroom: '3.02', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-09', classroom: '3.02', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-09', classroom: '3.02', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-09', classroom: '3.02', instructor: 'Muhammad Hussain', topic: 'U13 Electrical Fundamental' },

  // DPST-01
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPST-01', classroom: '2.15', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPST-01', classroom: '2.15', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPST-01', classroom: '1.11', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPST-01', classroom: '1.11', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPST-01', classroom: '1.11', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPST-01', classroom: '1.11', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPST-01', classroom: '2.15', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPST-01', classroom: '2.15', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPST-01', classroom: '2.15', instructor: 'Azfar Ali', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPST-01', classroom: '2.15', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },

  // DPST-02
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.16', instructor: 'Sikandar Shahzad', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPST-02', classroom: '2.16', instructor: 'Azfar Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPST-02', classroom: '1.13', instructor: 'Sikandar Shahzad', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPST-02', classroom: '1.13', instructor: 'Sikandar Shahzad', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPST-02', classroom: '1.13', instructor: 'Sikandar Shahzad', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPST-02', classroom: '1.13', instructor: 'Sikandar Shahzad', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.16', instructor: 'Sikandar Shahzad', topic: 'Unit-13 Tires and Wheel System' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPST-02', classroom: '2.16', instructor: 'Sikandar Shahzad', topic: 'Unit-13 Tires and Wheel System' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.16', instructor: 'Sikandar Shahzad', topic: 'Unit-13 Tires and Wheel System' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPST-02', classroom: '2.16', instructor: 'Sikandar Shahzad', topic: 'Unit-13 Tires and Wheel System' },

  // DPST-03
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.17', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPST-03', classroom: '2.17', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.17', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPST-03', classroom: '2.17', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.17', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPST-03', classroom: '2.17', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPST-03', classroom: '1.13', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPST-03', classroom: '1.13', instructor: 'Azfar Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPST-03', classroom: '1.13', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPST-03', classroom: '1.13', instructor: 'Mustafa Ali', topic: 'Unit-15 Accessories, Lighting, and Wiper Systems' },

  // DPST-04
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPST-04', classroom: '2.18', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPST-04', classroom: '2.18', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPST-04', classroom: 'WS-0.8', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPST-04', classroom: 'WS-0.8', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPST-04', classroom: 'WS-0.8', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPST-04', classroom: 'WS-0.8', instructor: 'Abdallah Adel', topic: 'Unit-11 Vehicle Construction and Work Order fundamentals' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPST-04', classroom: '2.18', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPST-04', classroom: '2.18', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPST-04', classroom: '2.18', instructor: 'Sajid Rahman', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPST-04', classroom: '2.18', instructor: 'Azfar Ali', topic: 'Unit-12 Electrical Fundamentals and HV Safety' },
];

export const processedScheduleData: Assignment[] = [];
let idCounter = 1;

rawScheduleData.forEach(item => {
    if (!item.Period || !item.Day || !item.Group || !item.classroom || !item.instructor || !item.topic) {
        return;
    }
    
    const type: 'Technical' | 'Professional Development' = item.topic.includes('Professional Development') ? 'Professional Development' : 'Technical';

    const periods = item.Period.split(',').flatMap(p => {
        const trimmedP = p.trim();
        if (trimmedP.includes('-')) {
            const parts = trimmedP.substring(2).split('-').map(s => parseInt(s.trim(), 10));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const [start, end] = parts;
                const periodList = [];
                for (let i = start; i <= end; i++) {
                    periodList.push(`P${i}`);
                }
                return periodList;
            }
        }
        return [trimmedP];
    });

    periods.forEach(period => {
        if (period) {
            processedScheduleData.push({
                id: idCounter++,
                day: item.Day as Assignment['day'],
                period: period as Assignment['period'],
                group: item.Group,
                classroom: item.classroom,
                instructors: [item.instructor],
                topic: item.topic,
                type: type,
            });
        }
    });
});

const techInstructors = new Set<string>();
const professionalInstructors = new Set<string>();

processedScheduleData.forEach(assignment => {
    assignment.instructors.forEach(instructor => {
        if (assignment.type === 'Technical') {
            techInstructors.add(instructor);
        } else {
            professionalInstructors.add(instructor);
        }
    });
});

export const allInstructors = {
    tech: Array.from(techInstructors).sort(),
    professional: Array.from(professionalInstructors).sort(),
};