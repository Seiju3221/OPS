import React from 'react';
import { Shield, Lock, Eye, Database, Bell, Share2, Cookie, KeyRound } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: November 16, 2024</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                PubIT ("we", "our", or "us") is committed to protecting the privacy of our users. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our online publication system. Please read this privacy policy carefully. 
                If you disagree with its terms, please discontinue use of our system immediately.
              </p>
            </section>

            {/* Information Collection */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Database className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Personal identification information (name, email address, institutional affiliation)</li>
                      <li>Academic credentials and research interests</li>
                      <li>Submitted research papers and publications</li>
                      <li>Peer review comments and feedback</li>
                      <li>Account preferences and settings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Eye className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We use the collected information for the following purposes:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Facilitate the peer review process</li>
                      <li>Maintain and improve our publication system</li>
                      <li>Send notifications about submission status and updates</li>
                      <li>Analyze usage patterns to enhance user experience</li>
                      <li>Prevent fraud and ensure system security</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Share2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>We may share your information with:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Peer reviewers (anonymized as per double-blind review process)</li>
                      <li>Journal editors and editorial board members</li>
                      <li>Service providers who assist in our operations</li>
                      <li>Legal authorities when required by law</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect 
                    your personal information. However, no electronic transmission over the internet 
                    or information storage technology can be guaranteed to be 100% secure.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Cookie className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We use cookies and similar tracking technologies to track activity on our system 
                    and hold certain information. You can instruct your browser to refuse all cookies 
                    or to indicate when a cookie is being sent.
                  </p>
                </div>
              </div>
            </section>

            {/* User Rights */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <KeyRound className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate or incomplete information</li>
                      <li>Request deletion of your information</li>
                      <li>Object to our processing of your information</li>
                      <li>Receive a copy of your information in a structured format</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <Bell className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We may update this privacy policy from time to time. We will notify you of any 
                    changes by posting the new policy on this page and updating the "Last updated" date.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 rounded-xl p-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>Email: privacy@pubit.unp.edu.ph</li>
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

export default PrivacyPolicy;