"use client";

import { cn } from "@/lib/utils";
import { toggleSidebar } from "@/redux/slices/SidebarSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

interface HeadingCardProps {
  title: string;
  subTitle: string;
}

const HeadingCard: FC<HeadingCardProps> = ({ title, subTitle }) => {
  const { collapsed } = useSelector((state: RootState) => state.sidebar);
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className="w-full sm:py-4 py-2 sm:px-6 px-3 text-inverse bg-primary rounded-t-4xl relative">
      <div className="max_w_custom">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="">{subTitle}</p>
      </div>

      <button
        onClick={() => dispatch(toggleSidebar())}
        className={cn(
          "absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition z-50 border-primary text-primary"
        )}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  );
};

export default HeadingCard;
