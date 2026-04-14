import { Header } from "@/types/blocks/header";
import { Hero } from "@/types/blocks/hero";
import { Section } from "@/types/blocks/section";
import { Footer } from "@/types/blocks/footer";

export interface LandingPage {
  header?: Header;
  hero?: Hero;
  flightData?: Section;
  faq?: Section;
  footer?: Footer;
}
