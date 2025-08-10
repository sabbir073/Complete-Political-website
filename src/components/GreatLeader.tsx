/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";


const GreatLeader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const leaders = [
    { name: "Shaheed President Ziaur Rahman", image: "/leader/zia.png" },
    { name: "Chairperson Begum Khaleda Zia", image: "/leader/khaleda.png" },
    { name: "Acting Chairman Tarique Rahman", image: "/leader/tareq.png" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('leaders-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: "free-snap",
      slides: {
        perView: 1.2,
        spacing: 20,
      },
      breakpoints: {
        "(max-width: 480px)": {
          slides: {
            perView: 1.1,
            spacing: 16,
          },
        },
      },
      drag: true,
      initial: 0,
      created(s) {
        s.moveToIdx(0, true, { duration: 0 });
      },
    },
    [
      (slider) => {
        let timeout: any;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            if (slider.track.details?.rel === slider.track.details?.maxIdx) {
              slider.moveToIdx(0, true, { duration: 1000 });
            } else {
              slider.next();
            }
          }, 2500);
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
      },
    ]
  );

  return (
    <section id="leaders-section" className="w-full px-6 md:px-16 py-16 bg-white overflow-hidden">
      {/* Header */}
      <div className={`text-center md:text-left md:flex md:justify-between md:items-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div>
          <p className="text-sm text-red-600 font-semibold">Our Leaders</p>
          <div className="w-10 h-[2px] bg-red-600 mt-1 mb-4 mx-auto md:mx-0 rounded-full" />
          <h2 className="text-3xl font-bold text-gray-900">The Great Leaders</h2>
        </div>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <a href="https://www.bnpbd.org/our-leaders" target="_blank" rel="noopener noreferrer">
            <button className="relative bg-primaryRed text-white px-5 py-2 rounded cursor-pointer group">
              <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">View More</span>
            </button>
          </a>
        </div>
      </div>

      {/* Mobile Auto-Scrolling Carousel */}
      <div className={`md:hidden mb-6 overflow-hidden transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div ref={sliderRef} className="keen-slider">
          {leaders.map((leader, index) => (
            <div
              key={index}
              className="keen-slider__slide flex justify-center"
            >
              <div className="relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 w-full max-w-sm">
                <Image
                  src={leader.image}
                  alt={leader.name}
                  width={320}
                  height={400}
                  loading="lazy"
                  className="w-full h-80 object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg text-center drop-shadow-lg">
                    {leader.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Button at Bottom */}
        <div className="text-center mt-6">
          <a href="https://www.bnpbd.org/our-leaders" target="_blank" rel="noopener noreferrer">
            <button className="relative bg-primaryRed text-white px-5 py-2 rounded cursor-pointer group">
              <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">View More</span>
            </button>
          </a>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {leaders.map((leader, index) => (
          <div
            key={index}
            className={`relative w-full rounded-xl overflow-hidden shadow-lg transform transition-all duration-700 hover:scale-105 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ 
              transitionDelay: `${(index + 1) * 200 + 400}ms` 
            }}
          >
            <Image
              src={leader.image}
              alt={leader.name}
              width={400}
              height={500}
              loading="lazy"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white font-bold text-xl text-center drop-shadow-lg">
                {leader.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GreatLeader;
