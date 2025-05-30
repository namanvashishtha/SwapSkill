import { motion } from "framer-motion";
import Footer from "@/components/layout/footer";

export default function PrivacyPolicyPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-xl">
                How we collect, use, and protect your personal information
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
                  <button className="text-primary hover:text-primary-dark text-sm font-medium">Print Policy</button>
                </div>
                
                <p className="mb-6">
                  At SkillSwap, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Personal Data</h3>
                <p className="mb-4">
                  We may collect personal identification information from you in a variety of ways, including, but not limited to, when you:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Register for an account</li>
                  <li>Create or modify your profile</li>
                  <li>Connect with other users</li>
                  <li>Participate in skill exchanges</li>
                  <li>Submit feedback or contact us</li>
                  <li>Respond to surveys or communications</li>
                </ul>
                <p className="mb-4">
                  The personal information we may collect includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Name, email address, and contact information</li>
                  <li>Profile information, including skills, interests, and experience</li>
                  <li>Communications between you and other users</li>
                  <li>Feedback and ratings from skill exchanges</li>
                  <li>Payment information (if applicable)</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
                <p className="mb-4">
                  We may also collect information about how the Service is accessed and used. This usage data may include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your computer's Internet Protocol address (e.g., IP address)</li>
                  <li>Browser type and version</li>
                  <li>Pages of our Service that you visit</li>
                  <li>Time and date of your visit</li>
                  <li>Time spent on those pages</li>
                  <li>Device identifiers</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect for various purposes, including to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Process and complete transactions</li>
                  <li>Send administrative information, such as updates, security alerts, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Facilitate skill exchanges between users</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
                  <li>Detect, prevent, and address technical issues</li>
                  <li>Personalize and improve your experience</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">3. Sharing Your Information</h2>
                <p className="mb-4">
                  We may share your personal information in the following situations:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>With Other Users:</strong> When you participate in skill exchanges or communicate with other users, certain profile information will be shared.</li>
                  <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us.</li>
                  <li><strong>For Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                  <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
                <p className="mb-4">
                  We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Service is at your own risk.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Data Protection Rights</h2>
                <p className="mb-4">
                  Depending on your location, you may have the following data protection rights:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>The right to access, update, or delete the information we have on you</li>
                  <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete</li>
                  <li>The right to object to our processing of your personal data</li>
                  <li>The right of restriction - the right to request that we restrict the processing of your personal information</li>
                  <li>The right to data portability - the right to be provided with a copy of your personal data in a structured, machine-readable format</li>
                  <li>The right to withdraw consent at any time where we relied on your consent to process your personal information</li>
                </ul>
                <p className="mb-4">
                  To exercise any of these rights, please contact us at namanvashi@gmail.com.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                  We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                </p>
                <p className="mb-4">
                  For more information about the cookies we use, please see our Cookie Policy.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">7. Children's Privacy</h2>
                <p className="mb-4">
                  Our Service is not directed to anyone under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mb-4">
                  Email: namanvashi@gmail.com<br />
                  Address: 123 Skill Street, Innovation District, Tech City, TC 12345
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                  <p className="font-medium mb-2">Your Consent</p>
                  <p>
                    By using our website and services, you consent to our Privacy Policy and agree to its terms. If you have any questions or concerns about how we handle your personal information, please don't hesitate to contact us.
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