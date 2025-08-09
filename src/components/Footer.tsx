import Image from 'next/image';
import Link from 'next/link';
import {
  FaYoutube,
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaTiktok,
} from 'react-icons/fa6';

export default function BNPFooter() {
  return (
    <>
      {/* Split Background Section: White top half, Green bottom half */}
      <div className="relative">
        <div className="h-32 md:h-40 bg-white"></div>
        <div className="h-32 md:h-40 bg-[#003B2F]"></div>

        {/* CTA Box */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-xl px-6">
          <div className="bg-[url('/footerbg.png')] bg-cover bg-center rounded-3xl px-6 py-12 text-center shadow-lg">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-white drop-shadow">Join the Nationalists</h2>
            <p className="text-lg md:text-xl mb-6 text-white drop-shadow">Join the Fight for Democracy & Voting Rights</p>
            <Link
              href="/join"
              className="inline-block bg-white text-[#003B2F] font-semibold px-6 py-3 rounded-md hover:bg-gray-200 transition"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-[#003B2F] text-white">
        <div className="w-full px-6 max-w-screen-xl mx-auto py-10 md:py-5 grid grid-cols-2 grid-rows-3 gap-x-8 md:grid-cols-3 lg:grid-cols-5 lg:grid-rows-1">

          {/* Column 1: Logo + Socials */}
          <div className="flex flex-col items-start">
            <Image src="/logo.png" alt="BNP Flag" width={64} height={48} />
            <p className="mt-4 mb-2 font-semibold">Follow us</p>
            <div className="flex space-x-2 text-xl">
              <Link href="#" aria-label="YouTube"><FaYoutube /></Link>
              <Link href="#" aria-label="Facebook"><FaFacebookF /></Link>
              <Link href="#" aria-label="X"><FaXTwitter /></Link>
              <Link href="#" aria-label="Instagram"><FaInstagram /></Link>
              <Link href="#" aria-label="Telegram"><FaTelegram /></Link>
              <Link href="#" aria-label="TikTok"><FaTiktok /></Link>
            </div>
          </div>

          {/* Column 2: About Us */}
          <div>
            <h4 className="font-bold mb-2">About Us</h4>
            <ul className="space-y-1">
              <li><Link href="/leaders">Our Leaders</Link></li>
              <li><Link href="/constitution">Constitution</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-bold mb-2">Resources</h4>
            <ul className="space-y-1">
              <li><Link href="/vision-2030">Vision 2030</Link></li>
              <li><Link href="/19-points">19 Points</Link></li>
            </ul>
          </div>

          {/* Column 4: Updates */}
          <div>
            <h4 className="font-bold mb-2">Update</h4>
            <ul className="space-y-1">
              <li><Link href="/press-releases">Press Releases</Link></li>
              <li><Link href="/press-releases">Press Releases</Link></li>
            </ul>
          </div>

          {/* Column 5: Join Us Buttons */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold mb-2">Join Us</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/membership" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-center">Membership Free</Link>
              <Link href="/general-membership" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-center">General Membership Free</Link>
              <Link href="/donate" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-center">Donate</Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-green-800 py-4 px-6 text-sm text-center text-gray-300">
          <p>© 2023 to 2025 Bangladesh Nationalist Party - BNP</p>
          <p>Develop And Maintained By Md Sabbir Ahmed</p>
        </div>
      </footer>
    </>
  );
}
