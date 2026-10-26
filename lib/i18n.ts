export type Language = "en" | "fr" | "es" | "ar" | "zh" | "ha"

export const languages: Record<Language, { name: string; flag: string; rtl?: boolean }> = {
  en: { name: "English", flag: "🇬🇧" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  ar: { name: "العربية", flag: "🇸🇦", rtl: true },
  zh: { name: "中文", flag: "🇨🇳" },
  ha: { name: "Hausa", flag: "🇳🇬" },
}

export const translations = {
  en: {
    // Brand
    brandName: "Bifimoto",

    // Navigation
    home: "Home",
    features: "Features",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
    dashboard: "Dashboard",
    signIn: "Sign In",
    signUp: "Sign Up",

    // Hero Section
    heroTitle: "Trade Smarter with",
    heroTitleBrand: "Bifimoto Exchange",
    heroDescription:
      "Explore digital assets, review fees and order details, and keep your activity easy to find in one place.",
    getStarted: "Get Started",
    learnMore: "Learn More",

    // Features Section
    featuresTitle: "Everything You Need to Succeed",
    featuresDescription: "Powerful features designed to help you trade cryptocurrencies more effectively and securely.",

    // Dashboard
    buyAssets: "Buy Assets",
    sellAssets: "Sell Assets",
    transactions: "Transactions",
    settings: "Settings",
    wallet: "Wallet",
    profile: "Profile",
    logout: "Logout",

    // Buy/Sell
    selectAsset: "Select Asset",
    amount: "Amount",
    transactionFee: "Transaction Fee",
    totalAmount: "Total Amount",
    ngnEquivalent: "NGN Equivalent",
    minimumBuy: "Minimum purchase amount is $5.00",
    minimumSell: "Minimum sell amount is $4.00",
    approvePurchase: "Approve Purchase",
    proceedToPayout: "Done - Proceed to Payout",

    // Footer
    footerDescription:
      "Explore digital assets, review order details, and keep your account activity organized in one place.",
    quickLinks: "Quick Links",
    support: "Support",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    security: "Security",
    helpCenter: "Help Center",
    allRightsReserved: "All rights reserved.",

    // Common
    cancel: "Cancel",
    save: "Save",
    submit: "Submit",
    loading: "Loading...",
    error: "Error",
    success: "Success",
  },
  fr: {
    // Brand
    brandName: "Bifimoto",

    // Navigation
    home: "Accueil",
    features: "Fonctionnalités",
    pricing: "Tarification",
    about: "À propos",
    contact: "Contact",
    dashboard: "Tableau de bord",
    signIn: "Se connecter",
    signUp: "S'inscrire",

    // Hero Section
    heroTitle: "Tradez plus intelligemment avec",
    heroTitleBrand: "Bifimoto Exchange",
    heroDescription:
      "Découvrez le trading de cryptomonnaies transparent avec des transactions instantanées, des taux compétitifs et une sécurité bancaire. Rejoignez des milliers de traders qui font confiance à Bifimoto.",
    getStarted: "Commencer",
    learnMore: "En savoir plus",

    // Features Section
    featuresTitle: "Tout ce dont vous avez besoin pour réussir",
    featuresDescription:
      "Des fonctionnalités puissantes conçues pour vous aider à trader les cryptomonnaies plus efficacement et en toute sécurité.",

    // Dashboard
    buyAssets: "Acheter des actifs",
    sellAssets: "Vendre des actifs",
    transactions: "Transactions",
    settings: "Paramètres",
    wallet: "Portefeuille",
    profile: "Profil",
    logout: "Déconnexion",

    // Buy/Sell
    selectAsset: "Sélectionner un actif",
    amount: "Montant",
    transactionFee: "Frais de transaction",
    totalAmount: "Montant total",
    ngnEquivalent: "Équivalent NGN",
    minimumBuy: "Le montant minimum d'achat est de 5,00 $",
    minimumSell: "Le montant minimum de vente est de 4,00 $",
    approvePurchase: "Approuver l'achat",
    proceedToPayout: "Terminé - Procéder au paiement",

    // Footer
    footerDescription:
      "Votre plateforme de confiance pour le trading de cryptomonnaies transparent avec des taux compétitifs et des transactions sécurisées.",
    quickLinks: "Liens rapides",
    support: "Assistance",
    legal: "Juridique",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d'utilisation",
    security: "Sécurité",
    helpCenter: "Centre d'aide",
    allRightsReserved: "Tous droits réservés.",

    // Common
    cancel: "Annuler",
    save: "Enregistrer",
    submit: "Soumettre",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
  },
  es: {
    // Brand
    brandName: "Bifimoto",

    // Navigation
    home: "Inicio",
    features: "Características",
    pricing: "Precios",
    about: "Acerca de",
    contact: "Contacto",
    dashboard: "Panel",
    signIn: "Iniciar sesión",
    signUp: "Registrarse",

    // Hero Section
    heroTitle: "Opera más inteligentemente con",
    heroTitleBrand: "Bifimoto Exchange",
    heroDescription:
      "Experimenta el trading de criptomonedas sin problemas con transacciones instantáneas, tasas competitivas y seguridad bancaria. Únete a miles de traders que confían en Bifimoto.",
    getStarted: "Comenzar",
    learnMore: "Saber más",

    // Features Section
    featuresTitle: "Todo lo que necesitas para tener éxito",
    featuresDescription:
      "Características poderosas diseñadas para ayudarte a operar criptomonedas de manera más efectiva y segura.",

    // Dashboard
    buyAssets: "Comprar activos",
    sellAssets: "Vender activos",
    transactions: "Transacciones",
    settings: "Configuración",
    wallet: "Billetera",
    profile: "Perfil",
    logout: "Cerrar sesión",

    // Buy/Sell
    selectAsset: "Seleccionar activo",
    amount: "Cantidad",
    transactionFee: "Tarifa de transacción",
    totalAmount: "Cantidad total",
    ngnEquivalent: "Equivalente NGN",
    minimumBuy: "El monto mínimo de compra es $5.00",
    minimumSell: "El monto mínimo de venta es $4.00",
    approvePurchase: "Aprobar compra",
    proceedToPayout: "Listo - Proceder al pago",

    // Footer
    footerDescription:
      "Tu plataforma de confianza para el trading de criptomonedas sin problemas con tasas competitivas y transacciones seguras.",
    quickLinks: "Enlaces rápidos",
    support: "Soporte",
    legal: "Legal",
    privacyPolicy: "Política de privacidad",
    termsOfService: "Términos de servicio",
    security: "Seguridad",
    helpCenter: "Centro de ayuda",
    allRightsReserved: "Todos los derechos reservados.",

    // Common
    cancel: "Cancelar",
    save: "Guardar",
    submit: "Enviar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
  },
  ar: {
    // Brand
    brandName: "Bifimoto",

    // Navigation
    home: "الرئيسية",
    features: "المميزات",
    pricing: "الأسعار",
    about: "حول",
    contact: "اتصل",
    dashboard: "لوحة التحكم",
    signIn: "تسجيل الدخول",
    signUp: "التسجيل",

    // Hero Section
    heroTitle: "تداول بذكاء مع",
    heroTitleBrand: "Bifimoto Exchange",
    heroDescription:
      "استمتع بتداول العملات المشفرة السلس مع معاملات فورية وأسعار تنافسية وأمان على مستوى البنوك. انضم إلى آلاف المتداولين الذين يثقون في Bifimoto.",
    getStarted: "ابدأ الآن",
    learnMore: "اعرف المزيد",

    // Features Section
    featuresTitle: "كل ما تحتاجه للنجاح",
    featuresDescription: "ميزات قوية مصممة لمساعدتك على تداول العملات المشفرة بشكل أكثر فعالية وأمانًا.",

    // Dashboard
    buyAssets: "شراء الأصول",
    sellAssets: "بيع الأصول",
    transactions: "المعاملات",
    settings: "الإعدادات",
    wallet: "المحفظة",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",

    // Buy/Sell
    selectAsset: "اختر الأصل",
    amount: "المبلغ",
    transactionFee: "رسوم المعاملة",
    totalAmount: "المبلغ الإجمالي",
    ngnEquivalent: "ما يعادل NGN",
    minimumBuy: "الحد الأدنى لمبلغ الشراء هو 5.00 دولار",
    minimumSell: "الحد الأدنى لمبلغ البيع هو 4.00 دولار",
    approvePurchase: "الموافقة على الشراء",
    proceedToPayout: "تم - المتابعة إلى الدفع",

    // Footer
    footerDescription: "منصتك الموثوقة لتداول العملات المشفرة السلس مع أسعار تنافسية ومعاملات آمنة.",
    quickLinks: "روابط سريعة",
    support: "الدعم",
    legal: "قانوني",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    security: "الأمان",
    helpCenter: "مركز المساعدة",
    allRightsReserved: "جميع الحقوق محفوظة.",

    // Common
    cancel: "إلغاء",
    save: "حفظ",
    submit: "إرسال",
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجاح",
  },
  zh: {
    // Brand
    brandName: "Bifimoto",

    // Navigation
    home: "首页",
    features: "功能",
    pricing: "定价",
    about: "关于",
    contact: "联系",
    dashboard: "仪表板",
    signIn: "登录",
    signUp: "注册",

    // Hero Section
    heroTitle: "更智能地交易",
    heroTitleBrand: "Bifimoto Exchange",
    heroDescription: "体验无缝的加密货币交易，即时交易、有竞争力的费率和银行级安全性。加入数千名信任Bifimoto的交易者。",
    getStarted: "开始使用",
    learnMore: "了解更多",

    // Features Section
    featuresTitle: "成功所需的一切",
    featuresDescription: "强大的功能旨在帮助您更有效、更安全地交易加密货币。",

    // Dashboard
    buyAssets: "购买资产",
    sellAssets: "出售资产",
    transactions: "交易",
    settings: "设置",
    wallet: "钱包",
    profile: "个人资料",
    logout: "登出",

    // Buy/Sell
    selectAsset: "选择资产",
    amount: "金额",
    transactionFee: "交易费",
    totalAmount: "总金额",
    ngnEquivalent: "NGN等值",
    minimumBuy: "最低购买金额为$5.00",
    minimumSell: "最低出售金额为$4.00",
    approvePurchase: "批准购买",
    proceedToPayout: "完成 - 继续付款",

    // Footer
    footerDescription: "您值得信赖的平台，提供无缝的加密货币交易、有竞争力的费率和安全的交易。",
    quickLinks: "快速链接",
    support: "支持",
    legal: "法律",
    privacyPolicy: "隐私政策",
    termsOfService: "服务条款",
    security: "安全",
    helpCenter: "帮助中心",
    allRightsReserved: "版权所有。",

    // Common
    cancel: "取消",
    save: "保存",
    submit: "提交",
    loading: "加载中...",
    error: "错误",
    success: "成功",
  },
  ha: {
    // Brand
    brandName: "Bifimoto",

    // Navigation
    home: "Gida",
    features: "Fasaloli",
    pricing: "Farashi",
    about: "Game da mu",
    contact: "Tuntuɓi",
    dashboard: "Dashboard",
    signIn: "Shiga",
    signUp: "Yi rajista",

    // Hero Section
    heroTitle: "Yi ciniki da wayo tare da",
    heroTitleBrand: "Bifimoto Exchange",
    heroDescription:
      "Sami ƙwarewar cinikin cryptocurrency mai sauƙi tare da ma'amaloli nan take, ƙimar gasa, da tsaron banki. Shiga dubban 'yan kasuwa waɗanda suka amince da Bifimoto.",
    getStarted: "Fara",
    learnMore: "Ƙara koyo",

    // Features Section
    featuresTitle: "Duk abin da kuke buƙata don samun nasara",
    featuresDescription:
      "Ƙarfin ayyuka da aka ƙera don taimaka muku ciniki cryptocurrency yadda ya kamata kuma lafiya.",

    // Dashboard
    buyAssets: "Sayi kadarori",
    sellAssets: "Sayar da kadarori",
    transactions: "Ma'amaloli",
    settings: "Saitunan",
    wallet: "Walat",
    profile: "Bayanan sirri",
    logout: "Fita",

    // Buy/Sell
    selectAsset: "Zaɓi kadara",
    amount: "Adadi",
    transactionFee: "Kuɗin ma'amala",
    totalAmount: "Jimlar adadi",
    ngnEquivalent: "Daidai da NGN",
    minimumBuy: "Mafi ƙarancin adadin saye shine $5.00",
    minimumSell: "Mafi ƙarancin adadin sayarwa shine $4.00",
    approvePurchase: "Amince da saye",
    proceedToPayout: "An gama - Ci gaba zuwa biyan kuɗi",

    // Footer
    footerDescription:
      "Dandalin ku na amana don cinikin cryptocurrency mai sauƙi tare da ƙimar gasa da ma'amaloli masu tsaro.",
    quickLinks: "Hanyoyin sauri",
    support: "Tallafi",
    legal: "Doka",
    privacyPolicy: "Manufar Sirri",
    termsOfService: "Sharuɗɗan Sabis",
    security: "Tsaro",
    helpCenter: "Cibiyar Taimako",
    allRightsReserved: "Duk haƙƙoƙin da aka keɓe.",

    // Common
    cancel: "Soke",
    save: "Ajiye",
    submit: "Tura",
    loading: "Ana lodawa...",
    error: "Kuskure",
    success: "Nasara",
  },
}

export function useTranslation(lang: Language = "en") {
  return {
    t: (key: keyof typeof translations.en) => {
      return translations[lang][key] || translations.en[key] || key
    },
    lang,
    isRTL: languages[lang].rtl || false,
  }
}
