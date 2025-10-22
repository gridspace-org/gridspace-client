import { Quote, Star } from "lucide-react";
import Image from "next/image";

interface TestimonialProps {
  image: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[...Array(rating)].map((_, i) => (
      <Star
        key={i}
        className="w-4 h-4 text-[var(--color-primary)] fill-current"
      />
    ))}
  </div>
);

const TestimonialCard = ({
  image,
  name,
  role,
  content,
  rating,
}: TestimonialProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm relative overflow-hidden">
    <div className="absolute -top-3 -z-0 -right-3 w-16 h-16 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
      <Quote className="w-8 h-8 text-[var(--color-primary)]" />
    </div>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 min-w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
        <Image
          src={image}
          alt={`${name}'s profile`}
          width={800}
          height={800}
          className="object-cover w-full h-full"
        />
      </div>
      <div>
        <h4 className="font-semibold text-[16px] text-black relative z-10">
          {name}
        </h4>
        <p className="text-xs text-[var(--color-text-muted)]">{role}</p>
      </div>
    </div>
    <p className="text-[var(--color-text-primary)] text-[16px] lg:text-[18px] mb-4">
      {content}
    </p>
    <StarRating rating={rating} />
  </div>
);

const testimonials: TestimonialProps[] = [
  {
    image: "/ttmn1.png",
    name: "Chinedu Okonkwo",
    role: "Freelancer Developer",
    content:
      "Gridspace makes it easy to find reliable workspaces with power and internet. I don’t have to worry about constant disruptions anymore.",
    rating: 5,
  },
  {
    image: "/ttmn2.png",
    name: "Tolani Adeleke",
    role: "Creative",
    content:
      "As a designer, I love the creative vibe of the spaces I book on Gridspace. It’s affordable and keeps me inspired.",
    rating: 5,
  },
  {
    image: "/ttmn3.png",
    name: "Tunde Olukoya",
    role: "Startup Founder",
    content:
      "My team now has a proper office without expensive leases. Gridspace gave us the flexibility we needed to grow",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[var(--color-primary-light)] py-5">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mx-auto mb-[20px] gap-[8px] w-full max-w-[613px] px-4 md:px-0">
          <h2 className="font-bold text-[20px] md:text-[32px] leading-[29px] md:leading-[39px] text-[var(--color-secondary)] text-center">
            What Our Users Say
          </h2>
          <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[var(--color-text-primary)] text-center">
            Join thousands of professionals who trust Gridspace for their
            workspace needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
