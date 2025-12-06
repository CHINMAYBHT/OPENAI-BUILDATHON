import React, { useEffect } from 'react';
import { Shield, FileText, Lock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Legal = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#privacy') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Legal <span className="gradient-text">Information</span>
          </h1>
          <p className="text-xl text-gray-600">
            Your privacy and security are our top priorities
          </p>
        </div>

        {/* Privacy Section */}
        <section id="privacy" className="mb-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Privacy Policy</h2>
          </div>
          <div className="space-y-4 text-gray-600">
            <p>
              At Job Builder, we are committed to protecting your privacy and ensuring the security of your personal information.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Information We Collect</h3>
            <p>
              We collect information you provide directly to us, including your name, email address, resume details, and career preferences. We also collect usage data to improve our services.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">How We Use Your Information</h3>
            <p>
              Your information is used to provide personalized career services, including AI-powered resume building, interview preparation, and job matching. We never sell your personal data to third parties.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Data Security</h3>
            <p>
              We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.
            </p>
          </div>
        </section>

        {/* Terms Section */}
        <section id="terms" className="mb-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Terms of Service</h2>
          </div>
          <div className="space-y-4 text-gray-600">
            <p>
              By using Job Builder, you agree to comply with and be bound by the following terms and conditions.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">User Responsibilities</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Service Usage</h3>
            <p>
              Our services are provided "as is" for career development purposes. You may not use our platform for any illegal or unauthorized purpose.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Intellectual Property</h3>
            <p>
              All content, features, and functionality on Job Builder are owned by us and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <Lock className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Security</h2>
          </div>
          <div className="space-y-4 text-gray-600">
            <p>
              Security is at the core of everything we do at Job Builder. We employ multiple layers of protection to keep your data safe.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Data Encryption</h3>
            <p>
              All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols. Your sensitive information is encrypted at rest using AES-256 encryption.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Authentication</h3>
            <p>
              We support secure authentication methods including OAuth 2.0 for Google sign-in and password-based authentication with strong password requirements.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Regular Security Audits</h3>
            <p>
              Our systems undergo regular security audits and penetration testing to identify and address potential vulnerabilities before they can be exploited.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6">Reporting Security Issues</h3>
            <p>
              If you discover a security vulnerability, please report it to us immediately at security@jobbuilder.com. We take all reports seriously and will respond promptly.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Legal;
