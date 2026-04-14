import Hero from "@/components/blocks/hero";
import FAQ from "@/components/blocks/faq";
import { FlightDataTable } from "@/components/blocks/flight-data-table";
import { Disclaimer } from "@/components/blocks/hero/disclaimer";
import { getLandingPage } from "@/services/landing";
import { localeUrlPath } from "@/i18n/locale";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return {
    alternates: {
      canonical: localeUrlPath(locale, "/"),
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const page = await getLandingPage(locale);

  return (
    <>
      {page.hero && <Hero hero={page.hero} />}
      {page.flightData && (
        <section id="flight-data" className="pt-4 pb-6 lg:pt-6 lg:pb-8">
          <div className="container">
            <div className="text-center mb-6">
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                {page.flightData.title}
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                {page.flightData.description}
              </p>
            </div>
            <FlightDataTable />
          </div>
        </section>
      )}
      {page.faq && <FAQ section={page.faq} />}
      {/* 移动端：在FAQ之后显示免责声明 */}
      <div className="block sm:hidden">
        <section className="py-8">
          <div className="container">
            <Disclaimer />
          </div>
        </section>
      </div>
    </>
  );
}
