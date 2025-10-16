import React, { FC } from "react";

interface HeadingCardProps {
  title: string;
  subTitle: string;
}

const HeadingCard: FC<HeadingCardProps> = ({ title, subTitle }) => {
  return (
    <div className="w-full py-3 sm:px-6 px-3 text-inverse bg-foreground">
      <div className="max_w_custom">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="">{subTitle}</p>
      </div>
    </div>
  );
};

export default HeadingCard;
