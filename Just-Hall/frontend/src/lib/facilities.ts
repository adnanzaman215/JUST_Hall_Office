// src/lib/facilities.ts
export type Facility = {
  key: string;
  name: string;
  icon: string;     // emoji icon to avoid extra deps
  blurb: string;
  details?: string[];
};

export const facilities: Facility[] = [
  {
    key: "overview",
    name: "Hall Facilities Overview",
    icon: "🏫",
    blurb: "Snapshot of all amenities available to residents.",
    details: [
      "Reading Room, Games Room, TV & Entertainment",
      "Dining & Canteen",
      "Lift, Water Purifier, Garage",
      "Room Facilities (bed, table, fan, power)"
    ]
  },
  {
    key: "reading-room",
    name: "Reading Room",
    icon: "📚",
    blurb: "Quiet, well-lit study space for focused work.",
    details: ["Spacious desks & seating", "Wi-Fi enabled", "Open 7:00–23:00"]
  },
  {
    key: "games-room",
    name: "Games Room",
    icon: "🎮",
    blurb: "Recreation space to relax and socialize.",
    details: ["Carrom, Chess, Table Tennis", "Community tournaments"]
  },
  {
    key: "tv-room",
    name: "TV & Entertainment Room",
    icon: "📺",
    blurb: "Large screen for news, sports & events.",
    details: ["Scheduled shows & match screenings"]
  },
  {
    key: "dining",
    name: "Dining",
    icon: "🍽️",
    blurb: "Nutritious meals served at fixed times.",
    details: ["Breakfast, Lunch, Dinner", "Weekly rotating menu"]
  },
  {
    key: "canteen",
    name: "Canteen",
    icon: "☕",
    blurb: "Snacks, tea & quick bites throughout the day.",
    details: ["Affordable pricing", "Open till late evening"]
  },
  {
    key: "lift",
    name: "Lift",
    icon: "🛗",
    blurb: "Elevator access for easier mobility.",
    details: ["Regular maintenance & safety checks"]
  },
  {
    key: "water-purifier",
    name: "Water Purifier",
    icon: "🚰",
    blurb: "Safe drinking water on every floor.",
    details: ["RO/UV treated", "Scheduled filter changes"]
  },
  {
    key: "garage",
    name: "Garage",
    icon: "🅿️",
    blurb: "Designated parking for cycles/motorbikes.",
    details: ["Permit required", "Security supervision"]
  },
  {
    key: "room-facilities",
    name: "Room Facilities",
    icon: "🛏️",
    blurb: "Essentials provided in each room.",
    details: ["Bed, Table, Chair, Fan", "Power sockets & lighting"]
  }
];
