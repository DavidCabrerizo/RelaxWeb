import { Waves } from "@/components/brand/Waves";
import { ButtonLink } from "@/components/ui/Button";

/**
 * 404 de la web pública. Se muestra dentro del layout del idioma, así que mantiene
 * cabecera y pie. Los textos van en los dos idiomas porque not-found no recibe params.
 */
export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-40 pt-20 text-center">
        <p className="display text-7xl text-lime sm:text-8xl">404</p>
        <h1 className="display mt-4 text-2xl sm:text-3xl">
          Page introuvable <span className="block text-base font-semibold normal-case text-muted-dark">Page not found</span>
        </h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
          <ButtonLink href="/en" variant="outline">Back to home</ButtonLink>
        </div>
      </div>
      <Waves className="absolute inset-x-0 bottom-0 h-24 w-full" />
    </section>
  );
}
