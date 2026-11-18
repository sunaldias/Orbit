import { permanentRedirect } from "next/navigation";

export default function LegacyWorkRedirect() {
  permanentRedirect("/portfolio");
}
