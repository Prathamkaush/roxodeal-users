"use client";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/data";
import { ProductGrid } from "./marketplace";
import { Button } from "./ui/button";

export function ProgressiveProducts({ products }: { products: Product[] }) {
  const [count, setCount] = useState(12);
  const sentinel = useRef<HTMLDivElement>(null);
  const scrolled = useRef(false);
  const more = count < products.length;
  useEffect(() => {
    if (products.length <= 12) return;
    const load = () =>
      setCount((current) => Math.min(current + 4, products.length));
    let lastLoadY = -Infinity;
    let scrolling = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      if (
        !scrolled.current ||
        scrolling ||
        !sentinel.current ||
        window.scrollY <= lastLoadY
      )
        return;
      const box = sentinel.current.getBoundingClientRect();
      if (box.top <= window.innerHeight + 100 && box.bottom >= 0) {
        lastLoadY = window.scrollY;
        load();
      }
    };
    const scroll = () => {
      scrolled.current = true;
      scrolling = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        scrolling = false;
        check();
      }, 120);
    };
    const observer = new IntersectionObserver(check, { rootMargin: "100px" });
    if (sentinel.current) observer.observe(sentinel.current);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      window.removeEventListener("scroll", scroll);
    };
  }, [products.length]);
  return (
    <div className="rx-infinite-products">
      <ProductGrid products={products.slice(0, count)} />
      <div className="rx-product-load-more" ref={sentinel}>
        <p role="status">
          Showing {Math.min(count, products.length)} of {products.length}{" "}
          products
        </p>
        {more && (
          <Button
            variant="outline"
            onClick={() =>
              setCount((current) => Math.min(current + 4, products.length))
            }
          >
            Load 4 more products
          </Button>
        )}
        {!more && products.length > 0 && <span>You've reached the end.</span>}
      </div>
    </div>
  );
}
