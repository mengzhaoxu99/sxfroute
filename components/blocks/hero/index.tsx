import HeroBg from "./bg";
import { Hero as HeroType } from "@/types/blocks/hero";
import { FlightSearch } from "./flight-search";

export default function Hero({ hero }: { hero: HeroType }) {
  if (hero.disabled) {
    return null;
  }

  return (
    <>
      <HeroBg />
      <section className="relative pt-16 pb-12 bg-gradient-to-b from-sky-50/30 via-white to-blue-50/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-sky-50/20 pointer-events-none" />
        <div className="container relative">
          <div id="flight-search-section" className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              海航
              <span
                className="inline-block bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400 bg-clip-text text-transparent"
              >
                随心飞
              </span>
              <span className="text-gray-900"> · 航线搜索</span>
            </h1>
          </div>

          <p className="text-center text-gray-600 mb-8 text-lg sm:text-xl">
            专为海航随心飞用户打造的智能航线规划工具
          </p>

          <div className="mt-8">
            <FlightSearch />
          </div>
        </div>
      </section>
    </>
  );
}
