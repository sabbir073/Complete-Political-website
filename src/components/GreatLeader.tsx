/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

// Autoplay plugin
function AutoplayPlugin(slider: any) {
  let timeout: any;
  let mouseOver = false;

  function clearNextTimeout() {
    clearTimeout(timeout);
  }

  function nextTimeout() {
    clearTimeout(timeout);
    if (mouseOver) return;
    timeout = setTimeout(() => {
      slider.next();
    }, 3000);
  }

  slider.on("created", () => {
    slider.container.addEventListener("mouseover", () => {
      mouseOver = true;
      clearNextTimeout();
    });
    slider.container.addEventListener("mouseout", () => {
      mouseOver = false;
      nextTimeout();
    });
    nextTimeout();
  });

  slider.on("dragStarted", clearNextTimeout);
  slider.on("animationEnded", nextTimeout);
  slider.on("updated", nextTimeout);
}

const GreatLeader: React.FC = () => {
  const leaders = [
    { name: "Ziaur Rahman", image: "/leader/zia.png" },
    { name: "Khaleda Zia", image: "/leader/khaleda.png" },
    { name: "Tarique Rahman", image: "/leader/tareq.png" },
  ];

  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: {
        perView: 1,
        spacing: 16,
      },
    },
    [AutoplayPlugin]
  );

  return (
    <section className="w-full px-6 md:px-16 py-16 bg-white">
      {/* Header */}
      <div className="text-center md:text-left md:flex md:justify-between md:items-center mb-8">
        <div>
          <p className="text-sm text-red-600 font-semibold">Our Leaders</p>
          <div className="w-10 h-[2px] bg-red-600 mt-1 mb-4 mx-auto md:mx-0 rounded-full" />
          <h2 className="text-3xl font-bold text-gray-900">The Great Leaders</h2>
        </div>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <Link href="/leaders">
            <button className="relative bg-red-600 text-white px-5 py-2 rounded cursor-pointer group overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">View More</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile Swipe Carousel */}
      <div className="md:hidden mb-6">
        <div ref={sliderRef} className="keen-slider rounded-md">
          {leaders.map((leader, index) => (
            <div
              key={index}
              className="keen-slider__slide rounded-lg overflow-hidden shadow-sm"
            >
              <Image
                src={leader.image}
                alt={leader.name}
                width={320}
                height={320}
                loading="lazy"
                className="w-full max-w-xs mx-auto h-64 object-cover grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          ))}
        </div>

        {/* Mobile Button at Bottom */}
        <div className="text-center mt-6">
          <Link href="/leaders">
            <button className="relative bg-red-600 text-white px-5 py-2 rounded cursor-pointer group overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">View More</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {leaders.map((leader, index) => (
          <div
            key={index}
            className="w-full rounded-lg overflow-hidden shadow-sm"
          >
            <Image
              src={leader.image}
              alt={leader.name}
              width={400}
              height={400}
              loading="lazy"
              className="object-cover grayscale hover:grayscale-0 transition duration-300 w-full h-auto"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GreatLeader;
