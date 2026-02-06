export type FAQItem = { q: string; a: string };
export type FAQCategory = { key: string; title: string; items: FAQItem[] };

// Hard-coded FAQs
export const faqCategories: FAQCategory[] = [
  {
    key: "general",
    title: "General",
    items: [
      {
        q: "How can I apply for a seat in the hall?",
        a: "Seat applications open when announced by the Provost Office. Log in to your Hall Portal, go to Seat Management → Apply for Seat, fill out the form, and upload required documents before the deadline."
      },
      {
        q: "What documents are required for hall registration?",
        a: "Typically: Student ID, recent passport-size photo, Department Chairman’s letter, last semester’s transcript, and a valid dope test report. Exact requirements will be shown in the application form."
      },
      {
        q: "How can I update my profile information?",
        a: "After login, open the profile menu → Profile. You can update fields such as mobile number, emergency contact, address, and upload a new photo. Some fields (ID, department) may be locked by admin."
      },
      {
        q: "Can I change my allocated room?",
        a: "Use the Swap Seat Request in the Hall Portal. Enter your current details and the target student’s details. The target student must accept, then the Provost reviews and approves or rejects the request."
      },
      {
        q: "What is the process for leaving the hall permanently?",
        a: "Submit a Cancel Seat Request in the Hall Portal with reason and any supporting documents (clearance, transfer/leave letters). Once approved by admin, your seat will be marked vacant."
      }
    ]
  },
  {
    key: "facilities",
    title: "Hall Facilities",
    items: [
      {
        q: "What facilities are available in the hall?",
        a: "Core amenities include Reading Room, Games Room, TV & Entertainment Room, Dining, Canteen, Lift, Water Purifiers, Garage, and standard Room Facilities (bed, table, chair, fan, power)."
      },
      {
        q: "Is Wi-Fi available in all rooms?",
        a: "Wi-Fi is provided in common areas and most residential floors. Coverage and speed may vary; please raise a complaint via the portal if you experience connectivity issues."
      },
      {
        q: "Are there separate reading rooms for boys and girls?",
        a: "Most halls provide common reading rooms. Where policy requires, dedicated quiet zones or separate areas are indicated on notice boards."
      },
      {
        q: "What are the canteen timings and menu options?",
        a: "The canteen typically operates 08:00–22:30 with tea, snacks, and quick meals. Weekly specials and price lists are posted on the notice board and in the Hall Portal."
      },
      {
        q: "Is there a laundry service available in the hall?",
        a: "If available, details (location, timings, charges) are listed on the notice board and Hall Portal. Otherwise, third-party services near campus can be used."
      }
    ]
  },
  {
    key: "support",
    title: "Support & Services",
    items: [
      {
        q: "Whom should I contact in case of a maintenance issue?",
        a: "Submit a complaint via the Complaint Box in the Hall Portal, selecting the appropriate category (room, water, electricity, sanitation). Urgent safety issues should be reported to staff on duty immediately."
      },
      {
        q: "How can I report a lost item or theft?",
        a: "Inform the hall office and security, then submit a written report. If required, file a general diary (GD) with the local police station. Provide all details such as place, time, and a description of the item."
      },
      {
        q: "What should I do if I am sick or need medical help?",
        a: "For non-emergency care, contact hall staff for guidance to the campus medical center. In emergencies, call the designated emergency number posted in the hall and inform the duty staff."
      },
      {
        q: "Is there 24/7 security in the hall?",
        a: "Yes. Entry/exit is monitored by security. Residents should carry valid ID and follow gate timings and visitor rules."
      }
    ]
  },
  {
    key: "payments",
    title: "Payments & Fines",
    items: [
      {
        q: "How do I pay hall rent or dining bills?",
        a: "Payments are typically made via the hall accounts office or university payment gateway. Check the latest instructions in the Hall Portal → Payments section."
      },
      {
        q: "Are there any fines for damage or misconduct?",
        a: "Yes. Fines may apply for property damage, policy violations, or misconduct as per hall regulations. Amounts and procedures are listed in the Hall Rules and communicated by the office."
      },
      {
        q: "How can I get a clearance certificate from the hall?",
        a: "After room handover and dues clearance, submit a clearance request at the hall office. Once verified, you will receive the clearance certificate for final university processing."
      }
    ]
  }
];
