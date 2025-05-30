import { motion } from "framer-motion";
import Footer from "@/components/layout/footer";

export default function CookiePolicyPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Cookie Policy</h1>
              <p className="text-xl">
                How we use cookies and similar technologies on SkillSwap
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
                  This Cookie Policy explains how SkillSwap ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website at skillswap.com ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">What are cookies?</h2>
                <p className="mb-4">
                  Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>
                <p className="mb-4">
                  Cookies set by the website owner (in this case, SkillSwap) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Why do we use cookies?</h2>
                <p className="mb-4">
                  We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Website. Third parties serve cookies through our Website for advertising, analytics, and other purposes. This is described in more detail below.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Types of cookies we use</h2>
                <p className="mb-4">
                  The specific types of first and third-party cookies served through our Website and the purposes they perform are described below:
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Essential Cookies</h3>
                <p className="mb-4">
                  These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the Website, you cannot refuse them without impacting how our Website functions.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="font-medium">Examples of essential cookies we use:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Session cookies to maintain your authentication state</li>
                    <li>Security cookies to prevent cross-site request forgery</li>
                    <li>Load balancing cookies to distribute traffic to multiple servers</li>
                  </ul>
                </div>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Performance and Functionality Cookies</h3>
                <p className="mb-4">
                  These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="font-medium">Examples of performance and functionality cookies we use:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Cookies to remember your preferences (e.g., language, region)</li>
                    <li>Cookies to remember your settings (e.g., layout, font size)</li>
                    <li>Cookies to remember which features you've used</li>
                  </ul>
                </div>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Analytics and Customization Cookies</h3>
                <p className="mb-4">
                  These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="font-medium">Examples of analytics and customization cookies we use:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Google Analytics cookies to track user behavior on our site</li>
                    <li>Hotjar cookies to analyze how users interact with our pages</li>
                    <li>Optimizely cookies for A/B testing different features</li>
                  </ul>
                </div>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Advertising Cookies</h3>
                <p className="mb-4">
                  These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="font-medium">Examples of advertising cookies we use:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Facebook Pixel to measure the effectiveness of our Facebook ads</li>
                    <li>Google Ads cookies to track conversions and retarget users</li>
                    <li>LinkedIn Insight Tag to track conversions from LinkedIn ads</li>
                  </ul>
                </div>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Social Media Cookies</h3>
                <p className="mb-4">
                  These cookies are used to enable you to share pages and content that you find interesting on our Website through third-party social networking and other websites. These cookies may also be used for advertising purposes.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="font-medium">Examples of social media cookies we use:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Facebook cookies for the "Like" and "Share" buttons</li>
                    <li>Twitter cookies for the "Tweet" button</li>
                    <li>LinkedIn cookies for the "Share" button</li>
                  </ul>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">How can you control cookies?</h2>
                <p className="mb-4">
                  You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie table above.
                </p>
                <p className="mb-4">
                  You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.
                </p>
                <p className="mb-4">
                  In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit <a href="http://www.aboutads.info/choices/" className="text-primary hover:text-primary-dark">http://www.aboutads.info/choices/</a> or <a href="http://www.youronlinechoices.com" className="text-primary hover:text-primary-dark">http://www.youronlinechoices.com</a>.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">How often will we update this Cookie Policy?</h2>
                <p className="mb-4">
                  We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                </p>
                <p className="mb-4">
                  The date at the top of this Cookie Policy indicates when it was last updated.
                </p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Where can you get further information?</h2>
                <p className="mb-4">
                  If you have any questions about our use of cookies or other technologies, please email us at namanvashi@gmail.com or contact us at:
                </p>
                <p className="mb-4">
                  SkillSwap<br />
                  123 Skill Street<br />
                  Innovation District<br />
                  Tech City, TC 12345
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                  <p className="font-medium mb-2">Your Consent</p>
                  <p>
                    By continuing to use our website, you are agreeing to our placing cookies on your computer or device in accordance with the terms of this Cookie Policy.
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