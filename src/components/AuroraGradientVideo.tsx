import { assetPaths } from "@/lib/assets";
import { withBase } from "@/lib/paths";

/**
 * Aurora Gradient — video playback
 * ---------------------------------
 * Même principe que FlowGradientVideo.tsx : aucun calcul en navigateur, le
 * gradient est pré-rendu une fois hors-ligne (render-aurora-gradient-video.mjs)
 * et ce composant se contente de lire un <video loop> qui décode/boucle un
 * fichier statique — coût quasi nul, généralement accéléré matériellement.
 *
 * Deux différences avec le flow gradient :
 *
 * 1. Deux <source> au lieu d'une : le premier (.webm, VP9 + canal alpha)
 *    porte la vraie transparence — Chrome, Edge et Firefox le lisent tel
 *    quel, ciel transparent compris. Le navigateur qui ne sait pas décoder
 *    ce format (notamment Safari) passe automatiquement au second
 *    (.mp4, opaque, aplati sur `fallbackBackground` au moment du rendu) :
 *    c'est le comportement natif du tag <video>, rien à coder pour ça.
 *
 * 2. La prop `opacity` : la couche voit déjà à travers grâce à son alpha
 *    natif, mais ce réglage permet d'atténuer encore l'ensemble pour laisser
 *    davantage transparaître ce qu'il y a derrière (ex. un StarField, ou le
 *    contenu du Hero).
 */

interface AuroraGradientProps {
  /** 0 (invisible) à 1 (pleine intensité). Défaut : 1. */
  opacity?: number;
}

export default function AuroraGradient({ opacity = 1 }: AuroraGradientProps = {}) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      className="aurora-gradient"
      style={{ opacity }}
      // preload="auto" starts fetching the file immediately so it's ready
      // to play as soon as the component mounts.
      preload="auto"
    >
      <source src={withBase(assetPaths.auroraGradientVideoMp4)} type="video/mp4" />
      <source src={withBase(assetPaths.auroraGradientVideoWebm)} type="video/webm" />
    </video>
  );
}