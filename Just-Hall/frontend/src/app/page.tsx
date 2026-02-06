"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const searchParams = useSearchParams();

  const { isSignupOpen, isLoginOpen, openLogin } = useUI();

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
  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // Function to handle the previous image in carousel
  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      goToNextImage();
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNextImage]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <main className="home-page" style={{ backgroundColor: "white", minHeight: "100vh" }}>
      {/* Registration Success Message */}
      {showRegistrationSuccess && (
        <div className="animate-slideDown" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '600px',
          width: '90%',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>✓</div>
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
                  fontWeight: '600',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
              fontSize: '24px',
              cursor: 'pointer',
              marginLeft: 'auto',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ×
          </button>
        </div>
      )}

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Image Carousel */}
          <div 
            className="relative mx-auto max-w-6xl mb-16"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={images[currentImageIndex]}
                alt={`Overview Image ${currentImageIndex + 1}`}
                fill
                priority
                className="object-cover transition-opacity duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Navigation Buttons */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <button 
                  onClick={goToPrevImage}
                  className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={goToNextImage}
                  className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  </button>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              Welcome<br/> 
              to<br/> 
              Munshi Meherullah Hall
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto mb-8 rounded-full" />
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
              Munshi Meherullah Hall is a premier male student dormitory at the Jashore University
              of Science and Technology (JUST), named after the distinguished scholar Munshi Mohammad
              Meherullah. Our facility provides a safe, modern, and conducive environment
              for students to live, learn, and thrive in their academic journey.
            </p>
          </div>
        </div>
      </section>

      {/* Hall Portal Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Hall Management Portal
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Access comprehensive services and manage your hall experience seamlessly
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {hallPortalData.map((card, index) => (
              <div 
                key={card.name}
                className="transform transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Hall_PortalCard
                  name={card.name}
                  icon={card.icon}
                  blurb={card.blurb}
                  details={card.details}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Why Choose Our Hall?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience excellence in student accommodation with our comprehensive facilities
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6">
                <div className="text-4xl">🏠</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Modern Facilities</h3>
              <p className="text-slate-600 leading-relaxed">State-of-the-art amenities for comfortable living</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-6">
                <div className="text-4xl">🔒</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Security</h3>
              <p className="text-slate-600 leading-relaxed">Round-the-clock security for peace of mind</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-6">
                <div className="text-4xl">🍽️</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dining Services</h3>
              <p className="text-slate-600 leading-relaxed">Nutritious meals and flexible dining options</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-6">
                <div className="text-4xl">📚</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Study Spaces</h3>
              <p className="text-slate-600 leading-relaxed">Quiet areas designed for academic success</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
