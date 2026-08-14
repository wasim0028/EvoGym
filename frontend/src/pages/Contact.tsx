import {
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import { NotchCard } from "@/components/NotchCard";
import { ContactForm } from "@/components/ContactForm";

const details = [
  { icon: EnvelopeIcon, label: "Email", value: "hello@evogym.example" },
  { icon: PhoneIcon, label: "Phone", value: "+91 00000 00000" },
  { icon: ClockIcon, label: "Open", value: "05:00 – 23:00, seven days" },
  { icon: MapPinIcon, label: "Find us", value: "Add your street address here" },
];

export default function Contact() {
  return (
    <div className="pt-32 sm:pt-40">
      <div className="shell pb-20 sm:pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Contact</p>
          <h1 className="h-section mt-4">
            Talk to Us,
            <br />
            <span className="text-lime">We&apos;ll Come Back to You</span>
          </h1>
          <p className="lede mt-5">
            Leave your email and a coach will get in touch — usually the same
            day, and always within one working day.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-[1fr_1.1fr]">
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
                Prefer to just turn up? Walk-ins are welcome any time
                we&apos;re open — ask at the desk for a free trial session.
              </p>
            </div>
          </div>

          <NotchCard>
            <div className="p-8 sm:p-10">
              <ContactForm />
            </div>
          </NotchCard>
        </div>
      </div>
    </div>
  );
}
