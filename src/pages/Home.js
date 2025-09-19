import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ChevronRight, Play, Users, Award, Clock, CheckCircle, Menu, X, ArrowRight } from 'lucide-react';
import axios from '../config/axios';
import Footer from '../components/Footer';
import { formatPrice } from '../utils/currency';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredGigs, setFeaturedGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    {
      title: "Find the perfect freelance services for your business",
      subtitle: "Millions of people use CodeHire to turn their ideas into reality.",
      bg: "bg-gradient-to-r from-green-500 to-blue-600",
      image: "🎨",
      cta: "Get Started Today"
    },
    {
      title: "The premium freelance solution for businesses",
      subtitle: "Connect with top talent and get work done faster than ever.",
      bg: "bg-gradient-to-r from-purple-600 to-pink-600",
      image: "💼",
      cta: "Find Talent Now"
    },
    {
      title: "Get your business online with professional websites",
      subtitle: "Custom websites that convert visitors to customers.",
      bg: "bg-gradient-to-r from-orange-500 to-red-600",
      image: "🌐",
      cta: "Start Building"
    }
  ];

  const categories = [
    { name: "Graphics & Design", icon: "🎨", path: "graphics-design" },
    { name: "Digital Marketing", icon: "📱", path: "digital-marketing" },
    { name: "Writing & Translation", icon: "✍️", path: "writing-translation" },
    { name: "Video & Animation", icon: "🎬", path: "video-animation" },
    { name: "Music & Audio", icon: "🎵", path: "music-audio" },
    { name: "Programming & Tech", icon: "💻", path: "programming-tech" },
    { name: "Business", icon: "💼", path: "business" },
    { name: "AI Services", icon: "🤖", path: "ai-services" }
  ];

  const popularSearches = [
    'Website Design', 'Logo Design', 'SEO', 'WordPress', 'Voice Over', 
    'Social Media', 'Article Writing', 'Translation', 'Data Entry', 'Book Covers'
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Startup Founder",
      content: "CodeHire has been instrumental in helping me launch my business. The quality of work is exceptional and the platform is incredibly user-friendly.",
      avatar: "👩‍💼",
      rating: 5,
      company: "TechStart Inc."
    },
    {
      name: "Michael Chen",
      role: "Marketing Director", 
      content: "Found amazing talent for our campaigns. The platform makes it so easy to find the right freelancers with verified skills and portfolios.",
      avatar: "👨‍💻",
      rating: 5,
      company: "Digital Solutions"
    },
    {
      name: "Emma Davis",
      role: "E-commerce Owner",
      content: "The designers on CodeHire helped transform my brand completely. Professional work delivered on time, every time.",
      avatar: "👩‍🎨",
      rating: 5,
      company: "StyleCraft"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchFeaturedGigs();
  }, []);

  const fetchFeaturedGigs = async () => {
    try {
      const response = await axios.get('/api/gigs');
      // Handle pagination response format
      let gigs = [];
      if (response.data && response.data.gigs) {
        gigs = response.data.gigs;
      } else if (Array.isArray(response.data)) {
        gigs = response.data;
      }
      setFeaturedGigs(gigs.slice(0, 8)); // Get first 8 gigs
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setFeaturedGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/client/browse-gigs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/client/browse-gigs');
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/client/browse-gigs?category=${encodeURIComponent(category.name)}`);
  };

  const handleGigClick = (gig) => {
    navigate(`/client/gig/${gig._id}`);
  };

  const handlePopularSearch = (term) => {
    setSearchQuery(term);
    navigate(`/client/browse-gigs?search=${encodeURIComponent(term)}`);
  };

  const formatGigPrice = (price) => {
    return formatPrice(price);
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                    />
                  </div>
                  <button 
                    onClick={handleSearch}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg"
                  >
                    <Search className="mr-2" size={20} />
                    Search
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="text-white/80">Popular:</span>
                  {popularSearches.slice(0, 5).map((tag) => (
                    <button 
                      key={tag} 
                      onClick={() => handlePopularSearch(tag)}
                      className="bg-white/20 text-white px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-colors"
                    >
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
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 mb-6 font-medium">Trusted by:</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-gray-700">META</div>
            <div className="text-2xl font-bold text-gray-700">GOOGLE</div>
            <div className="text-2xl font-bold text-gray-700">NETFLIX</div>
            <div className="text-2xl font-bold text-gray-700">PAYPAL</div>
            <div className="text-2xl font-bold text-gray-700">MICROSOFT</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">4M+</div>
              <p className="text-gray-600 font-medium">Active Buyers</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">1.2M+</div>
              <p className="text-gray-600 font-medium">Active Sellers</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">100M+</div>
              <p className="text-gray-600 font-medium">Orders Completed</p>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform">200+</div>
              <p className="text-gray-600 font-medium">Countries Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Popular professional services</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Explore our most in-demand categories</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 hover:border-green-300">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <div className="flex items-center text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Explore</span>
                    <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Featured services</h2>
              <p className="text-gray-600 text-lg">Hand-picked by our team</p>
            </div>
            <button 
              onClick={() => navigate('/client/browse-gigs')}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center"
            >
              View All
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGigs.map((gig, index) => (
                <div 
                  key={gig._id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleGigClick(gig)}
                >
                  <div className="relative">
                    <img
                      src={gig.image || `https://picsum.photos/400/300?random=${index}`}
                      alt={gig.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <img
                        src={gig.sellerId?.avatar || `https://ui-avatars.com/api/?name=${gig.sellerId?.name}&background=random`}
                        alt={gig.sellerId?.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-600 font-medium">{gig.sellerId?.name}</span>
                    </div>
                    <h3 className="font-semibold mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {gig.title}
                    </h3>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="ml-1 text-sm text-gray-600 font-medium">
                          {gig.rating || '5.0'} ({gig.reviews?.length || Math.floor(Math.random() * 100) + 10})
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">STARTING AT</span>
                      <span className="text-xl font-bold text-gray-900">{formatGigPrice(gig.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 leading-tight">
                A whole world of freelance talent at your fingertips
              </h2>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3">The best for every budget</h3>
                    <p className="text-gray-600 text-lg">Find high-quality services at every price point. No hourly rates, just project-based pricing.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                    <Clock className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3">Quality work done quickly</h3>
                    <p className="text-gray-600 text-lg">Find the right freelancer to begin working on your project within minutes.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                    <Award className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3">Protected payments, every time</h3>
                    <p className="text-gray-600 text-lg">Always know what you'll pay upfront. Your payment isn't released until you approve the work.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3">24/7 support</h3>
                    <p className="text-gray-600 text-lg">Find answers to your questions in our help center, or contact our customer support team.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-10 text-white shadow-2xl">
                <div className="text-7xl mb-6">🚀</div>
                <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
                <p className="mb-8 text-lg opacity-90">Join millions of entrepreneurs who trust CodeHire to get things done.</p>
                <button 
                  onClick={() => navigate('/client/browse-gigs')}
                  className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
                >
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
          <h2 className="text-4xl font-bold text-center mb-4">What our customers say</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Real stories from real customers</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-green-600 text-sm font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Freelance services at your fingertips!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join our community of millions and get your project done today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/client/browse-gigs')}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
            >
              Browse Services
            </button>
            <button 
              onClick={() => navigate('/freelancer/dashboard')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-green-600 transition-colors text-lg"
            >
              Become a Seller
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;