import React from 'react';
import { Scale, FileText, AlertCircle, Clock, UserCheck, Flag, Ban, MessageSquare } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: November 16, 2024</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to PubIT. By accessing or using our online publication system, you agree 
                to be bound by these Terms of Service. Please read these terms carefully before 
                using our services. If you disagree with any part of these terms, you may not 
                access or use our system.
              </p>
            </section>

            {/* Account Terms */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <UserCheck className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Terms</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>By creating an account, you agree to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Provide accurate and complete registration information</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Promptly update any changes to your information</li>
                      <li>Accept responsibility for all activities under your account</li>
                      <li>Be affiliated with a recognized academic or research institution</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Submission Guidelines */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Submission Guidelines</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>All submissions must:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Be original and not previously published elsewhere</li>
                      <li>Comply with academic integrity and ethical standards</li>
                      <li>Include proper citations and references</li>
                      <li>Be free from plagiarism and copyright infringement</li>
                      <li>Follow our formatting and submission requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Peer Review Process */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Peer Review Process</h2>
                  <p className="text-gray-600 leading-relaxed">
                    By submitting to our system, you agree to participate in our peer review process. 
                    This includes accepting reviewer feedback, making requested revisions, and 
                    maintaining confidentiality throughout the review process.
                  </p>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Ban className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>Users are prohibited from:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Submitting fraudulent or plagiarized content</li>
                      <li>Manipulating the peer review process</li>
                      <li>Harassing other users or staff</li>
                      <li>Attempting to breach system security</li>
                      <li>Using the system for commercial purposes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Flag className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Authors retain copyright of their work while granting PubIT the right to 
                    publish and distribute their submissions. All published content is subject 
                    to our chosen Creative Commons license terms.
                  </p>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We reserve the right to terminate or suspend access to our service immediately, 
                    without prior notice or liability, for any reason whatsoever, including without 
                    limitation if you breach the Terms of Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We reserve the right to modify or replace these terms at any time. We will 
                    provide notice of any changes by posting the new Terms of Service on this page 
                    and updating the "Last updated" date.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-xl p-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>Email: legal@pubit.unp.edu.ph</li>
                <li>Address: University of Northern Philippines, Vigan City, Ilocos Sur</li>
                <li>Phone: (077) 722-2810</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;