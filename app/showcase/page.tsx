import { ShowcaseSeoContent } from "../components/SeoContent";
import { ShowcaseClient } from "./ShowcaseClient";

export default function ShowcasePage() {
  return <ShowcaseClient seoSlot={<ShowcaseSeoContent />} />;
}
