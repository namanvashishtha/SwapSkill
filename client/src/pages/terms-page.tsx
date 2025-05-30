import { motion } from "framer-motion";
import Footer from "@/components/layout/footer";

export default function TermsPage() {
  const lastUpdated = "July 15, 2023";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-light text-white py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
              <p className="text-xl">
                The rules and guidelines for using SkillSwap
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-10">
              <div className="prose prose-lg max-w-none">
                <div className="flex justify-between items-center mb-8 pb-4 border-b">
                  <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">Print Terms</button>
                </div>
                
                <p className="mb-6">
                  Welcome to SkillSwap. These Terms of Service ("Terms") govern your access to and use of the SkillSwap website, mobile applications, and services (collectively, the "Service"). Please read these Terms carefully before using the Service.
                </p>
                
                <p className="mb-6">
                  By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By registering for and/or using the Service in any manner, you agree to these Terms and all other operating rules, policies, and procedures that may be published by SkillSwap from time to time.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">2. Eligibility</h2>
                <p className="mb-4">
                  You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you meet all eligibility requirements. SkillSwap may, in its sole discretion, refuse to offer the Service to any person or entity and change its eligibility criteria at any time.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">3. Account Registration and Security</h2>
                <p className="mb-4">
                  To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="mb-4">
                  You are responsible for safeguarding your account password and for any activities or actions under your account. SkillSwap will not be liable for any losses or damages arising from your failure to maintain the security of your account.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">4. User Content</h2>
                <p className="mb-4">
                  The Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("User Content"). You are responsible for the User Content that you post on or through the Service, including its legality, reliability, and appropriateness.
                </p>
                <p className="mb-4">
                  By posting User Content on or through the Service, you grant SkillSwap a worldwide, non-exclusive, royalty-free license to use, copy, modify, create derivative works based on, distribute, publicly display, publicly perform, and otherwise use the User Content in connection with operating and providing the Service.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">5. Prohibited Conduct</h2>
                <p className="mb-4">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law</li>
                  <li>Harassing, threatening, intimidating, or stalking other users of the Service</li>
                  <li>Impersonating any person or entity, or falsely stating or otherwise misrepresenting your affiliation with a person or entity</li>
                  <li>Interfering with or disrupting the Service or servers or networks connected to the Service</li>
                  <li>Attempting to gain unauthorized access to the Service, user accounts, or computer systems or networks</li>
                  <li>Posting content that is defamatory, obscene, or otherwise objectionable</li>
                  <li>Using the Service to send unsolicited communications, promotions, or advertisements</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">6. Skill Exchanges</h2>
                <p className="mb-4">
                  SkillSwap facilitates skill exchanges between users. SkillSwap is not a party to any agreements between users and does not guarantee the quality, safety, or legality of the skills exchanged.
                </p>
                <p className="mb-4">
                  Users are solely responsible for evaluating the suitability of other users for skill exchanges, scheduling and conducting exchanges, and resolving any disputes that may arise.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">7. Intellectual Property Rights</h2>
                <p className="mb-4">
                  The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of SkillSwap and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">8. Termination</h2>
                <p className="mb-4">
                  SkillSwap may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
                </p>
                <p className="mb-4">
                  If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">9. Limitation of Liability</h2>
                <p className="mb-4">
                  In no event shall SkillSwap, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">10. Changes to Terms</h2>
                <p className="mb-4">
                  SkillSwap reserves the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
                <p className="mb-4">
                  By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">11. Governing Law</h2>
                <p className="mb-4">
                  These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">12. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about these Terms, please contact us at namanvashi@gmail.com.
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                  <p className="font-medium mb-2">Acknowledgment</p>
                  <p>
                    By using the SkillSwap service, you acknowledge that you have read these Terms of Service, understand them, and agree to be bound by them. If you do not agree to these Terms of Service, you are not authorized to use the Service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}