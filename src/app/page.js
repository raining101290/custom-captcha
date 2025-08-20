'use client'

import { HumanCaptcha } from "./components/HumanCaptcha";

// --------------------------- Main Component --------------------------------
export default function CaptchaDemoApp() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#02295d]">
      <div className="w-full max-w-3xl">
        <HumanCaptcha />
      </div>
    </div>
  );
}
