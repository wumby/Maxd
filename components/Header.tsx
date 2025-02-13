import Link from "next/link";
import React from "react";

const Header = () => {
  return <div className="w-full flex justify-center text-3xl"><Link href={'/'}> Home</Link> <Link href={'/'}> Workouts</Link></div>;
};

export default Header;
