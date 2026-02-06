-- Insert sample notices for testing
-- Run this SQL script against the justhall database

-- Sample Notice 1: General
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Welcome to JUST Hall Notice Board',
    'Dear Students, Welcome to the official notice board for JUST Hall. All important announcements, circulars, and updates will be posted here. Please check regularly for updates regarding hall activities, seat allocations, fee notices, and other important information.',
    'General',
    'Hall Provost',
    1,
    'https://example.com/welcome-guide.pdf',
    DATE_ADD(NOW(), INTERVAL 90 DAY),
    NOW(),
    NOW()
);

-- Sample Notice 2: Seat Allocation
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Seat Allocation for Session 2025-26',
    'The seat allocation process for the academic session 2025-26 will commence from February 15, 2026. All eligible students are requested to complete their applications through the hall portal. Required documents: Student ID, Admission letter, Previous semester results, and Payment receipt.',
    'Seat Allocation',
    'Seat Allocation Committee',
    1,
    'https://example.com/seat-allocation-guidelines.pdf',
    '2026-03-01',
    NOW(),
    NOW()
);

-- Sample Notice 3: Fee Notice
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Hall Fee Payment Deadline - February 2026',
    'All residents are hereby notified that the hall fee for February 2026 must be paid by February 20, 2026. Late payment will incur a penalty of 500 BDT. Payment can be made at the hall office or through online banking. Please collect your receipt after payment.',
    'Fee Notice',
    'Hall Administration',
    0,
    'https://example.com/fee-structure.pdf',
    '2026-02-20',
    NOW(),
    NOW()
);

-- Sample Notice 4: Emergency
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Emergency Contact Numbers Updated',
    'Emergency contact numbers have been updated. For any emergency, please contact: Hall Security: 01700-000000, Hall Provost: 01700-111111, Medical Emergency: 999, Fire Service: 01700-222222. Save these numbers in your phone immediately.',
    'Emergency',
    'Hall Security',
    1,
    NULL,
    NULL,
    NOW(),
    NOW()
);

-- Sample Notice 5: Event
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Cultural Night 2026 - Call for Participants',
    'The annual Cultural Night will be held on March 15, 2026, at 6:00 PM in the hall auditorium. We invite all talented students to participate in singing, dancing, drama, and poetry recitation. Interested students please register by March 1, 2026, at the hall office.',
    'Event',
    'Cultural Committee',
    0,
    'https://example.com/cultural-night-2026.pdf',
    '2026-03-01',
    NOW(),
    NOW()
);

-- Sample Notice 6: Maintenance
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Water Supply Interruption - February 10',
    'Due to pipeline maintenance work, water supply will be interrupted on February 10, 2026, from 9:00 AM to 3:00 PM. Residents are requested to store adequate water in advance. We apologize for the inconvenience.',
    'Maintenance',
    'Maintenance Department',
    0,
    NULL,
    '2026-02-10',
    NOW(),
    NOW()
);

-- Sample Notice 7: Circular
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Covid-19 Safety Guidelines - Updated',
    'In light of recent health advisories, all residents must follow updated Covid-19 safety guidelines: 1) Wear masks in common areas, 2) Maintain social distancing, 3) Sanitize hands regularly, 4) Report any symptoms immediately to the hall medical officer. Violation of these rules will result in disciplinary action.',
    'Circular',
    'Health & Safety Committee',
    0,
    'https://example.com/covid-guidelines-2026.pdf',
    NULL,
    NOW(),
    NOW()
);

-- Sample Notice 8: General
INSERT INTO notices_notice (title, body, category, author, pinned, attachment_url, expires_on, created_at, updated_at)
VALUES (
    'Library Timing Update',
    'The hall library will now remain open from 8:00 AM to 10:00 PM on all days including weekends. Students can access reference books, journals, and study space during these hours. Please maintain silence and follow library rules.',
    'General',
    'Library Committee',
    0,
    NULL,
    NULL,
    NOW(),
    NOW()
);

SELECT 'Sample notices inserted successfully!' as message;
