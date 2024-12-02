import React from 'react';
import { Book, Pencil, Users, Award, Target, BookOpen, GraduationCap, Share2 } from 'lucide-react';

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Stephen Joshua Alviar",
      role: "Lead Developer",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Rafael Sugabo",
      role: "Documentation Specialist",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Janrico Tabuyo",
      role: "",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Gerome Ullero",
      role: "",
      image: "/api/placeholder/150/150"
    }
  ];

  const values = [
    {
      icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
      title: "Academic Excellence",
      description: "Supporting scholarly growth through quality academic publications"
    },
    {
      icon: <Share2 className="w-6 h-6 text-blue-600" />,
      title: "Knowledge Sharing",
      description: "Creating a platform for students and writers to share their research and ideas"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      title: "Open Access",
      description: "Making published content accessible to everyone in the community"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">PubShark</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          PubShark is a dedicated online publication system designed to empower students, researchers, and writers in sharing their academic work with the world. We provide a streamlined platform for publishing research papers, academic articles, theses, and scholarly works. Our goal is to bridge the gap between academic excellence and accessible publishing, making it easier for emerging scholars to contribute to their fields of study.
        </p>
      </div>

      {/* Values Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {values.map((value, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="mb-4 flex justify-center">
              {value.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
            <p className="text-gray-600">{value.description}</p>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Book className="w-6 h-6 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Academic Publishing</h3>
            <p className="text-gray-600">
              Submit and publish your research papers, theses, and academic articles with ease. Our platform supports various academic formats and citation styles.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Pencil className="w-6 h-6 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Review System</h3>
            <p className="text-gray-600">
              Benefit from our peer review system that ensures quality and provides valuable feedback on your work before publication.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Development Team</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;