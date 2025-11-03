"use client";

import { trackEvent } from "@/lib/mixpanel";

type ShareButtonsProps = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareTargets = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  function onShareClick(platform: string) {
    trackEvent("Share Click", { platform, url });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      trackEvent("Share Click", { platform: "Copy Link", url });
      // Optional: toast system could be integrated
    } catch {
      // no-op
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        trackEvent("Share Click", { platform: "Web Share", url });
      } catch {
        // user cancelled
      }
    }
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-[#666666] dark:text-[#999999] font-medium">Share:</span>
      {shareTargets.map((t) => (
        <a
          key={t.name}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] underline hover:no-underline transition-colors"
          onClick={() => onShareClick(t.name)}
        >
          {t.name}
        </a>
      ))}
      <button 
        type="button" 
        className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] underline hover:no-underline transition-colors" 
        onClick={copyLink}
      >
        Copy link
      </button>
      {typeof navigator !== "undefined" && (navigator as any).share && (
        <button 
          type="button" 
          className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] underline hover:no-underline transition-colors" 
          onClick={nativeShare}
        >
          Share…
        </button>
      )}
    </div>
  );
}

export default ShareButtons;


