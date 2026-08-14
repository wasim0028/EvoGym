import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[75vh] place-items-center py-32 text-center">
      <div>
        <p className="text-7xl font-extrabold tracking-tightest text-lime">404</p>
        <h1 className="h-section mt-5">Nothing to train here</h1>
        <p className="mx-auto mt-4 max-w-sm text-ash-400">
          That page doesn&apos;t exist. The training floor is this way.
        </p>
        <div className="mt-8">
          <ButtonLink to="/">Back to home</ButtonLink>
        </div>
      </div>
    </div>
  );
}
