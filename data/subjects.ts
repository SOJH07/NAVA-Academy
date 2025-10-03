export interface Subject {
  code: string;
  name: string;
}

export const foundationSubjects: Subject[] = [
  { code: 'NAVA000', name: 'Orientation and Induction (Foundation)' },
  { code: 'NAVA010', name: 'English Special Purpose - Vocational English (50-50)' },
  { code: 'NAVA001', name: 'Health and Safety in a Manufacturing (50-50)' },
  { code: 'NAVA002', name: 'Applied Mathematics for Manufacturing (50-50)' },
  { code: 'NAVA003', name: 'Digital Transformation in Mfg (50-50)' },
  { code: 'NAVA004', name: 'Mfg workplace Readiness (50-50)' },
  { code: 'NAVA005', name: 'Introduction to Tools and Equipment (50-50)' },
  { code: 'NAVA006', name: 'Technical Drawings (50-50)' },
  { code: 'NAVA008', name: 'Controls and Instrumentation in a Manufacturing Context Introduction' },
];

const year2CommonSubject: Subject = { code: 'NAVA020', name: 'English Special Purpose - Vocational English II (50-50)' };

export const year2IndustrialSubjects: Subject[] = [
  year2CommonSubject,
  { code: 'NAVA101', name: 'Hydraulics Fundamentals' },
  { code: 'NAVA102', name: 'Mechanical Fundamentals' },
  { code: 'NAVA103', name: 'Electrical Fundamentals' },
  { code: 'NAVA104', name: 'Pneumatics Fundamentals' },
  { code: 'NAVA105', name: 'HVAC-Refrigeration Fundamentals, Principles, Servicing, and Maintenance' },
  { code: 'NAVA106', name: 'Fire Systems' },
  { code: 'NAVA107', name: 'PLC Introduction' },
  { code: 'NAVA108', name: 'Electrical Advanced' },
  { code: 'NAVA109', name: 'Electro-Mechanical/Mechatronics' },
  { code: 'NAVA110', name: 'Pneumatics-Hydraulics Advanced' },
  { code: 'NAVA111', name: 'Smart Manufacturing I' },
  { code: 'NAVA112', name: 'PLC Advanced' },
  { code: 'NAVA113', name: 'Robotics I' },
  { code: 'NAVA114', name: 'Predictive & Preventive Maintenance' },
  { code: 'NAVA115', name: 'Lean Manufacturing' },
  { code: 'NAVA116', name: 'Robotics Advanced' },
  { code: 'NAVA117', name: 'Smart Manufacturing II & III' },
  { code: 'NAVA118', name: 'Introduction to the Automotive Manufacturing Shopfloor' },
  { code: 'NAVA100', name: 'Industrial Placement' },
];

export const year2ServiceSubjects: Subject[] = [
  year2CommonSubject,
  { code: 'NAVA201', name: 'Vehicle Construction and Work Order fundamentals' },
  { code: 'NAVA202', name: 'Electrical Fundamentals and HV Safety' },
  { code: 'NAVA203', name: 'Tires and Wheels System' },
  { code: 'NAVA204', name: 'Braking, Steering, and Suspension Systems' },
  { code: 'NAVA205', name: 'Accessories, Lighting, and Wiper Systems' },
  { code: 'NAVA206', name: 'Glass Removal and Replacement' },
  { code: 'NAVA207', name: 'Body and Trim Adjustments' },
  { code: 'NAVA208', name: 'Automotive HVAC Systems' },
  { code: 'NAVA209', name: 'Dealership: Repair and Pre-Delivery Inspection' },
  { code: 'NAVA210', name: 'EV Systems and Components Diagnostic and maintenance' },
  { code: 'NAVA211', name: 'Vehicle Network and Communication' },
  { code: 'NAVA212', name: 'EV System Components' },
  { code: 'NAVA213', name: 'EV Battery and Charging Management System' },
  { code: 'NAVA200', name: 'Industrial Placement' },
];