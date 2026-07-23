"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  const [viewport, api] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const paused = useRef(false);
  const onSelect = useCallback(
    () => api && setSelected(api.selectedScrollSnap()),
    [api],
  );
  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);
  useEffect(() => {
    if (!api || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(() => {
      if (!paused.current && !document.hidden) api.scrollNext();
    }, 6000);
    return () => window.clearInterval(timer);
  }, [api]);
  return (
    <div
      className="testimonial-shell"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          paused.current = false;
      }}
    >
      <div className="embla-viewport" ref={viewport}>
        <div className="embla-container">
          {testimonials.map((testimonial) => (
            <article
              className="testimonial"
              key={testimonial.name}
              aria-label={`Testimonial from ${testimonial.name}`}
            >
              <Quote className="quote-icon" />
              <blockquote>“{testimonial.quote}”</blockquote>
              <div className="person">
                <Image src={testimonial.image} alt="" width={56} height={56} />
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>Product collaborator</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="carousel-controls">
        <button
          onClick={() => api?.scrollPrev()}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <div className="dots">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.name}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={selected === index ? "true" : undefined}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
        <button onClick={() => api?.scrollNext()} aria-label="Next testimonial">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
