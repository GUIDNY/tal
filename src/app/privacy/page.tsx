import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "מדיניות הפרטיות של אתר טל ראופמן.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 sm:px-8">
      <h1 className="font-display text-3xl font-bold text-paper">מדיניות פרטיות</h1>
      <div className="mt-8 space-y-5 text-paper-dim leading-relaxed">
        <p>
          פרטים שאתם משאירים בטופס &quot;בדיקת זמינות&quot; (שם, טלפון, אימייל ופרטי האירוע) נשלחים
          ישירות בהודעת וואטסאפ אל טל, ואינם נשמרים כרגע במסד נתונים של האתר.
        </p>
        <p>
          האתר עשוי להשתמש בכלי ניתוח שימוש בסיסיים כדי להבין כיצד מבקרים משתמשים בו, לצורך שיפור
          החוויה בלבד.
        </p>
        <p>
          לשאלות בנוגע לפרטיות ניתן לפנות אלינו במייל:{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-champagne">
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
