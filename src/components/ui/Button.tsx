import Link from "next/link";

type Variant = "primary" | "outline" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-lime text-ink hover:bg-lime-soft hover:shadow-glow",
  outline:
    "border border-lime text-lime hover:bg-lime hover:text-ink",
  ghost: "text-paper hover:text-lime",
};

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold uppercase tracking-wider transition duration-200";

type Props = {
  href: string;
  variant?: Variant;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
};

export function ButtonLink({ href, variant = "primary", children, external, className = "" }: Props) {
  const cls = `${base} ${styles[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
