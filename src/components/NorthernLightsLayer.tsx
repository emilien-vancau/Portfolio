"use client";

import NorthernLights from "@/components/NorthernLights";

export default function NorthernLightsLayer() {
  return (
    <NorthernLights
      className="pointer-events-none"
      speed={undefined}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        aspectRatio: "auto",
      }}
    />
  );
}