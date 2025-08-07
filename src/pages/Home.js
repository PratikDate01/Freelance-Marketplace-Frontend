import React, { useState, useEffect } from 'react';
import { Search, Star, ChevronRight, Play, Users, Award, Clock, CheckCircle, Menu, X } from 'lucide-react';

const FreelanceHubHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const heroSlides = [
    {
      title: "Find the perfect freelance services for your business",
      subtitle: "Millions of people use FreelanceHub to turn their ideas into reality.",
      bg: "bg-gradient-to-r from-green-500 to-blue-600",
      image: "🎨"
    },
    {
      title: "The premium freelance solution for businesses",
      subtitle: "Connect with top talent and get work done faster.",
      bg: "bg-gradient-to-r from-purple-600 to-pink-600",
      image: "💼"
    },
    {
      title: "Get your business online with professional websites",
      subtitle: "Custom websites that convert visitors to customers.",
      bg: "bg-gradient-to-r from-orange-500 to-red-600",
      image: "🌐"
    }
  ];

  const categories = [
    { name: "Graphics & Design", icon: "🎨", jobs: "389,930" },
    { name: "Digital Marketing", icon: "📱", jobs: "234,567" },
    { name: "Writing & Translation", icon: "✍️", jobs: "198,432" },
    { name: "Video & Animation", icon: "🎬", jobs: "156,789" },
    { name: "Music & Audio", icon: "🎵", jobs: "89,123" },
    { name: "Programming & Tech", icon: "💻", jobs: "267,891" },
    { name: "Business", icon: "💼", jobs: "145,678" },
    { name: "Lifestyle", icon: "🌟", jobs: "78,456" }
  ];

  const popularServices = [
    {
      title: "I will design a modern logo for your business",
      seller: "designpro_x",
      rating: 4.9,
      reviews: 2847,
      price: 25,
      image: "🎯",
      level: "Level 2"
    },
    {
      title: "I will create a professional website for you",
      seller: "webmaster_dev",
      rating: 5.0,
      reviews: 1923,
      price: 75,
      image: "💻",
      level: "Top Rated"
    },
    {
      title: "I will write engaging content for your blog",
      seller: "content_queen",
      rating: 4.8,
      reviews: 3456,
      price: 15,
      image: "📝",
      level: "Level 1"
    },
    {
      title: "I will create stunning social media posts",
      seller: "social_genius",
      rating: 4.9,
      reviews: 1567,
      price: 20,
      image: "📱",
      level: "Level 2"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Startup Founder",
      content: "FreelanceHub has been instrumental in helping me launch my business. The quality of work is exceptional.",
      avatar: "👩‍💼",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Marketing Director",
      content: "Found amazing talent for our campaigns. The platform makes it so easy to find the right freelancers.",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "E-commerce Owner",
      content: "The designers on FreelanceHub helped transform my brand. Couldn't be happier with the results.",
      avatar: "👩‍🎨",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`${heroSlides[currentSlide].bg} transition-all duration-1000 ease-in-out`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 text-white">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-xl mb-8 opacity-90">
                  {heroSlides[currentSlide].subtitle}
                </p>
                
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search for any service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-4 rounded-md text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <button 
                    onClick={handleSearch}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-md font-semibold transition-colors flex items-center justify-center"
                  >
                    <Search className="mr-2" size={20} />
                    Search
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="text-white/80">Popular:</span>
                  {['Website Design', 'Logo Design', 'SEO', 'Architecture', 'Social Media'].map((tag) => (
                    <button key={tag} className="bg-white/20 text-white px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                <div className="text-8xl animate-bounce">
                  {heroSlides[currentSlide].image}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trusted by Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 mb-6">Trusted by:</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold">META</div>
            <div className="text-2xl font-bold">GOOGLE</div>
            <div className="text-2xl font-bold">NETFLIX</div>
            <div className="text-2xl font-bold">P&G</div>
            <div className="text-2xl font-bold">PAYPAL</div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular professional services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">{category.jobs} services available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <div className="text-6xl">{service.image}</div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {service.level}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{service.seller}</span>
                  </div>
                  <h3 className="font-medium mb-3 group-hover:text-green-600 transition-colors">
                    {service.title}
                  </h3>
                  <div className="flex items-center mb-3">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="ml-1 text-sm text-gray-600">
                      {service.rating} ({service.reviews})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">STARTING AT</span>
                    <span className="text-xl font-bold">${service.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FreelanceHub Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                A whole world of freelance talent at your fingertips
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">The best for every budget</h3>
                    <p className="text-gray-600">Find high-quality services at every price point. No hourly rates, just project-based pricing.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Quality work done quickly</h3>
                    <p className="text-gray-600">Find the right freelancer to begin working on your project within minutes.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Protected payments, every time</h3>
                    <p className="text-gray-600">Always know what you'll pay upfront. Your payment isn't released until you approve the work.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">24/7 support</h3>
                    <p className="text-gray-600">Find answers to your questions in our help center, or contact our customer support team.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-8 text-white">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
                <p className="mb-6">Join millions of entrepreneurs who trust FreelanceHub to get things done.</p>
                <button className="bg-white text-green-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What our customers say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Start your freelance journey today
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Whether you're looking to hire talented freelancers or showcase your own skills, FreelanceHub is the perfect platform to achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-md font-semibold hover:bg-gray-100 transition-colors text-lg">
              Hire Freelancers
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg">
              Become a Seller
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-5xl font-bold text-green-600 mb-2">4M+</div>
              <p className="text-gray-600 text-lg">Active Users</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">500K+</div>
              <p className="text-gray-600 text-lg">Projects Completed</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-purple-600 mb-2">99%</div>
              <p className="text-gray-600 text-lg">Customer Satisfaction</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-orange-600 mb-2">24/7</div>
              <p className="text-gray-600 text-lg">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-green-400 mb-4">FreelanceHub</div>
              <p className="text-gray-300 mb-4">The world's largest marketplace for creative and professional services.</p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span>📘</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span>🐦</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span>📷</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span>💼</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Categories</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Graphics & Design</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Digital Marketing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Writing & Translation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Video & Animation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Programming & Tech</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Services</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">About</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press & News</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partnerships</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intellectual Property</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help & Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Selling on FreelanceHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Buying on FreelanceHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Standards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 FreelanceHub International Ltd. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Settings</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Sitemap</a>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">🌍</span>
                <select className="bg-transparent text-gray-400 border-none outline-none">
                  <option>English</option>
                  <option>Español</option>
                  <option>Français</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">💰</span>
                <select className="bg-transparent text-gray-400 border-none outline-none">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FreelanceHubHomepage;