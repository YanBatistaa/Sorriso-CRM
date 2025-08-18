import { cn } from "@/lib/utils";
import React, { HTMLAttributes, useEffect, useRef } from "react";
import { useIntersection } from "react-use";

interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export const InfiniteScroll = ({
  className,
  onLoadMore,
  isLoading,
  hasMore,
  children,
  ...props
}: InfiniteScrollProps) => {
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: "200px", // Carrega 200px antes de chegar no final
  });

  useEffect(() => {
    if (intersection?.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [intersection, hasMore, isLoading, onLoadMore]);

  return (
    <div className={cn("overflow-y-auto", className)} {...props}>
      {children}
      {/* Elemento gatilho para carregar mais */}
      <div ref={intersectionRef} />
    </div>
  );
};