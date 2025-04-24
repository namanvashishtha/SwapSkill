import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
              About
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/how-it-works" className="text-base text-gray-500 hover:text-gray-900">
              How It Works
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
              Privacy
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
              Terms
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Facebook</span>
            <i className="fab fa-facebook text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Instagram</span>
            <i className="fab fa-instagram text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <i className="fab fa-twitter text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">LinkedIn</span>
            <i className="fab fa-linkedin text-xl"></i>
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} SwapSkill. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
