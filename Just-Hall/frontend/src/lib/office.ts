// src/lib/office.ts
export interface OfficeContact {
  phone?: string;
  email?: string;
}

export interface OfficeLocation {
  building: string;
  floor?: string;
  room?: string;
}

export interface OfficeBase {
  key: string;
  title: string;         // e.g., "Provost Office"
  name: string;          // e.g., "Provost Office"
  contact: OfficeContact;
  location: OfficeLocation;
  hours: string;         // e.g., "Sunday – Thursday, 9:00 AM – 5:00 PM"
  icon?: string;         // emoji icon (no deps)
  note?: string;         // optional small note
}

export interface Staff {
  name: string;
  designation: string;
  role: string;          // Hall Clerk / IT Support / Maintenance Supervisor
  phone?: string;
  email?: string;
}

export interface OfficeSection {
  key: string;
  office: OfficeBase;
  staff?: Staff[];
}

export const officeSections: OfficeSection[] = [
  {
    key: "provost",
    office: {
      key: "provost",
      title: "Provost Office",
      name: "Provost Office",
      icon: "🏛️",
      contact: {
        phone: "+880-1XXXXXXXXX",
        email: "provost@university.edu",
      },
      location: {
        building: "Hall Administrative Building",
        floor: "2nd Floor",
        room: "Room 205",
      },
      hours: "Sunday – Thursday, 9:00 AM – 5:00 PM",
      note: "Primary contact point for seat allocation, policy, and approvals.",
    },
  },
  {
    key: "staff-office",
    office: {
      key: "staff-office",
      title: "Staff Office",
      name: "Staff Office",
      icon: "🗂️",
      contact: {
        phone: "+880-1YYYYYYYYY",
        email: "hall.staff@university.edu",
      },
      location: {
        building: "Hall Administrative Building",
        floor: "Ground Floor",
        room: "Room G03",
      },
      hours: "Sunday – Thursday, 10:00 AM – 4:00 PM",
      note: "Assistance with forms, complaints, maintenance & general queries.",
    },
    staff: [
      {
        name: "Md. Rahim Uddin",
        designation: "Senior Clerk",
        role: "Hall Clerk",
        phone: "+880-1ZZZZZZZZZ",
        email: "rahim.uddin@university.edu",
      },
      {
        name: "Nasrin Akter",
        designation: "IT Officer",
        role: "IT Support",
        phone: "+880-1AAAAAAAAB",
        email: "nasrin.akter@university.edu",
      },
      {
        name: "Shafiqul Islam",
        designation: "Supervisor",
        role: "Maintenance Supervisor",
        phone: "+880-1BBBBBBBBB",
        email: "shafiqul.islam@university.edu",
      },
    ],
  },
];
