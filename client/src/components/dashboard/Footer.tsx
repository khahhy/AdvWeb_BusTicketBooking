export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-black text-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-white dark:text-gray-200 text-lg font-semibold mb-4">
              BusBooking
            </h5>
            <p className="text-gray-400 dark:text-gray-500">
              Vietnam's top leading online bus ticket booking service
            </p>
          </div>
          <div>
            <h5 className="text-white dark:text-gray-200 text-lg font-semibold mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2 text-gray-400 dark:text-gray-500">
              <li>About Us</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white dark:text-gray-200 text-lg font-semibold mb-4">
              Support
            </h5>
            <ul className="space-y-2 text-gray-400 dark:text-gray-500">
              <li>FAQ</li>
              <li>Contact</li>
              <li>Help Guide</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white dark:text-gray-200 text-lg font-semibold mb-4">
              Contact
            </h5>
            <div className="space-y-2 text-gray-400 dark:text-gray-500">
              <p>📞 1900-1234</p>
              <p>✉️ support@busbooking.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
          <p>&copy; 2024 BusBooking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
