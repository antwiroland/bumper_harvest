import Image, { type ImageProps } from "next/image";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type AvatarProps = HTMLAttributes<HTMLDivElement>;
type AvatarImageProps = Omit<ImageProps, "alt"> & {
  alt?: string;
};

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, alt = "Avatar", ...props }: AvatarImageProps) {
  return (
    <Image
      alt={alt}
      width={40}
      height={40}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-sm font-semibold uppercase text-slate-700", className)} {...props} />
  );
}
