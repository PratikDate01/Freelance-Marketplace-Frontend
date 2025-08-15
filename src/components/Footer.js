import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Categories",
      links: [
        { name: "Graphics & Design", href: "/client/browse-gigs?category=Graphics & Design" },
        { name: "Digital Marketing", href: "/client/browse-gigs?category=Digital Marketing" },
        { name: "Writing & Translation", href: "/client/browse-gigs?category=Writing & Translation" },
        { name: "Video & Animation", href: "/client/browse-gigs?category=Video & Animation" },
        { name: "Music & Audio", href: "/client/browse-gigs?category=Music & Audio" },
        { name: "Programming & Tech", href: "/client/browse-gigs?category=Programming & Tech" },
        { name: "Business", href: "/client/browse-gigs?category=Business" },
        { name: "AI Services", href: "/client/browse-gigs?category=AI Services" }
      ]
    },
    {
      title: "About",
      links: [
        { name: "Careers", href: "/careers" },
        { name: "Press & News", href: "/press" },
        { name: "Partnerships", href: "/partnerships" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Intellectual Property Claims", href: "/ip-claims" },
        { name: "Investor Relations", href: "/investors" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help & Support", href: "/help" },
        { name: "Trust & Safety", href: "/trust-safety" },
        { name: "Selling on CodeHire", href: "/selling-guide" },
        { name: "Buying on CodeHire", href: "/buying-guide" },
        { name: "CodeHire Guides", href: "/guides" },
        { name: "CodeHire Workspace", href: "/workspace" },
        { name: "Invoice", href: "/invoice" }
      ]
    },
    {
      title: "Community",
      links: [
        { name: "Customer Success Stories", href: "/success-stories" },
        { name: "Community Hub", href: "/community" },
        { name: "Forum", href: "/forum" },
        { name: "Events", href: "/events" },
        { name: "Blog", href: "/blog" },
        { name: "Influencers", href: "/influencers" },
        { name: "Affiliates", href: "/affiliates" },
        { name: "Podcast", href: "/podcast" }
      ]
    },
    {
      title: "More From CodeHire",
      links: [
        { name: "CodeHire Business", href: "/business" },
        { name: "CodeHire Pro", href: "/pro" },
        { name: "CodeHire Logo Maker", href: "/logo-maker" },
        { name: "CodeHire Guides", href: "/guides" },
        { name: "Get Inspired", href: "/inspiration" },
        { name: "CodeHire Select", href: "/select" },
        { name: "ClearVoice", href: "/clearvoice" },
        { name: "CodeHire Workspace", href: "/workspace" },
        { name: "Learn", href: "/learn" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.href} 
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h3>
              <p className="text-gray-300 mb-6">Get the latest updates on new features, offers, and freelance tips.</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center">
                  <Mail size={18} className="mr-2" />
                  Subscribe
                </button>
              </div>
            </div>
            
            <div className="lg:text-right">
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <div className="flex lg:justify-end gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="text-2xl font-bold text-green-500 mr-4">CodeHire</div>
              <p className="text-gray-400 text-sm">
                © {currentYear} CodeHire International Ltd. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <img src="/api/placeholder/24/16" alt="English" className="w-6 h-4" />
                <span className="text-sm text-gray-300">English</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">$ USD</span>
              </div>
              <button className="text-sm text-gray-300 hover:text-white transition-colors">
                🌐 Accessibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;