export type Testimonial = {
  name: string;
  quote: string;
  image: string;
  role?: string;
  company?: string;
  link?: string;
};
export const testimonials: Testimonial[] = [
  {
    name: "Rahul Chavan",
    image: "/images/testimonials/rahul-chavan.jpg",
    quote:
      "Working with Akshay was a fantastic experience. His creativity, attention to detail, and dedication exceeded our expectations. The final product was delivered on time and with strong quality.",
  },
  {
    name: "Shirish Yenganti",
    image: "/images/testimonials/shirish-yenganti.png",
    quote:
      "Highly impressed with Akshay’s work. He brought fresh ideas and executed them carefully. His attention to detail and commitment to quality were evident throughout the project.",
  },
  {
    name: "Muzzamil Shaikh",
    image: "/images/testimonials/muzzamil-shaikh.png",
    quote:
      "An excellent experience from start to finish. Akshay’s expertise and thoughtful approach resulted in a strong final product. He was responsive and attentive to our requirements.",
  },
  {
    name: "Muzammil Alloli",
    image: "/images/testimonials/muzammil-alloli.png",
    quote:
      "Akshay transformed our vision into a working product with strong design execution. The project was completed ahead of schedule and exceeded our expectations.",
  },
];
