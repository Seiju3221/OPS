import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Youtube
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Programming Team",
      links: [
        { name: "About Us", path: "/about-us" },
        { name: "Contact Us", path: "/contact-us" },
        { name: "Terms of Service", path: "/terms-of-service" },
        { name: "Privacy Policy", path: "/privacy-policy" }
      ]
    },
  ];

  const socialLinks = [
    { icon: Facebook, path: "https://www.facebook.com/UNPTheOfficial", label: "Facebook" },
    { icon: Twitter, path: "https://x.com/theOfficialUNP", label: "Twitter" },
    { icon: Instagram, path: "https://www.instagram.com/theofficialunp/", label: "Instagram" },
    { icon: Youtube, path: "https://www.youtube.com/channel/UCIBsig4v11yNvB-PjFubHTg", label: "Youtube" }
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="pubshark_logo.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain"
              />
              <div className="hidden sm:block font-bold text-2xl text-blue-900">
                Pub<span className="text-yellow-500">Shark</span>
              </div>
            </Link>
            <p className="text-sm">
              Your trusted source for publishing and sharing knowledge for the University of Northern Philippines.
            </p>
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">contact@pubshark.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">123 Publishing St, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-blue-800">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.path}
                      className="text-black hover:text-gray-600 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-blue-800">Stay Updated</h3>
            <p className="text-sm">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-green-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-1 text-sm">
              <span>© {currentYear} PubShark. Made with</span>
              <Heart className="w-4 h-4 text-red-500 inline" />
              <span>for the community</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-700 hover:text-blue-400 hover:bg-green-100 rounded-full transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;