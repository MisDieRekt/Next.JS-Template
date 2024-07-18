import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-t-foreground/10 py-4 no-print">
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center p-3 text-sm">
        <div className="flex flex-col sm:flex-row items-center">
          <Link href="/" className="text-foreground hover:text-blue-500 mx-2">
            Home
          </Link>
          <Link
            href="/about"
            className="text-foreground hover:text-blue-500 mx-2"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-foreground hover:text-blue-500 mx-2"
          >
            Contact
          </Link>
        </div>
        <div className="text-foreground mt-4 sm:mt-0">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
