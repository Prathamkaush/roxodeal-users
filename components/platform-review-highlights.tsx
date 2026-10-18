"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function PlatformReviewHighlights() {
  const query = useQuery<{
    items: Array<{
      id: string;
      message: string;
      rating: number;
      user: { name: string };
    }>;
    total: number;
  }>({
    queryKey: ["platform-review-highlights"],
    queryFn: () => api("/reviews?page=1"),
  });
  return (
    <section className="rx-platform-reviews">
      <div className="rx-catalogue-heading">
        <div>
          <span className="rx-section-label">FROM OUR BUYERS</span>
          <h2>Marketplace experiences</h2>
        </div>
        <Link href="/reviews">Read all reviews →</Link>
      </div>
      {query.isPending ? (
        <div
          className="rx-review-skeleton rx-image-shimmer"
          role="status"
          aria-label="Loading buyer reviews"
        />
      ) : query.error ? (
        <p>Buyer reviews are temporarily unavailable.</p>
      ) : query.data?.items.length ? (
        <div className="rx-platform-review-grid">
          {query.data.items.slice(0, 3).map((review) => (
            <article className="ms-card" key={review.id}>
              <span
                className="rx-review-stars"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {"★".repeat(review.rating)}
              </span>
              <p>{review.message}</p>
              <strong>{review.user.name}</strong>
            </article>
          ))}
        </div>
      ) : (
        <p>
          No platform reviews yet.{" "}
          <Link href="/buyer/feedback">Share your experience</Link>
        </p>
      )}
    </section>
  );
}
