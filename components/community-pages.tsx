"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Star, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useMarketplace } from "@/lib/store";
import { Button } from "./ui/button";

export function ContactPage() {
  const { state } = useMarketplace();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reference, setReference] = useState("");
  return (
    <div className="rx-support-page">
      <header className="rx-support-heading">
        <span className="rx-section-label">WE'RE HERE TO HELP</span>
        <h1>Let's talk business.</h1>
        <p>
          Get help with your account, sourcing, payments, or marketplace
          experience.
        </p>
      </header>
      <div className="rx-support-layout">
        <aside>
          <div className="ms-card">
            <Mail size={28} />
            <h2>Contact Roxodeal</h2>
            <p>
              Send our team a message. Include a requirement or payment
              reference if your question relates to one.
            </p>
            <p>Provide an email address where our team can reach you.</p>
          </div>
          <div className="ms-card">
            <MessageSquare size={24} />
            <h3>Ideas for a better marketplace?</h3>
            <p>
              Share product feedback or tell other buyers about your experience.
            </p>
            <Link href="/buyer/feedback">Feedback & reviews</Link>
          </div>
        </aside>
        <section className="ms-card">
          <h2>Send a message</h2>
          {reference ? (
            <div role="status" className="rx-direct-note">
              Your message has been received. Reference: {reference}
            </div>
          ) : (
            <form
              className="ms-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const fields = Object.fromEntries(
                  new FormData(event.currentTarget),
                );
                setBusy(true);
                setError("");
                try {
                  const result = await api("/contact", {
                    method: "POST",
                    body: JSON.stringify(fields),
                  });
                  setReference(result.id);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="ms-form-grid">
                <label className="ms-field">
                  Your name
                  <input
                    name="name"
                    defaultValue={state.profile.name}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>
                <label className="ms-field">
                  Email address
                  <input
                    name="email"
                    type="email"
                    defaultValue={state.profile.email}
                    maxLength={254}
                    required
                  />
                </label>
              </div>
              <label className="ms-field">
                Subject
                <input name="subject" minLength={3} maxLength={200} required />
              </label>
              <label className="ms-field">
                Message
                <textarea
                  name="message"
                  rows={6}
                  minLength={10}
                  maxLength={5000}
                  required
                />
              </label>
              {error && (
                <p role="alert" className="ms-error">
                  {error}
                </p>
              )}
              <Button disabled={busy}>
                {busy ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

type Reviews = {
  items: Array<{
    id: string;
    message: string;
    rating: number;
    createdAt: string;
    user: { name: string; city: string };
  }>;
  total: number;
  average: number | null;
  pageSize: number;
};
export function ReviewsPanel({
  sellerId,
  productId,
  allowSubmission = true,
}: {
  sellerId?: string;
  productId?: string;
  allowSubmission?: boolean;
}) {
  const { role } = useMarketplace();
  const client = useQueryClient();
  const [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const query = useQuery<Reviews>({
    queryKey: ["reviews", sellerId, productId, page],
    queryFn: () =>
      api(
        "/reviews?" +
          new URLSearchParams({
            page: String(page),
            ...(sellerId ? { sellerId } : {}),
            ...(productId ? { productId } : {}),
          }),
      ),
  });
  return (
    <section className="ms-card rx-reviews">
      <div className="rx-reviews-heading">
        <div>
          <span className="rx-section-label">BUYER EXPERIENCES</span>
          <h2>Ratings & reviews</h2>
        </div>
        {query.data && (
          <div className="rx-rating-summary">
            <Star size={24} />
            <strong>
              {query.data.average ? query.data.average.toFixed(1) : "—"}
            </strong>
            <span>{query.data.total} reviews</span>
          </div>
        )}
      </div>
      {query.isPending ? (
        <div
          className="rx-image-shimmer rx-review-skeleton"
          role="status"
          aria-label="Loading reviews"
        />
      ) : query.error ? (
        <div role="alert">
          <p>Reviews could not be loaded.</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Retry reviews
          </Button>
        </div>
      ) : (
        <>
          {query.data?.items.map((review) => (
            <article className="rx-review-item" key={review.id}>
              <div>
                <strong>{review.user.name}</strong>
                <small>
                  {new Date(review.createdAt).toLocaleDateString("en-IN")}
                </small>
              </div>
              <span
                className="rx-review-stars"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
              <p>{review.message}</p>
            </article>
          ))}
          {!query.data?.total && (
            <p className="rx-review-empty">
              No reviews yet. Be the first to share your experience.
            </p>
          )}
          {query.data && query.data.total > query.data.pageSize && (
            <div className="rx-inline-actions">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button
                variant="outline"
                disabled={page * query.data.pageSize >= query.data.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      {allowSubmission && (
        <div className="rx-review-form">
          <h3>Share your experience</h3>
          <p>
            Your review is public. Submitting again updates your review for this{" "}
            {productId ? "product" : sellerId ? "supplier" : "marketplace"}.
          </p>
          {role === "buyer" ? (
            <form
              className="ms-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const fields = new FormData(form);
                setBusy(true);
                setError("");
                setSaved(false);
                try {
                  await api("/reviews", {
                    method: "POST",
                    body: JSON.stringify({
                      message: String(fields.get("message")),
                      rating: Number(fields.get("rating")),
                      sellerId,
                      productId,
                    }),
                  });
                  form.reset();
                  setPage(1);
                  await client.invalidateQueries({ queryKey: ["reviews"] });
                  setSaved(true);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="ms-field">
                Rating
                <select
                  aria-label="Rating"
                  name="rating"
                  required
                  defaultValue="5"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option value={rating} key={rating}>
                      {rating} stars
                    </option>
                  ))}
                </select>
              </label>
              <label className="ms-field">
                Your review
                <textarea
                  name="message"
                  rows={3}
                  minLength={10}
                  maxLength={3000}
                  required
                />
              </label>
              {error && (
                <p role="alert" className="ms-error">
                  {error}
                </p>
              )}
              {saved && <p role="status">Your review has been saved.</p>}
              <Button disabled={busy}>
                {busy ? "Saving..." : "Publish review"}
              </Button>
            </form>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(productId ? `/products/${productId}` : sellerId ? `/suppliers/${sellerId}` : "/reviews")}`}
            >
              Sign in as a buyer to write a review
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export function FeedbackPage({
  reviewsOnly = false,
  publicView = false,
}: {
  reviewsOnly?: boolean;
  publicView?: boolean;
}) {
  const { role } = useMarketplace();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  return (
    <div className="rx-support-page">
      <header className="rx-support-heading">
        <span className="rx-section-label">YOUR VOICE MATTERS</span>
        <h1>
          {reviewsOnly || publicView
            ? "Marketplace reviews"
            : "Feedback & reviews"}
        </h1>
        <p>
          Help us improve Roxodeal and help other buyers make informed
          decisions.
        </p>
      </header>
      {!reviewsOnly && !publicView && (
        <section className="ms-card">
          <h2>Send private feedback</h2>
          <p>
            Suggestions and problems shared here go to our team and aren't
            published as reviews.
          </p>
          {role ? (
            <form
              className="ms-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const text = new FormData(form).get("message");
                setBusy(true);
                setMessage("");
                setError("");
                try {
                  await api("/feedback", {
                    method: "POST",
                    body: JSON.stringify({ message: text }),
                  });
                  form.reset();
                  setMessage("Thank you. Your feedback has been received.");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="ms-field">
                Your feedback
                <textarea
                  name="message"
                  minLength={10}
                  maxLength={3000}
                  rows={4}
                  required
                />
              </label>
              {error && (
                <p className="ms-error" role="alert">
                  {error}
                </p>
              )}
              {message && <p role="status">{message}</p>}
              <Button disabled={busy}>
                {busy ? "Sending..." : "Send feedback"}
              </Button>
            </form>
          ) : (
            <Link href="/login?next=%2Ffeedback">Sign in to send feedback</Link>
          )}
        </section>
      )}
      {publicView && (
        <div className="rx-inline-actions">
          <Button asChild>
            <Link href="/buyer/feedback">Write a review</Link>
          </Button>
        </div>
      )}
      <ReviewsPanel allowSubmission={!publicView} />
    </div>
  );
}
