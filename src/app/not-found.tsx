import { withBase } from "@/lib/paths";

export default function NotFound() {
  return (
    <div className="theme-pro flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-4xl font-semibold text-[#152451]">404</h1>
      <p className="text-[#4a5578]">This page does not exist.</p>
      <a href={withBase("/")} className="text-[#2d3085] underline">Back to home</a>
    </div>
  );
}