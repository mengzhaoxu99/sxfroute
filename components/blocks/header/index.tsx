import { Header as HeaderType } from "@/types/blocks/header";

export default function Header({ header }: { header: HeaderType }) {
  if (header.disabled) {
    return null;
  }

  return (
    <section className="py-3">
      <div className="md:max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2">
          {header.brand?.logo?.src && (
            <a href={header.brand?.url || "/"} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={header.brand.logo.src}
                alt={header.brand.logo.alt || header.brand.title || ""}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              {header.brand?.title && (
                <span className="text-xl sm:text-2xl text-primary font-bold">
                  {header.brand.title}
                </span>
              )}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
