"use client";

import Image from "next/image";

export default function Loader() {
  return (
    <div className="absolute inset-0 z-[9999] bg-zinc-100 grid place-content-center">
      <Image
        src="/logo.gif"
        alt="logo"
        width={500}
        height={500}
        className="w-sm xl:w-md 2xl:w-xl aspect-square"
        unoptimized={true}
      />
    </div>
  );
}
