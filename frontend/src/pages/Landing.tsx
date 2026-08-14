import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BoltIcon,
  ClockIcon,
  EnvelopeIcon,
  FireIcon,
  PhoneIcon,
  HeartIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { api } from "@/api/client";
import { formatINR } from "@/lib/format";
import { useReveal } from "@/hooks/useReveal";
import { NotchCard } from "@/components/NotchCard";
import { ContactForm } from "@/components/ContactForm";
import {
  CableMachineArt,
  DumbbellArt,
  KettlebellArt,
  PowerRackArt,
  RowerArt,
  TreadmillArt,
} from "@/components/EquipmentArt";
import { StatBadge } from "@/components/StatBadge";
import { Button, ButtonLink } from "@/components/Button";
import { fallbackPlans } from "@/lib/demoPlans";
import type { MembershipPlan } from "@/shared/types";

import hero from "@/assets/HomePageGraphic.webp";
import image1 from "@/assets/image1.webp";
import image2 from "@/assets/image2.webp";
import image3 from "@/assets/image3.webp";
import image4 from "@/assets/image4.webp";
import image5 from "@/assets/image5.webp";
import image6 from "@/assets/image6.webp";

const partners = [
  "Under Armour",
  "Reebok",
  "adidas",
  "PUMA",
  "The North Face",
  "NIKE",
];

const benefits = [
  { icon: FireIcon, label: "Nutrition guidance" },
  { icon: UserGroupIcon, label: "Expert trainers" },
  { icon: BoltIcon, label: "Progress tracking" },
  { icon: TrophyIcon, label: "Premium membership" },
  { icon: HeartIcon, label: "Community support" },
  { icon: SparklesIcon, label: "Next-level facilities" },
];

const programmes = [
  { name: "Barbell Basics", image: image1 },
  { name: "Kettlebell Masterclass", image: image2 },
  { name: "Cardio Power Boost", image: image3 },
  { name: "Hypertrophy", image: image4 },
  { name: "Rope Climbing", image: image5 },
  { name: "TRX Suspension", image: image6 },
];

const trainers = [
  { name: "Blake Hunter", focus: "Strength & Powerlifting", image: image2 },
  { name: "Liam Crossfit", focus: "Conditioning & HIIT", image: image4 },
  { name: "Logan Torque", focus: "Olympic Lifting", image: image6 },
];

/* ------------------------------------------------------------------ Hero */

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      {/* Lime bloom behind the subject, kept low so the headline stays legible. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-16 h-[560px] w-[880px] -translate-x-1/2 rounded-full bg-lime/[0.09] blur-[140px]"
      />

      <div className="shell relative">
        <h1 className="h-display mx-auto max-w-4xl text-center">
          Forge Your Strength,
          <br />
          <span className="text-lime">Elevate Every Day</span>
        </h1>

        {/* The figure sits over the headline and the badges orbit it — the
            layering is what gives this hero its depth. */}
        <div className="relative mx-auto -mt-6 max-w-md sm:-mt-12 md:-mt-16">
          <img
            src={hero}
            alt="An EvoGym member mid-session"
            className="fade-base duotone relative z-10 mx-auto w-full object-contain"
          />

          <StatBadge
            icon={ClockIcon}
            label="Hours"
            value="1.5"
            className="absolute left-0 top-[22%] z-20 sm:-left-10"
          />
          <StatBadge
            icon={BoltIcon}
            label="Points"
            value="20"
            className="absolute right-0 top-[16%] z-20 sm:-right-8"
          />
          <StatBadge
            icon={FireIcon}
            label="Kcal"
            value="550"
            className="absolute -left-2 top-[58%] z-20 sm:-left-16"
          />
          <StatBadge
            icon={SparklesIcon}
            label="Steps"
            value="8.4k"
            tone="dark"
            className="absolute -right-2 top-[62%] z-20 sm:-right-14"
          />
        </div>

        <div className="relative z-20 -mt-8 flex flex-col items-center justify-between gap-8 sm:-mt-14 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {["A", "R", "M", "S"].map((initial, index) => (
                <span
                  key={initial}
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 border-void text-sm font-bold ${
                    index % 2 === 0 ? "bg-lime text-void" : "bg-ink-700 text-bone"
                  }`}
                >
                  {initial}
                </span>
              ))}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-bone">12k+</p>
              <p className="text-sm text-ash-400">Happy members</p>
            </div>
          </div>

          <ButtonLink to="/membership" size="lg">
            Let&apos;s Start
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Partner strip */

function Partners() {
  return (
    <section className="border-y border-line/60 py-8">
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-16 pr-16">
          {[...partners, ...partners].map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="whitespace-nowrap text-lg font-bold uppercase tracking-wide text-ash-500/70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Benefits */

function Benefits() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Inspired to
            <br />
            <span className="text-lime">Inspire Your Best Self</span>
          </h2>
          <p className="lede mt-5">
            We&apos;re your partner in achieving a healthier, stronger and more
            confident you.
          </p>
        </div>

        <NotchCard className="mt-14">
          <div className="grid items-center gap-10 p-8 sm:p-12 md:grid-cols-[1.1fr_0.9fr]">
            <ul className="grid gap-x-8 gap-y-6 xs:grid-cols-2">
              {benefits.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime/15">
                    <Icon className="h-4 w-4 text-lime" />
                  </span>
                  <span className="text-sm font-semibold text-bone">{label}</span>
                </li>
              ))}
            </ul>

            <div className="group relative overflow-hidden rounded-2xl">
              <img
                src={image4}
                alt=""
                loading="lazy"
                className="duotone h-64 w-full object-cover"
              />
            </div>
          </div>
        </NotchCard>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Programmes */

function Programmes() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="programmes" ref={ref} className="reveal scroll-mt-24 py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Train Smarter,
            <br />
            <span className="text-lime">Unleash Your Potential</span>
          </h2>
          <p className="lede mt-5">
            Expertly designed sessions, tailored to help you get more out of
            every hour on the floor.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {programmes.map((programme) => (
            <article key={programme.name} className="group">
              <NotchCard className="!rounded-[1.5rem]">
                <img
                  src={programme.image}
                  alt={programme.name}
                  loading="lazy"
                  className="duotone h-64 w-full object-cover"
                />
              </NotchCard>
              <h3 className="mt-4 text-base font-bold text-bone transition-colors group-hover:text-lime">
                {programme.name}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Equipment */

const equipment = [
  {
    name: "Power racks",
    count: "12 stations",
    detail:
      "Competition-spec uprights with safety arms, so you can push a heavy single without a spotter.",
    Art: PowerRackArt,
  },
  {
    name: "Free weights",
    count: "2.5–60 kg",
    detail:
      "Rubber hex dumbbells in 2.5 kg steps, plus calibrated plates accurate to 10 grams.",
    Art: DumbbellArt,
  },
  {
    name: "Kettlebells",
    count: "8–48 kg",
    detail:
      "Cast single-piece bells with a wide handle — swings, cleans and Turkish get-ups.",
    Art: KettlebellArt,
  },
  {
    name: "Treadmills",
    count: "10 units",
    detail:
      "Slat-belt treadmills with a 15% incline range, spaced so nobody is running elbow to elbow.",
    Art: TreadmillArt,
  },
  {
    name: "Rowers & bikes",
    count: "14 units",
    detail:
      "Air rowers and assault bikes on their own conditioning floor, away from the lifting area.",
    Art: RowerArt,
  },
  {
    name: "Cable machines",
    count: "6 towers",
    detail:
      "Dual adjustable pulleys for everything from face pulls to loaded carries and rehab work.",
    Art: CableMachineArt,
  },
];

function Equipment() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="equipment" ref={ref} className="reveal scroll-mt-24 py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Kit That Holds Up,
            <br />
            <span className="text-lime">Session After Session</span>
          </h2>
          <p className="lede mt-5">
            Enough stations that 6pm doesn&apos;t turn into a queue, and gear
            that&apos;s serviced monthly rather than when it breaks.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {equipment.map(({ name, count, detail, Art }) => (
            <article key={name} className="group">
              <NotchCard className="h-full">
                <div className="flex h-full flex-col p-7">
                  <div className="art h-28 w-full">
                    <Art />
                  </div>

                  <div className="mt-5 flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-extrabold text-bone transition-colors group-hover:text-lime">
                      {name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-lime/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-lime">
                      {count}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-ash-400">
                    {detail}
                  </p>
                </div>
              </NotchCard>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ash-500">
          Every machine is serviced monthly and logged.{" "}
          <Link to="/#contact" className="text-lime underline underline-offset-4">
            Book a walkthrough
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Plans */

function Plans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useReveal<HTMLElement>();

  useEffect(() => {
    let cancelled = false;
    api.memberships
      .list()
      .then((data) => {
        if (!cancelled) setPlans(data?.length ? data : fallbackPlans());
      })
      .catch(() => {
        if (!cancelled) setPlans(fallbackPlans());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only disappear once we know there is genuinely nothing to show, so the
  // section never blinks out and leaves a hole mid-page.
  if (!loading && plans.length === 0) return null;

  // The middle option carries the lime treatment — it's the one most people
  // should land on.
  const featuredIndex = Math.min(1, plans.length - 1);

  return (
    <section ref={ref} className="reveal py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Discover
            <br />
            <span className="text-lime">What Sets Us Apart</span>
          </h2>
          <p className="lede mt-5">
            One membership, every programme. Commit for longer and the monthly
            cost comes down.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-[340px] animate-pulse rounded-[1.75rem] border border-line bg-ink-800/60"
              />
            ))}

          {plans.map((plan, index) => {
            const featured = index === featuredIndex;
            const months = Math.max(1, Math.round(plan.durationDays / 30));

            return (
              <div key={plan.id} className="relative">
                <div
                  aria-hidden="true"
                  className="notch-flag absolute right-0 top-0 z-10 h-[2.4rem] w-[2.4rem] bg-lime"
                />
                <article
                  className={[
                    "notch flex h-full flex-col rounded-[1.75rem] border p-7 transition-colors duration-300",
                    featured
                      ? "border-lime/40 bg-lime/[0.08]"
                      : "border-line bg-ink-800 hover:border-ink-600",
                  ].join(" ")}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime">
                    <TrophyIcon className="h-5 w-5 text-void" />
                  </span>

                  <h3 className="mt-5 text-xl font-extrabold text-bone">
                    {plan.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ash-400">
                    {plan.description ?? `${months} month commitment`}
                  </p>

                  <p className="mt-6 text-3xl font-extrabold tracking-tight text-bone">
                    {formatINR(plan.price)}
                  </p>
                  <p className="mt-1 text-xs text-ash-500">
                    {formatINR(plan.price / months)} / month · {plan.durationDays}{" "}
                    days
                  </p>

                  <div className="mt-6">
                    <ButtonLink
                      to="/membership"
                      size="sm"
                      variant={featured ? "primary" : "outline"}
                      className="w-full"
                    >
                      See Plan
                    </ButtonLink>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Experience */

function Experience() {
  const ref = useReveal<HTMLElement>();

  const cards = [
    {
      title: "Endurance Evolution",
      body: "Boost your stamina and resilience with tailored cardio and endurance work designed to keep you moving stronger for longer.",
      image: image5,
      metric: { label: "BPM", value: "95", icon: HeartIcon },
    },
    {
      title: "Speed Surge",
      body: "Build agility and explosiveness with high-intensity sprint and movement drills built to take your performance up a level.",
      image: image3,
      metric: { label: "Steps", value: "1024", icon: BoltIcon },
    },
  ];

  return (
    <section ref={ref} className="reveal py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Experience
            <br />
            <span className="text-lime">Fitness Like Never Before</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {cards.map((card, index) => {
            const Icon = card.metric.icon;
            return (
              <NotchCard key={card.title} className={index === 1 ? "md:mt-14" : ""}>
                <div className="group relative">
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    className="duotone h-72 w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/40 to-transparent"
                  />
                  {/* Metric chip overlapping the photo edge. */}
                  <div className="absolute bottom-4 right-4 rounded-2xl border border-line bg-ink-900/90 px-4 py-3 backdrop-blur">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-lime" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ash-400">
                        {card.metric.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xl font-extrabold leading-none text-bone">
                      {card.metric.value}
                    </p>
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-extrabold text-lime">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ash-400">
                    {card.body}
                  </p>
                  <div className="mt-6">
                    <ButtonLink to="/membership" size="sm" variant="dark">
                      Read More
                    </ButtonLink>
                  </div>
                </div>
              </NotchCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Trainers */

function Trainers() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="trainers" ref={ref} className="reveal scroll-mt-24 py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Your Fitness Goals,
            <br />
            <span className="text-lime">Their Expertise</span>
          </h2>
          <p className="lede mt-5">
            Certified coaches on the floor at every hour we&apos;re open —
            spotting, not upselling.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {trainers.map((trainer) => (
            <article key={trainer.name} className="group text-center">
              <NotchCard className="!rounded-[1.5rem]">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  loading="lazy"
                  className="duotone h-80 w-full object-cover"
                />
              </NotchCard>
              <h3 className="mt-4 text-base font-bold text-bone transition-colors group-hover:text-lime">
                {trainer.name}
              </h3>
              <p className="mt-1 text-sm text-ash-500">{trainer.focus}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Testimonial */

function Testimonial() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Your Success
            <br />
            <span className="text-lime">Stories, Our Inspiration</span>
          </h2>
        </div>

        <NotchCard className="mt-14">
          <div className="grid items-center gap-8 md:grid-cols-[0.85fr_1.15fr]">
            <img
              src={image1}
              alt=""
              loading="lazy"
              className="duotone h-full max-h-[420px] w-full object-cover"
            />

            <blockquote className="p-8 sm:p-12">
              <div className="flex gap-1" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} className="h-4 w-4 text-lime" />
                ))}
              </div>
              <p className="mt-6 text-lg leading-relaxed text-bone">
                &ldquo;I love the variety here. Whether it&apos;s HIIT, mobility
                or strength work, there&apos;s always something new to try — and
                the progress tracking genuinely keeps me showing up.&rdquo;
              </p>
              <footer className="mt-6">
                <p className="font-bold text-lime">James T.</p>
                <p className="text-sm text-ash-500">Member since 2023</p>
              </footer>
            </blockquote>
          </div>
        </NotchCard>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Contact */

function ContactSection() {
  const ref = useReveal<HTMLElement>();

  const details = [
    { icon: EnvelopeIcon, label: "Email", value: "hello@evogym.example" },
    { icon: PhoneIcon, label: "Phone", value: "+91 00000 00000" },
    { icon: ClockIcon, label: "Open", value: "05:00 – 23:00, seven days" },
  ];

  return (
    <section id="contact" ref={ref} className="reveal scroll-mt-24 py-14 sm:py-20">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="h-section">
            Ready When
            <br />
            <span className="text-lime">You Are</span>
          </h2>
          <p className="lede mt-5">
            Leave your email and a coach will get in touch — usually the same
            day, and always within one working day.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl border border-line bg-ink-800 px-6 py-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime/15">
                  <Icon className="h-5 w-5 text-lime" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ash-500">
                    {label}
                  </p>
                  <p className="mt-1 font-semibold text-bone">{value}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-line bg-ink-900 px-6 py-5">
              <p className="text-sm leading-relaxed text-ash-400">
                Prefer the full form?{" "}
                <Link to="/contact" className="text-lime underline underline-offset-4">
                  Open the contact page
                </Link>
                .
              </p>
            </div>
          </div>

          <NotchCard>
            <div className="p-8 sm:p-10">
              <ContactForm compact />
            </div>
          </NotchCard>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Final CTA */

function JoinCta() {
  const ref = useReveal<HTMLElement>();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  const join = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      // Same enquiry endpoint as the contact page; the name is derived from
      // the address since this short form only asks for an email.
      await api.contact.create({
        name: email.split("@")[0],
        email,
        message: "Signed up via the landing page join form.",
      });
      setEmail("");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section ref={ref} className="reveal pb-24 pt-8">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-lime px-6 py-16 text-center sm:px-12">
          <h2 className="text-[clamp(1.9rem,4.6vw,3.5rem)] font-extrabold leading-tight tracking-tightest text-void">
            Connect. Engage. Transform.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-void/70">
            Join a community built for motivation, engagement, shared progress
            and real transformation.
          </p>

          <form
            className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 xs:flex-row"
            onSubmit={join}
          >
            <label htmlFor="join-email" className="sr-only">
              Email address
            </label>
            <input
              id="join-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email"
              className="flex-1 rounded-full border border-void/15 bg-void/5 px-5 py-3.5 text-void placeholder:text-void/45 focus:outline-none focus:ring-2 focus:ring-void/40"
            />
            <Button
              type="submit"
              variant="dark"
              disabled={status === "sending"}
              className="!bg-void !text-lime hover:!bg-ink-900"
            >
              {status === "sending" ? "Sending…" : "Join Now"}
            </Button>
          </form>

          {status === "done" && (
            <p
              role="status"
              className="mt-5 text-sm font-semibold text-void"
            >
              Thanks — our team will contact you within one working day.
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="mt-5 text-sm font-semibold text-void">
              That didn&apos;t send. Try the{" "}
              <Link to="/contact" className="underline">
                contact page
              </Link>{" "}
              instead.
            </p>
          )}

          <p className="mt-4 text-xs text-void/60">
            Already convinced?{" "}
            <Link to="/register" className="font-bold underline">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Hero />
      <Partners />
      <Benefits />
      <Programmes />
      <Equipment />
      <Plans />
      <Experience />
      <Trainers />
      <Testimonial />
      <ContactSection />
      <JoinCta />
    </>
  );
}
