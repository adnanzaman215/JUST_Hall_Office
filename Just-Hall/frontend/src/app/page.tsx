"use client";  // Ensure this is a client component

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUI } from "@/context/ui-store";
import { useSearchParams } from "next/navigation";
import Hall_PortalCard from "@/components/Hall-PortalCard";

const hallPortalData = [
  {
    name: "Account Management",
    icon: "/account-management.png", // Image path in public folder
    blurb: "Information for all students will be provided in this section.",
    details: ["Students can manage account details", "Admins can view user data"],
  },
  {
    name: "Seat Management",
    icon: "/seat-management.jpg", // Image path in public folder
    blurb: "Students (apply, swap, cancel). Admin (Assign, view details, manage swap).",
    details: ["Students can apply or swap seats", "Admin can manage seat allocations"],
  },
  {
    name: "Dining Management",
    icon: "/dining-management.png", // Image path in public folder
    blurb: "Students (view menu, buy and cancel token). Staff (update menu, meal count).",
    details: ["Students can view menu", "Staff can manage meal token count"],
  },
];


const HomePage = () => {
  const images = [
    "/Overview_image_1.jpg", // Image 1
    "/Overview_image_2.jpg", // Image 2
    "/Overview_image_3.jpg", // Image 3
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const searchParams = useSearchParams();

  const { isSignupOpen, isLoginOpen, openLogin } = useUI();
  
  console.log("🏠 Home render - Signup:", isSignupOpen, "Login:", isLoginOpen);

  // Check for registration completion
  useEffect(() => {
    const registrationComplete = searchParams.get('registration');
    if (registrationComplete === 'complete') {
      setShowRegistrationSuccess(true);
      // Hide the message after 10 seconds
      setTimeout(() => {
        setShowRegistrationSuccess(false);
      }, 10000);
    }
  }, [searchParams]);

  // Function to handle the next image in carousel
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Function to handle the previous image in carousel
  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <main className="home-page" style={{ backgroundColor: "white", minHeight: "100vh" }}>
      {/* Registration Success Message */}
      {showRegistrationSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{ fontSize: '24px' }}>✓</div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '18px' }}>
              Profile Registration Complete
            </div>
            <div style={{ fontSize: '15px', opacity: 0.95, lineHeight: '1.5' }}>
              Welcome to the hall management system! Your account has been successfully created and verified. You can now{' '}
              <button 
                onClick={openLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                sign in here
              </button>
              {' '}to access all available hall services, facilities, and features.
            </div>
          </div>
          <button
            onClick={() => setShowRegistrationSuccess(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Image Carousel Section */}
      <section className="carousel-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
        <div className="image-carousel" style={{ width: "80%", maxWidth: "1000px", position: "relative" }}>
          <Image
            src={images[currentImageIndex]}
            alt={`Overview Image ${currentImageIndex + 1}`}
            width={1000}  // Fixed width for the image
            height={600}  // Fixed height for the image
            objectFit="cover" // Maintain aspect ratio and cover the area
            className="carousel-img"
            style={{ borderRadius: "10px", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)" }}
          />
          {/* Carousel Navigation */}
          <div className="carousel-buttons" style={{ position: "absolute", top: "50%", width: "100%", display: "flex", justifyContent: "space-between" }}>
            <button className="prev-btn" onClick={goToPrevImage} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", color: "white", border: "none", padding: "10px", fontSize: "24px", cursor: "pointer" }}>
              &lt;
            </button>
            <button className="next-btn" onClick={goToNextImage} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", color: "white", border: "none", padding: "10px", fontSize: "24px", cursor: "pointer" }}>
              &gt;
            </button>
          </div>
        </div>
        <div className="overview" style={{ paddingTop: "20px", textAlign: "center", width: "80%", maxWidth: "1000px", color: "#333" }}>
          <h2 style={{ fontSize: "2.5em", fontWeight: "bold", marginBottom: "10px" }}>Overview</h2>
          <p style={{ fontSize: "1.2em", color: "#333" }}>
            Munshi Meherullah Hall is a male student dormitory at the University
            of Science and Technology (JUST), named after Munshi Mohammad
            Meherullah. This facility provides a safe and conducive environment
            for students to live and study.
          </p>
        </div>
      </section>

      {/* Other sections (can be added similarly) */}
      {/* Hall Portal Section */}
      <section className="hall-portal" style={{ padding: "40px 20px", textAlign: "left", color: "#333", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ fontSize: "2.5em", fontWeight: "bold", marginBottom: "20px" }}>Hall Portal</h2>
        <div className="portal-cards" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
          {hallPortalData.map((card) => (
            <Hall_PortalCard
              key={card.name}
              name={card.name}
              icon={card.icon}
              blurb={card.blurb}
              details={card.details}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
