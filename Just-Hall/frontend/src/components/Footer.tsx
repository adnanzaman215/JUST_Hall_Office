// components/Footer.tsx
export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start">
                {/* Left Section: Address, Google Map, Social Media Icons */}
                <div className="flex flex-col md:w-1/2 space-y-4 relative">
                    <button className="bg-teal-400 text-black px-4 py-2 rounded-md font-semibold w-28 hover:bg-teal-500 transition">
                        Location
                    </button>
                    {/* Google Map Section */}
                    <div className="relative w-1/2 h-30 mt-2 md:h-48">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12694.853401337723!2d-79.3981850910747!3d43.66289045234444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zNDPCsDkxJzI4LjYiTiA3OcKwMjAnMzcgODYuN4zKOhOhFghoVVg5h%7Cimages%7Cinfo-f22%7Cms8ieGokv6nbJxa5q4X7pL!5e0!3m2!1spt-BR!2sbr!4v1633121760525"
                            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                        ></iframe>
                    </div>
                    <p className="text-gray-100">
                        Sadhinata Sarak, Churamonkati,{" "}<br />
                        <span className="font-bold text-teal-300">Jessore, 7408, Bangladesh.</span>
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex space-x-6 mt-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="w-6 h-6 hover:scale-110 transition" />
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/linkedin.svg" alt="LinkedIn" className="w-6 h-6 hover:scale-110 transition" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" alt="YouTube" className="w-6 h-6 hover:scale-110 transition" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg" alt="Instagram" className="w-6 h-6 hover:scale-110 transition" />
                    </div>
                </div>

                {/* Right Section: Quick Links, Related, Contact */}
                <div className="md:w-1/2 flex flex-col md:flex-row justify-between gap-10 mt-6 md:mt-0">
                    {/* Quick Links */}
                    <div className="space-y-3 w-full md:w-1/3">
                        <h4 className="font-semibold text-lg text-cyan-400">Quick Links</h4>
                        <ul className="space-y-1">
                            <li><a href="/about" className="hover:text-teal-300 transition">&gt; About Us</a></li>
                            <li><a href="/privacy-policy" className="hover:text-teal-300 transition">&gt; Privacy Policy</a></li>
                            <li><a href="/terms" className="hover:text-teal-300 transition">&gt; Terms & Conditions</a></li>
                            <li><a href="/contact" className="hover:text-teal-300 transition">&gt; Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Related (Hall Names) */}
                    <div className="space-y-3 w-full md:w-1/3">
                        <h4 className="font-semibold text-lg text-cyan-400">Related Links</h4>
                        <ul className="space-y-1">
                            <li><a href="/mm-hall" className="hover:text-teal-300 transition">&gt; MM Hall</a></li>
                            <li><a href="/smr-hall" className="hover:text-teal-300 transition">&gt; SMR Hall</a></li>
                            <li><a href="/tb-hall" className="hover:text-teal-300 transition">&gt; TB Hall</a></li>
                            <li><a href="/br-hall" className="hover:text-teal-300 transition">&gt; BR Hall</a></li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 w-full md:w-1/3">
                        <h4 className="font-semibold text-lg text-cyan-400">Contact</h4>
                        <p>Email: <a href="mailto:info@justhall.com" className="text-teal-300 hover:underline">info@justhall.com</a></p>
                        <p>Phone: <span className="text-gray-100">+123 456 7890</span></p>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="absolute right-0 mt-50 mr-12 w-full md:w-1/3">
                    <div className="md:w-1/2 mt-20 md:mt-0">
                        <h4 className="font-semibold text-lg text-cyan-400">Newsletter</h4>
                        <p className="text-gray-100">Subscribe to our newsletter for the latest updates.</p>
                        <form className="mt-4 flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                            <button
                                type="submit"
                                className="bg-teal-400 text-black px-4 py-2 rounded-r-md hover:bg-teal-500 transition"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="border-t border-gray-500 mt-8 pt-4 text-center text-gray-400">
                <p>&copy; 2025 JustHall. All Rights Reserved.</p>
            </div>
        </footer>
    );
}
