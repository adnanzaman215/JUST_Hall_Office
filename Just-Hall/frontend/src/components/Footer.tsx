// components/Footer.tsx
export default function Footer() {
    return (
        <footer className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-gray-300 border-t border-gray-800">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"></div>
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* Location & Contact Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <div className="h-8 w-1 bg-gradient-to-b from-teal-400 to-cyan-600 rounded-full"></div>
                                    Our Location
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-300">
                                            Sadhinata Sarak, Churamonkati<br />
                                            <span className="font-semibold text-teal-300">Jessore, 7408, Bangladesh</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a href="mailto:info@justhall.com" className="text-sm text-gray-300 hover:text-teal-300 transition">info@justhall.com</a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-sm text-gray-300">+123 456 7890</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Social Media Icons */}
                            <div>
                                <h5 className="text-sm font-semibold text-white mb-3">Connect With Us</h5>
                                <div className="flex gap-4">
                                    <a href="#" className="group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/50">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                        </div>
                                    </a>
                                    <a href="#" className="group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-cyan-600 hover:to-blue-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/50">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                            </svg>
                                        </div>
                                    </a>
                                    <a href="#" className="group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-500/50">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                            </svg>
                                        </div>
                                    </a>
                                    <a href="#" className="group">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-pink-600 hover:to-purple-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/50">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="h-8 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
                                Quick Links
                            </h4>
                            <ul className="space-y-2.5">
                                <li><a href="/about" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full group-hover:w-3 transition-all"></span>
                                    About Us
                                </a></li>
                                <li><a href="/privacy-policy" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full group-hover:w-3 transition-all"></span>
                                    Privacy Policy
                                </a></li>
                                <li><a href="/terms" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full group-hover:w-3 transition-all"></span>
                                    Terms & Conditions
                                </a></li>
                                <li><a href="/contact" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full group-hover:w-3 transition-all"></span>
                                    Contact Us
                                </a></li>
                            </ul>
                        </div>

                        {/* Related Halls */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"></div>
                                Other Halls
                            </h4>
                            <ul className="space-y-2.5">
                                <li><a href="/mm-hall" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:w-3 transition-all"></span>
                                    MM Hall
                                </a></li>
                                <li><a href="/smr-hall" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:w-3 transition-all"></span>
                                    SMR Hall
                                </a></li>
                                <li><a href="/tb-hall" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:w-3 transition-all"></span>
                                    TB Hall
                                </a></li>
                                <li><a href="/br-hall" className="text-sm text-gray-300 hover:text-cyan-300 transition flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:w-3 transition-all"></span>
                                    BR Hall
                                </a></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="lg:col-span-1 space-y-4">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full"></div>
                                Newsletter
                            </h4>
                            <p className="text-sm text-gray-300">Subscribe for the latest updates and announcements.</p>
                            <form className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-2.5 text-sm bg-gray-800 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-lg shadow-lg hover:shadow-teal-500/50 transition-all duration-300 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Google Map Section */}
                    <div className="mt-10">
                        <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12694.853401337723!2d-79.3981850910747!3d43.66289045234444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zNDPCsDkxJzI4LjYiTiA3OcKwMjAnMzcgODYuN4zKOhOhFghoVVg5h%7Cimages%7Cinfo-f22%7Cms8ieGokv6nbJxa5q4X7pL!5e0!3m2!1spt-BR!2sbr!4v1633121760525"
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy"
                                className="grayscale hover:grayscale-0 transition-all duration-500"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="border-t border-gray-800 mt-12 py-6 bg-gradient-to-r from-slate-950 via-gray-950 to-slate-950">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            &copy; 2025 <span className="font-semibold text-teal-400">JustHall</span>. All Rights Reserved.
                        </p>
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                            <span>Designed with <span className="text-red-500">❤</span> for JUST Community</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
