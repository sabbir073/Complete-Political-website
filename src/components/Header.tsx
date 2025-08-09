"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/leaders", label: "Leaders" },
];

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const headerHeight = 250; // Changed from 80 to 250
      setIsSticky(scrollPosition > headerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`bg-white shadow-md z-10 transition-all duration-500 ease-in-out ${
          isSticky ? "fixed top-0 left-0 right-0 animate-fadeInDown" : "relative"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/">
            <Image src="/logo.png" alt="Flag" width={80} height={50} />
          </Link>
          {/* Desktop Menu */}
          <nav className="hidden md:flex flex-1 justify-center space-x-8 text-black">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg hover:text-primaryRed px-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Desktop Button */}
          <button className="hidden md:block relative bg-primaryRed text-white px-5 py-2 rounded cursor-pointer group">
            <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Contact Me</span>
          </button>
          {/* Hamburger Button */}
          <button
            className="md:hidden text-black"
            onClick={() => setIsMenuOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black opacity-50 z-10 ${
          isMenuOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsMenuOpen(false)}
      ></div>
      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 w-4/5 h-full bg-white shadow-lg z-20 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            className="text-black mb-4"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <nav className="flex flex-col space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg hover:text-primaryRed"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="mt-4 relative bg-primaryRed text-white px-5 py-2 rounded w-full group">
            <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Contact Me</span>
          </button>
        </div>
      </div>
      {/* Spacer to prevent content overlap when header is sticky */}
      {isSticky && <div className="h-[80px]"></div>}
    </>
  );
}