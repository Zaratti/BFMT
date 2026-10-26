"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-primary border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-primary-foreground mb-4">{t("brandName")}</h3>
            <p className="text-sm sm:text-base text-primary-foreground/80 mb-6 max-w-md">{t("footerDescription")}</p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-base sm:text-lg font-serif font-semibold text-primary-foreground mb-4">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {t("security")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-base sm:text-lg font-serif font-semibold text-primary-foreground mb-4">
              {t("support")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help-center"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm sm:text-base text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/60 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} {t("brandName")}. {t("allRightsReserved")}
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
              <Link
                href="/privacy-policy"
                className="text-primary-foreground/60 hover:text-primary-foreground text-xs sm:text-sm transition-colors"
              >
                {t("privacyPolicy")}
              </Link>
              <Link
                href="/terms-of-service"
                className="text-primary-foreground/60 hover:text-primary-foreground text-xs sm:text-sm transition-colors"
              >
                {t("termsOfService")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
