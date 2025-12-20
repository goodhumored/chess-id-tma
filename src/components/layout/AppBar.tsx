"use client";

import CalendarIcon from '@/../public/calendar_month.svg';
import EventIcon from '@/../public/event.svg';
import ProfileIcon from '@/../public/account_circle.svg';
import Image from "next/image";
import { cn } from "../../lib/utils";
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'События', href: '/', icon: EventIcon },
  { name: 'Мои События', href: '/my-events', icon: CalendarIcon },
  { name: 'Профиль', href: '/profile', icon: ProfileIcon },
]
export default function AppBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const route = typeof window !== 'undefined' ? window.location.pathname : '/';
    const index = navigation.findIndex(item => item.href === route);
    Promise.resolve().then(() => setCurrentIndex(index));
  }, []);

  return (
    <nav className="bottom-0 left-0 right-0 border-t-1 border-t-gray-800 bg-background fixed z-50">
      <div className="relative flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {/* <div style={{ */}
        {/*   width: (100 / navigation.length).toString() + "%", */}
        {/*   left: (currentIndex * (100 / navigation.length)).toString() + "%" */}
        {/* }} className="absolute h-3"></div> */}
        {navigation.map((item, i) => (
          <a key={i} className="relative flex flex-col items-center justify-center py-2 px-4 transition-all" href={item.href}>
            <div className="relative mb-1.5" style={{ width: "24px", height: "24px" }}>
              <Image className={cn(`w-full h-full transition-all`, currentIndex == i ? "" : "grayscale-100")} src={item.icon} alt={item.name} />
            </div>
            <span className={cn("text-xs font-medium", currentIndex == i ? "text-[rgb(43_140_238/1)]" : "text-gray-400")}>
              {item.name}
            </span>
          </a>
        ))}
      </div>
    </nav>)

}
