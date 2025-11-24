import Navbar from "@/components/common/Navbar";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  Search,
  FileText,
} from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-56 pb-48 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2 text-center opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Customer Support
          </h1>
          <p className="text-center mb-8 text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            We're here to help you 24/7. Get instant support for all your travel needs.
          </p>
        </div>
      </div>

      {/* Quick Help Section */}
      <section className="py-16 bg-muted/30 dark:bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            How can we help you today?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <Search className="w-12 h-12 mx-auto mb-4 text-pink-400" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Find My Booking</h3>
              <p className="text-muted-foreground dark:text-gray-300">
                Track your ticket or modify your reservation
              </p>
            </div>
            <div className="text-center p-6 bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <FileText className="w-12 h-12 mx-auto mb-4 text-pink-400" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Booking Issues</h3>
              <p className="text-muted-foreground dark:text-gray-300">
                Problems with payment, cancellation or refunds
              </p>
            </div>
            <div className="text-center p-6 bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-pink-400" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">General Questions</h3>
              <p className="text-muted-foreground dark:text-gray-300">
                FAQs, policies, and travel information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 dark:bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Get in Touch</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">Call Us</h3>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                    1900 6067
                  </p>
                  <p className="text-muted-foreground dark:text-gray-300">
                    Available 24/7 for urgent assistance
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                    Average wait time: &lt; 2 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">Email Support</h3>
                  <p className="text-lg font-medium text-pink-600 dark:text-pink-400 mb-2">
                    support@busticket.vn
                  </p>
                  <p className="text-muted-foreground dark:text-gray-300">
                    Get detailed help via email
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                    Response time: Within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">Live Chat</h3>
                  <p className="text-muted-foreground dark:text-gray-300 mb-3">
                    Chat with our support team instantly
                  </p>
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold mb-6 dark:text-white">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:focus:ring-pink-800"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:focus:ring-pink-800"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Booking Code (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:focus:ring-pink-800"
                    placeholder="e.g., BUS123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Subject
                  </label>
                  <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:focus:ring-pink-800">
                    <option>Select a topic</option>
                    <option>Booking Issues</option>
                    <option>Payment Problems</option>
                    <option>Cancellation/Refund</option>
                    <option>Schedule Changes</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:focus:ring-pink-800"
                    placeholder="Describe your issue or question..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30 dark:bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm">
              <details className="p-6">
                <summary className="font-semibold cursor-pointer flex items-center justify-between dark:text-white">
                  How can I cancel my booking?
                  <HelpCircle className="w-5 h-5 text-pink-400" />
                </summary>
                <div className="mt-4 text-muted-foreground dark:text-gray-300">
                  <p>
                    You can cancel your booking up to 2 hours before departure.
                    Log into your account or use our ticket tracking feature to
                    cancel. Refund policies vary depending on the ticket type.
                  </p>
                </div>
              </details>
            </div>

            <div className="bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm">
              <details className="p-6">
                <summary className="font-semibold cursor-pointer flex items-center justify-between dark:text-white">
                  What if I miss my bus?
                  <HelpCircle className="w-5 h-5 text-pink-400" />
                </summary>
                <div className="mt-4 text-muted-foreground dark:text-gray-300">
                  <p>
                    If you miss your bus, please contact our support team
                    immediately. We'll try to accommodate you on the next
                    available bus, subject to availability and fare differences
                    may apply.
                  </p>
                </div>
              </details>
            </div>

            <div className="bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm">
              <details className="p-6">
                <summary className="font-semibold cursor-pointer flex items-center justify-between dark:text-white">
                  How do I get a refund?
                  <HelpCircle className="w-5 h-5 text-pink-400" />
                </summary>
                <div className="mt-4 text-muted-foreground dark:text-gray-300">
                  <p>
                    Refunds are processed according to our cancellation policy.
                    Most refunds are processed within 5-7 business days. Contact
                    our support team with your booking details to initiate a
                    refund request.
                  </p>
                </div>
              </details>
            </div>

            <div className="bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm">
              <details className="p-6">
                <summary className="font-semibold cursor-pointer flex items-center justify-between dark:text-white">
                  Can I change my travel date?
                  <HelpCircle className="w-5 h-5 text-pink-400" />
                </summary>
                <div className="mt-4 text-muted-foreground dark:text-gray-300">
                  <p>
                    Yes, you can modify your travel date subject to availability
                    and fare differences. Changes must be made at least 1 hour
                    before departure. Additional fees may apply.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Support Hours */}
      <section className="py-16 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="bg-background dark:bg-black dark:border dark:border-gray-800 rounded-lg shadow-sm p-8 max-w-2xl mx-auto text-center">
            <Clock className="w-16 h-16 mx-auto mb-6 text-pink-400" />
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Support Hours</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="font-semibold dark:text-white">Phone Support</h4>
                <p className="text-muted-foreground dark:text-gray-300">24/7 Available</p>
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Email Support</h4>
                <p className="text-muted-foreground dark:text-gray-300">Monday - Sunday</p>
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Live Chat</h4>
                <p className="text-muted-foreground dark:text-gray-300">6:00 AM - 10:00 PM</p>
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Office Visits</h4>
                <p className="text-muted-foreground dark:text-gray-300">9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
