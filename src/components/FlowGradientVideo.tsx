/**
 * Flow Gradient — video playback
 * --------------------------------
 * Replaces all in-browser computation (canvas rendering, worker, cache)
 * with a plain looping <video>. The gradient is pre-rendered once, offline,
 * with render-flow-gradient-video.mjs — the browser only ever has to
 * decode and loop a video file, which is extremely cheap (usually
 * hardware-accelerated) and never blocks user interactions.
 *
 * Navigating between pages no longer triggers any recomputation either:
 * this is just a static asset, like an image.
 */

export default function FlowGradient() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      className="flow-gradient"
      // preload="auto" starts fetching the file immediately so it's ready
      // to play as soon as the component mounts.
      preload="auto"
    >
      <source src="/gradients/flow-gradient-loop.mp4" type="video/mp4" />
    </video>
  );
}