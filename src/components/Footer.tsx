import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-charcoal-line bg-ink pb-28 pt-16 sm:pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl font-bold text-paper">טל ראופמן</p>
            <p className="mt-1 text-sm text-paper-dim">DJ &amp; Saxophone</p>
          </div>

          <nav aria-label="ניווט בפוטר">
            <ul className="flex flex-col gap-3">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-sm text-paper-dim transition hover:text-champagne">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-paper-dim transition hover:text-champagne"
            >
              Instagram
            </a>
            {siteConfig.social.tiktok && (
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-paper-dim transition hover:text-champagne"
              >
                TikTok
              </a>
            )}
            {siteConfig.social.youtube && (
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-paper-dim transition hover:text-champagne"
              >
                YouTube
              </a>
            )}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-sm text-paper-dim transition hover:text-champagne">
              {siteConfig.contact.email}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-charcoal-line pt-6 text-xs text-paper-dim sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} טל ראופמן. כל הזכויות שמורות.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-champagne">
              מדיניות פרטיות
            </Link>
            <Link href="/accessibility" className="hover:text-champagne">
              הצהרת נגישות
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
