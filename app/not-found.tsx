import { NotFound as NotFoundMoment } from "@/components/design-v3/Site";
// tokens load here too: root not-found sits outside the (v3) group, and its
// light sheet loses the cascade otherwise (attr light, room painted dark).
import "@/lib/design-v3/tokens.css";

// The v3 404 moment; the root layout supplies html/body.
export default function NotFound() {
  return <NotFoundMoment />;
}
