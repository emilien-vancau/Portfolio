import { assetPaths } from "@/lib/assets";
import { withBase } from "@/lib/paths";

export default function NorthernLightsVideo() {
  return (
    <video
      autoPlay muted loop playsInline preload="auto" aria-hidden="true"
      className="aurora-gradient"
      poster={withBase(assetPaths.northernLightsPoster)}
    >
      <source src={withBase(assetPaths.northernLightsVideo)} type="video/mp4" />
    </video>
  );
}