import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של אתר טל ראופמן.",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-paper">הצהרת נגישות</h1>
      <div className="mt-8 space-y-5 text-paper-dim leading-relaxed">
        <p>
          אנו שואפים לכך שאתר זה יהיה נגיש לכלל המשתמשים, לרבות אנשים עם מוגבלויות, ופועלים
          בהתאם לעקרונות ה-WCAG במידת האפשר: ניווט מלא במקלדת, תיאורי טקסט חלופיים לתמונות,
          ניגודיות צבעים נאותה, ותמיכה בהעדפת &quot;פחות תנועה&quot; (reduced motion).
        </p>
        <p>
          נתקלתם בבעיית נגישות באתר? נשמח שתדווחו לנו כדי שנוכל לטפל בכך:{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-champagne">
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
