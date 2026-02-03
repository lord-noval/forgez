import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { defaultLocale, isValidLocale, LOCALE_COOKIE } from "@/i18n/config";

export async function middleware(request: NextRequest) {
  // First, handle Supabase session
  const response = await updateSession(request);

  // Get locale from cookie or Accept-Language header
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (!cookieLocale || !isValidLocale(cookieLocale)) {
    // Try to detect locale from Accept-Language header
    const acceptLanguage = request.headers.get("accept-language");
    let detectedLocale = defaultLocale;

    if (acceptLanguage) {
      // Parse Accept-Language header and find first matching locale
      const languages = acceptLanguage.split(",").map((lang) => {
        const [code] = lang.trim().split(";");
        return code.split("-")[0].toLowerCase();
      });

      for (const lang of languages) {
        if (isValidLocale(lang)) {
          detectedLocale = lang;
          break;
        }
      }
    }

    // Set the locale cookie if not already set
    response.cookies.set(LOCALE_COOKIE, detectedLocale, {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
