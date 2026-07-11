import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type RoomStatus = "available" | "hottest" | "sold_out";

export interface RoomCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  priceLabel?: string;
  image: string;
  status: RoomStatus;
  tags?: string[];
  has360?: boolean;
}

const statusConfig = {
  available: {
    badge: null,
    borderColor: "border-secondary",
    offsetColor: "bg-secondary",
  },
  hottest: {
    badge: { text: "HOTTEST", color: "bg-secondary text-secondary-foreground" },
    borderColor: "border-black",
    offsetColor: "bg-black",
  },
  sold_out: {
    badge: { text: "SOLD OUT", color: "bg-primary text-primary-foreground" },
    borderColor: "border-transparent",
    offsetColor: "bg-transparent",
  },
};

export function RoomCard({
  id,
  name,
  description,
  price,
  priceLabel = "STARTING AT",
  image,
  status,
  tags = [],
  has360 = false,
}: RoomCardProps) {
  const config = statusConfig[status];
  const isSoldOut = status === "sold_out";

  return (
    <Link
      href={`/rooms/${encodeURIComponent(id)}`}
      className="group cursor-pointer block"
    >
      {/* Image Container with offset effect */}
      <div className="relative mb-6">
        {/* Offset/Shadow layer */}
        <div
          className={cn(
            "absolute inset-0 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3",
            config.offsetColor,
          )}
        />

        {/* Image Card */}
        <div
          className={cn(
            "relative overflow-hidden border-4 transition-all duration-300",
            config.borderColor,
          )}
        >
          <div className="relative aspect-[9/10] overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                isSoldOut
                  ? "grayscale brightness-75"
                  : "grayscale group-hover:grayscale-0 group-hover:scale-105",
              )}
            />

            {/* Sold out overlay */}
            {isSoldOut && <div className="absolute inset-0 bg-black/20 z-10" />}

            {/* Status Badge */}
            {config.badge && (
              <div
                className={cn(
                  "absolute top-4 left-4 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider z-20",
                  config.badge.color,
                )}
              >
                {config.badge.text}
              </div>
            )}

            {/* 360° Tour Badge */}
            {has360 && (
              <div className="absolute bottom-4 right-4 px-2.5 py-1.5 rounded bg-black/70 backdrop-blur-sm border border-secondary/40 text-secondary text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1.5 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                360° Tour
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-1">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl font-bold text-primary-foreground uppercase tracking-wide">
              {name}
            </h3>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-wide">
              {description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {priceLabel}
            </p>
            <p
              className={cn(
                "text-3xl font-bold",
                isSoldOut ? "text-muted-foreground" : "text-primary",
              )}
            >
              {price}
            </p>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider bg-foreground text-black border border-black"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
