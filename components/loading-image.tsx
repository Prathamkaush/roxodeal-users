"use client";
import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
function ImageContent({
  src,
  alt,
  eager,
}: {
  src: string;
  alt: string;
  eager?: boolean;
}) {
  const image = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    if (image.current?.complete)
      setStatus(image.current.naturalWidth ? "loaded" : "error");
  }, []);
  return (
    <span
      className={`rx-loading-image ${status}`}
      aria-busy={status === "loading"}
    >
      {status === "loading" && (
        <span
          className="rx-image-shimmer"
          aria-label="Loading image"
          role="status"
        />
      )}
      {status === "error" ? (
        <span className="rx-image-fallback">
          <ImageOff size={24} />
          <span>Image unavailable</span>
        </span>
      ) : (
        <img
          ref={image}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </span>
  );
}
export function LoadingImage(props: {
  src: string;
  alt: string;
  eager?: boolean;
}) {
  return <ImageContent key={props.src} {...props} />;
}
