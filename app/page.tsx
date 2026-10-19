"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PRICING, type PricingSettings } from "@/lib/pricing";

const fabrics = Array.from({ length: 12 }, (_, index) => ({
  id: `fabric-${index + 1}`,
  category: "fabric" as const,
  number: index + 1,
  label: [
    "خامة صوف",
    "مخمل فاخر",
    "نسيج كلاسيكي",
    "لمسة حريرية",
    "قماش جاكار",
    "نسيج ناعم",
    "خامة راقية",
    "قماش متين",
    "نسيج مغربي",
    "مخمل ناعم",
    "قماش فاخر",
    "نسيج مميز",
  ][index],
  src: `/image${index + 1}.jpg`,
}));

const heroSlides = Array.from({ length: 3 }, (_, index) => ({
  src: `/home payg ${index + 1}.jpg`,
  number: index + 1,
}));

const projects = Array.from({ length: 7 }, (_, index) => ({
  id: `project-${index + 1}`,
  category: "project" as const,
  title: `مشروع صالون ${index + 1}`,
  src: `/salon${index + 1}.jpg`,
  number: index + 1,
}));

type Language = "ar" | "fr" | "en";
type CatalogImage = {
  id: string;
  category: "fabric" | "project";
  title: string;
  src: string;
  number: number;
  label?: string;
};
const isLanguage = (value: string): value is Language =>
  value === "ar" || value === "fr" || value === "en";

type Piece = {
  id: number;
  length: string;
  width: string;
  distribution: "first-right" | "first-left";
};

const widthOptions = Array.from({ length: 70 }, (_, index) => index + 1);

const copy = {
  ar: {
    nav: ["الرئيسية", "الأقمشة", "أعمالنا", "حساب المتر", "تواصل معنا"],
    headerCta: "صمّم طلبك",
    heroKicker: "من قلب فاس، إلى تفاصيل بيتكم",
    heroTitle: "أصالةٌ تُنسَج.",
    heroAccent: "وفخامةٌ تُعاش.",
    heroAlt: "لفة قماش مغربي فاخرة",
    heroCopy:
      "أقمشة منتقاة بعناية، ولمسات مغربية تصنع مساحةً تشبهكم. اكتشفوا مجموعتنا واحسبوا احتياجكم بكل سهولة.",
    heroFabrics: "اكتشفوا الأقمشة",
    heroCalculator: "احسبوا التكلفة",
    heroLocation: "صُنعت بحب في فاس، المغرب",
    introEyebrow: "حرفة فاسية · ذوق معاصر",
    introTitle: "البيت حكاية،",
    introAccent: "والتفاصيل تصنعها.",
    introCopy:
      "في DÉCOR.MA، نحتفي بجمال المجالس المغربية من خلال أقمشة مختارة وخيارات تُفصّل على ذوقكم. من فاس، نساعدكم على تحويل رؤيتكم إلى مساحة دافئة وأصيلة.",
    introCta: "ابدأوا بتخطيط طلبكم",
    values: [
      ["ذوق مغربي أصيل", "تفاصيل تستلهم روح المجالس الفاسية."],
      ["اختيارات تناسبكم", "ألوان ومقاسات بتوزيع تختارونه."],
      ["تواصل مباشر", "نجيب عن استفساراتكم بكل عناية."],
    ],
    fabricsEyebrow: "مختارات DÉCOR.MA",
    fabricsTitle: "ألوان تحكي",
    fabricsAccent: "عن ذوقكم.",
    fabricsCopy: "تصفّحوا الأقمشة المتوفرة، واختاروا ما يلهم مجلسكم القادم.",
    fabricLabels: fabrics.map((fabric) => fabric.label),
    fabricAlt: "اختيار القماش",
    closePreview: "إغلاق معاينة الصورة",
    projectsEyebrow: "إلهام لمساحات أنيقة",
    projectsTitle: "مساحات تجمع",
    projectsAccent: "بين الراحة والأناقة.",
    projectsCopy: "تصاميم داخلية عصرية تلهم اختيار الأقمشة وتنسيق المجالس.",
    galleryCaption: "من أعمال DÉCOR.MA",
    projectAlt: "مشروع صالون DÉCOR.MA",
    calculatorEyebrow: "أداة القياس والحساب التفاعلية",
    calculatorTitle: "تفاصيلكم،",
    calculatorAccent: "وتقديركم فوراً.",
    calculatorCopy:
      "أضيفوا القطع وحددوا طول كل قطعة وعرضها القياسي. اختاروا لوناً واحداً أو نسّقوا لونين بخيار دو فاس.",
    priceNote:
      "سعر المتر للوجه الواحد {single} درهماً، وللوجهين {double} درهماً. تضاف {shipping} درهماً للتوصيل، ثم يُقرّب المجموع لأقرب 5 دراهم.",
    pricingError: "تعذّر تحميل الأسعار المحدّثة؛ المعروض حالياً هو السعر الافتراضي.",
    catalogError: "تعذّر تحميل كتالوج الصور المحدّث؛ الصور الافتراضية معروضة.",
    madeInFes: "صنع في فاس",
    estimate: "تقدير أولي",
    piecesTitle: "مقاسات القطع",
    pieceCount: "قطع",
    colorMode: "طريقة اختيار اللون",
    singleColor: "لون واحد",
    doubleFace: "دو فاس · لونان",
    perMeter: "درهم / متر",
    singleColorLegend: "اللون الموحد لجميع القطع",
    doubleColorLegend: "اختاروا لونَي الوجهين",
    firstColor: "اللون الأول",
    secondColor: "اللون الثاني",
    distributionNote: "حدّدوا جهة اللون الأول لكل قطعة؛ اللون الثاني يكون في الجهة المقابلة.",
    piece: "القطعة",
    length: "الطول (متر)",
    width: "العرض الثابت",
    centimeters: "سم",
    distribution: "توزيع اللونين",
    right: "يميناً",
    left: "يساراً",
    delete: "حذف ×",
    addPiece: "إضافة قطعة أخرى",
    subtotal: "مجموع الأمتار",
    transport: "النقل",
    total: "المجموع التقديري بعد التقريب",
    whatsappCta: "أرسلوا تفاصيل الطلب عبر واتساب",
    disclaimer: "تقدير أولي للتكلفة؛ نؤكد التفاصيل والسعر النهائي عبر واتساب.",
    contactEyebrow: "من فاس، بكل محبة",
    contactTitle: "لنتحدث عن",
    contactAccent: "تفاصيل بيتكم.",
    contactCopy: "يسعدنا استقبال أسئلتكم ومساعدتكم في اختيار الأنسب.",
    location: "Fès, Maroc",
    viewMap: "عرض على الخريطة",
    follow: "تابعوا صفحتنا",
    top: "العودة للأعلى",
    quoteIntro: "السلام عليكم، أود الاستفسار عن طلب أقمشة من DÉCOR.MA.",
    metersTotal: "إجمالي الأمتار",
    quoteTotal: "المجموع",
    quoteNote: "يشمل النقل والتقريب",
  },
  fr: {
    nav: ["Accueil", "Tissus", "Réalisations", "Calculateur", "Contact"],
    headerCta: "Créer votre devis",
    heroKicker: "Au cœur de Fès, jusque dans les détails de votre maison",
    heroTitle: "L’authenticité se tisse.",
    heroAccent: "Le luxe se vit.",
    heroAlt: "Rouleau de tissu marocain haut de gamme",
    heroCopy:
      "Des tissus choisis avec soin et des touches marocaines pour un intérieur qui vous ressemble. Découvrez notre collection et estimez vos besoins.",
    heroFabrics: "Découvrir les tissus",
    heroCalculator: "Estimer le prix",
    heroLocation: "Façonné avec amour à Fès, Maroc",
    introEyebrow: "Artisanat fassi · style contemporain",
    introTitle: "Chaque maison raconte",
    introAccent: "une histoire singulière.",
    introCopy:
      "Chez DÉCOR.MA, nous célébrons les salons marocains avec des tissus sélectionnés et des options adaptées à vos envies. Depuis Fès, nous donnons vie à vos idées.",
    introCta: "Préparer votre demande",
    values: [
      ["Style marocain authentique", "Inspiré par l’esprit des salons fassis."],
      ["À votre mesure", "Couleurs et dimensions selon vos choix."],
      ["À votre écoute", "Nous répondons à toutes vos questions."],
    ],
    fabricsEyebrow: "Sélection DÉCOR.MA",
    fabricsTitle: "Des couleurs qui racontent",
    fabricsAccent: "votre style.",
    fabricsCopy: "Parcourez les tissus disponibles et choisissez votre favori.",
    fabricLabels: [
      "Laine raffinée", "Velours de luxe", "Tissage classique", "Touche soyeuse",
      "Tissu jacquard", "Tissage doux", "Finition élégante", "Tissu résistant",
      "Tissage marocain", "Velours doux", "Tissu premium", "Tissage unique",
    ],
    fabricAlt: "Choisir le tissu",
    closePreview: "Fermer l’aperçu de l’image",
    projectsEyebrow: "Inspiration déco",
    projectsTitle: "Des espaces entre",
    projectsAccent: "confort et élégance.",
    projectsCopy: "Des intérieurs contemporains pour inspirer le choix de vos tissus.",
    galleryCaption: "Réalisations DÉCOR.MA",
    projectAlt: "Projet salon DÉCOR.MA",
    calculatorEyebrow: "Outil de mesure et de calcul",
    calculatorTitle: "Vos détails,",
    calculatorAccent: "votre estimation immédiate.",
    calculatorCopy:
      "Ajoutez vos pièces et indiquez leur longueur et largeur standard. Choisissez une couleur ou associez-en deux avec l’option double face.",
    priceNote:
      "Simple face : {single} MAD/m, double face : {double} MAD/m. Livraison : {shipping} MAD. Le total est arrondi aux 5 MAD les plus proches.",
    pricingError: "Impossible de charger les tarifs actualisés ; les tarifs par défaut sont affichés.",
    catalogError: "Impossible de charger les images actualisées ; les images par défaut sont affichées.",
    madeInFes: "Fabriqué à Fès",
    estimate: "Estimation",
    piecesTitle: "Dimensions des pièces",
    pieceCount: "pièces",
    colorMode: "Choix des couleurs",
    singleColor: "Une couleur",
    doubleFace: "Double face · deux couleurs",
    perMeter: "MAD / m",
    singleColorLegend: "Une couleur pour toutes les pièces",
    doubleColorLegend: "Choisissez les deux faces",
    firstColor: "Première couleur",
    secondColor: "Deuxième couleur",
    distributionNote: "Choisissez le côté de la première couleur pour chaque pièce.",
    piece: "Pièce",
    length: "Longueur (m)",
    width: "Largeur standard",
    centimeters: "cm",
    distribution: "Répartition des couleurs",
    right: "À droite",
    left: "À gauche",
    delete: "Supprimer ×",
    addPiece: "Ajouter une pièce",
    subtotal: "Mètres au total",
    transport: "Transport",
    total: "Total estimé après arrondi",
    whatsappCta: "Envoyer la demande par WhatsApp",
    disclaimer: "Estimation indicative ; le prix final sera confirmé sur WhatsApp.",
    contactEyebrow: "Depuis Fès, avec passion",
    contactTitle: "Parlons de",
    contactAccent: "votre intérieur.",
    contactCopy: "Nous sommes à votre écoute pour vous aider à choisir.",
    location: "Fès, Maroc",
    viewMap: "Voir sur la carte",
    follow: "Visitez notre page",
    top: "Retour en haut",
    quoteIntro: "Bonjour, je souhaite me renseigner sur les tissus de DÉCOR.MA.",
    metersTotal: "Métrage total",
    quoteTotal: "Total",
    quoteNote: "transport et arrondi inclus",
  },
  en: {
    nav: ["Home", "Fabrics", "Our Works", "Meter Calculator", "Contact Us"],
    headerCta: "Build your quote",
    heroKicker: "From the heart of Fez, into the details of your home",
    heroTitle: "Heritage, woven.",
    heroAccent: "Luxury, lived.",
    heroAlt: "Luxury Moroccan fabric roll",
    heroCopy:
      "Thoughtfully selected fabrics and Moroccan touches for a home that feels like yours. Explore the collection and estimate what you need.",
    heroFabrics: "Explore fabrics",
    heroCalculator: "Calculate your price",
    heroLocation: "Made with care in Fez, Morocco",
    introEyebrow: "Fez craftsmanship · contemporary taste",
    introTitle: "Every home tells",
    introAccent: "its own story.",
    introCopy:
      "At DÉCOR.MA, we celebrate Moroccan salons with carefully selected fabrics and options tailored to your taste. From Fez, we help bring your vision to life.",
    introCta: "Plan your order",
    values: [
      ["Authentic Moroccan style", "Inspired by the spirit of Fez salons."],
      ["Made for you", "Choose your colors and dimensions."],
      ["Personal service", "We are happy to answer your questions."],
    ],
    fabricsEyebrow: "The DÉCOR.MA collection",
    fabricsTitle: "Colors that speak",
    fabricsAccent: "to your taste.",
    fabricsCopy: "Browse available fabrics and choose the one that inspires you.",
    fabricLabels: [
      "Fine wool", "Luxury velvet", "Classic weave", "Silky touch",
      "Jacquard fabric", "Soft weave", "Elegant finish", "Durable fabric",
      "Moroccan weave", "Soft velvet", "Premium fabric", "Signature weave",
    ],
    fabricAlt: "Select fabric",
    closePreview: "Close image preview",
    projectsEyebrow: "Interior inspiration",
    projectsTitle: "Spaces that bring",
    projectsAccent: "comfort and elegance together.",
    projectsCopy: "A curated selection of elegant salons and living spaces.",
    galleryCaption: "DÉCOR.MA project",
    projectAlt: "DÉCOR.MA salon project",
    calculatorEyebrow: "Interactive measurement and pricing",
    calculatorTitle: "Your details,",
    calculatorAccent: "an instant estimate.",
    calculatorCopy:
      "Add pieces and enter each length and standard width. Choose one color or pair two with the double-face option.",
    priceNote:
      "Single face: {single} MAD/m; double face: {double} MAD/m. Delivery: {shipping} MAD. The total is rounded to the nearest 5 MAD.",
    pricingError: "Could not load the updated pricing; default prices are currently shown.",
    catalogError: "Could not load the updated image catalog; default images are shown.",
    madeInFes: "Made in Fez",
    estimate: "Estimate",
    piecesTitle: "Piece measurements",
    pieceCount: "pieces",
    colorMode: "Color selection",
    singleColor: "Single color",
    doubleFace: "Double face · two colors",
    perMeter: "MAD / m",
    singleColorLegend: "One color for all pieces",
    doubleColorLegend: "Choose both face colors",
    firstColor: "First color",
    secondColor: "Second color",
    distributionNote: "Choose which side gets the first color for each piece.",
    piece: "Piece",
    length: "Length (m)",
    width: "Fixed width",
    centimeters: "cm",
    distribution: "Color placement",
    right: "Right",
    left: "Left",
    delete: "Remove ×",
    addPiece: "Add another piece",
    subtotal: "Total meters",
    transport: "Transport",
    total: "Estimated total after rounding",
    whatsappCta: "Send your request on WhatsApp",
    disclaimer: "Estimate only; we will confirm the final details and price on WhatsApp.",
    contactEyebrow: "From Fez, with care",
    contactTitle: "Let’s talk about",
    contactAccent: "your home.",
    contactCopy: "We’re happy to answer your questions and help you choose.",
    location: "Fès, Maroc",
    viewMap: "View on map",
    follow: "Visit our page",
    top: "Back to top",
    quoteIntro: "Hello, I’d like to ask about fabrics from DÉCOR.MA.",
    metersTotal: "Total length",
    quoteTotal: "Total",
    quoteNote: "transport and rounding included",
  },
} as const;

const formatMoney = (
  amount: number,
  language: Language,
  includeCents = false,
) =>
  new Intl.NumberFormat(
    language === "ar" ? "ar-MA" : language === "fr" ? "fr-MA" : "en-MA",
    { maximumFractionDigits: includeCents ? 2 : 0 },
  ).format(amount);

const pieceMeters = (length: string) => {
  const meters = Number(length);
  return Number.isFinite(meters) && meters > 0 && meters <= 999 ? meters : 0;
};

function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>
          {title} <span>{accent}</span>
        </h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("ar");
  const [catalogFabrics, setCatalogFabrics] = useState<CatalogImage[]>(
    fabrics.map((fabric) => ({ ...fabric, title: fabric.label })),
  );
  const [catalogProjects, setCatalogProjects] = useState<CatalogImage[]>(projects);
  const [catalogError, setCatalogError] = useState(false);
  const [pricing, setPricing] = useState<PricingSettings>(DEFAULT_PRICING);
  const [pricingError, setPricingError] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [twoFace, setTwoFace] = useState(false);
  const [firstColorIndex, setFirstColorIndex] = useState(0);
  const [secondColorIndex, setSecondColorIndex] = useState(1);
  const [pieces, setPieces] = useState<Piece[]>([
    {
      id: 1,
      length: "0",
      width: "70",
      distribution: "first-right",
    },
  ]);
  const nextPieceId = useRef(2);
  const t = copy[language];
  const getFabricLabel = (fabric: CatalogImage) => {
    const original = fabrics.find((item) => item.id === fabric.id);
    return original?.label === fabric.title
      ? t.fabricLabels[fabric.number - 1] ?? fabric.title
      : fabric.title;
  };
  const colors = catalogFabrics.map((fabric) => ({
    name: getFabricLabel(fabric),
    src: fabric.src,
    number: fabric.number,
  }));
  const priceNote = t.priceNote
    .replace("{single}", formatMoney(pricing.singleFace, language))
    .replace("{double}", formatMoney(pricing.doubleFace, language))
    .replace("{shipping}", formatMoney(pricing.shippingCost, language));

  useEffect(() => {
    let active = true;
    fetch("/api/store-settings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Pricing request failed.");
        return response.json() as Promise<{ pricing: PricingSettings }>;
      })
      .then((data) => {
        if (active) setPricing(data.pricing);
      })
      .catch(() => {
        if (active) setPricingError(true);
      });

    fetch("/api/catalog")
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog request failed.");
        return response.json() as Promise<{ catalog: Omit<CatalogImage, "number">[] }>;
      })
      .then((data) => {
        if (!active) return;
        const fabricsData = data.catalog
          .filter((image) => image.category === "fabric")
          .map((image, index) => ({
            ...image,
            number: Number(/^fabric-(\d+)$/.exec(image.id)?.[1] ?? index + 1),
          }));
        const projectsData = data.catalog
          .filter((image) => image.category === "project")
          .map((image, index) => ({
            ...image,
            number: Number(/^project-(\d+)$/.exec(image.id)?.[1] ?? index + 1),
          }));
        setCatalogFabrics(fabricsData);
        setCatalogProjects(projectsData);
      })
      .catch(() => {
        if (active) setCatalogError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (firstColorIndex >= catalogFabrics.length) setFirstColorIndex(0);
    if (secondColorIndex >= catalogFabrics.length) {
      setSecondColorIndex(catalogFabrics.length > 1 ? 1 : 0);
    }
  }, [catalogFabrics, firstColorIndex, secondColorIndex]);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    const lightbox = lightboxRef.current;
    if (!lightbox) return;

    if (lightboxImage && !lightbox.open) {
      lightbox.showModal();
    } else if (!lightboxImage && lightbox.open) {
      lightbox.close();
    }
  }, [lightboxImage]);

  useEffect(() => {
    if (!lightboxImage) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        lightboxRef.current?.close();
        setLightboxImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [lightboxImage]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalId = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  const totalMeters = useMemo(
    () =>
      pieces.reduce((total, piece) => {
        return total + pieceMeters(piece.length);
      }, 0),
    [pieces],
  );
  const rate = twoFace ? pricing.doubleFace : pricing.singleFace;
  const fabricCost = totalMeters * rate;
  const delivery = totalMeters > 0 ? pricing.shippingCost : 0;
  const exactTotal = fabricCost + delivery;
  const roundedTotal =
    exactTotal > 0 ? Math.round(exactTotal / 5) * 5 : 0;

  const updatePiece = (id: number, changes: Partial<Piece>) => {
    setPieces((current) =>
      current.map((piece) =>
        piece.id === id ? { ...piece, ...changes } : piece,
      ),
    );
  };

  const selectFirstColor = (colorIndex: number) => {
    if (colorIndex === secondColorIndex) {
      setSecondColorIndex(firstColorIndex);
    }
    setFirstColorIndex(colorIndex);
  };

  const selectSecondColor = (colorIndex: number) => {
    if (colorIndex === firstColorIndex) {
      setFirstColorIndex(secondColorIndex);
    }
    setSecondColorIndex(colorIndex);
  };

  const addPiece = () => {
    const id = nextPieceId.current++;
    setPieces((current) => [
      ...current,
      {
        id,
        length: "0",
        width: "70",
        distribution: "first-right",
      },
    ]);
  };

  const removePiece = (id: number) => {
    setPieces((current) =>
      current.length > 1 ? current.filter((piece) => piece.id !== id) : current,
    );
  };

  const quoteLines = pieces
    .map((piece, index) => {
      const imageDetails = twoFace
        ? `اللون الأول: ${colors[firstColorIndex].name} - الصورة رقم ${colors[firstColorIndex].number}\nاللون الثاني: ${colors[secondColorIndex].name} - الصورة رقم ${colors[secondColorIndex].number}`
        : `اللون المختار: ${colors[firstColorIndex].name} - الصورة رقم ${colors[firstColorIndex].number}`;

      return `${t.piece} ${index + 1}:\n${t.length}: ${pieceMeters(piece.length).toFixed(2)} m\n${t.width}: ${piece.width} ${t.centimeters}\n${imageDetails}`;
    })
    .join("\n\n");
  const whatsappMessage = [
    t.quoteIntro,
    quoteLines,
    `${t.metersTotal}: ${totalMeters.toFixed(2)} m.`,
    `${t.quoteTotal}: ${formatMoney(roundedTotal, language)} MAD (${t.quoteNote}).`,
  ].join("\n\n");
  const whatsappUrl = `https://wa.me/212679299620?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="DÉCOR.MA">
            <Image
              src="/images/logo.jpg"
              alt=""
              width={52}
              height={52}
              priority
              className="brand-logo"
            />
            <span className="brand-name">
              <strong>DÉCOR.MA</strong>
              <small>DÉCOR.MA</small>
            </span>
          </a>
          <nav aria-label={language === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
            <a href="#home">{t.nav[0]}</a>
            <a href="#fabrics">{t.nav[1]}</a>
            <a href="#projects">{t.nav[2]}</a>
            <a href="#calculator">{t.nav[3]}</a>
            <a href="#contact">{t.nav[4]}</a>
          </nav>
          <a className="header-cta" href="#calculator">
            {t.headerCta} <span aria-hidden="true">↙</span>
          </a>
          <label className="language-picker">
            <span className="visually-hidden">
              {language === "ar" ? "اللغة" : language === "fr" ? "Langue" : "Language"}
            </span>
            <select
              aria-label={language === "ar" ? "اختيار اللغة" : language === "fr" ? "Choisir la langue" : "Choose language"}
              value={language}
              onChange={(event) => {
                const selectedLanguage = event.currentTarget.value;
                if (isLanguage(selectedLanguage)) setLanguage(selectedLanguage);
              }}
            >
              <option value="ar">العربية</option>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </label>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-slides">
            {heroSlides.map((slide, index) => (
              <Image
                key={slide.src}
                src={slide.src}
                alt=""
                aria-hidden="true"
                fill
                priority={index === 0}
                sizes="100vw"
                className={`hero-image${activeHeroSlide === index ? " slide-active" : ""}`}
              />
            ))}
          </div>
          <div className="hero-shade" />
          <div className="container hero-content">
            <p className="hero-kicker">{t.heroKicker}</p>
            <h1>
              {t.heroTitle}
              <br />
              <span>{t.heroAccent}</span>
            </h1>
            <p className="hero-copy">{t.heroCopy}</p>
            <div className="hero-actions">
              <a className="button button-light" href="#fabrics">
                {t.heroFabrics} <span aria-hidden="true">←</span>
              </a>
              <a className="button button-outline" href="#calculator">
                {t.heroCalculator}
              </a>
            </div>
            <div className="hero-location">
              <span className="location-dot" />
              <span>{t.heroLocation}</span>
            </div>
          </div>
          <span className="hero-index" aria-hidden="true">
            MA · 34°02&apos;N
          </span>
          <div className="hero-slide-controls" aria-label="Hero slideshow controls">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                className={`hero-slide-dot${activeHeroSlide === index ? " active" : ""}`}
                aria-label={`${language === "ar" ? "الصورة" : language === "fr" ? "Diapositive" : "Slide"} ${slide.number}`}
                aria-pressed={activeHeroSlide === index}
                onClick={() => setActiveHeroSlide(index)}
              />
            ))}
          </div>
        </section>

        <section className="intro section-pad" id="about">
          <div className="container intro-grid">
            <div>
              <span className="eyebrow">{t.introEyebrow}</span>
              <h2>
                {t.introTitle}
                <br />
                <span>{t.introAccent}</span>
              </h2>
            </div>
            <div className="intro-copy">
              <p>{t.introCopy}</p>
              <a className="text-link" href="#calculator">
                {t.introCta} <span aria-hidden="true">←</span>
              </a>
            </div>
          </div>
          <div className="container values-row">
            <div className="value-item">
              <span>01</span>
              <div>
                <strong>{t.values[0][0]}</strong>
                <p>{t.values[0][1]}</p>
              </div>
            </div>
            <div className="value-item">
              <span>02</span>
              <div>
                <strong>{t.values[1][0]}</strong>
                <p>{t.values[1][1]}</p>
              </div>
            </div>
            <div className="value-item">
              <span>03</span>
              <div>
                <strong>{t.values[2][0]}</strong>
                <p>{t.values[2][1]}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="fabrics section-pad" id="fabrics">
          <div className="container">
            <SectionHeading
              eyebrow={t.fabricsEyebrow}
              title={t.fabricsTitle}
              accent={t.fabricsAccent}
              description={t.fabricsCopy}
            />
            {catalogError && <p className="data-load-error" role="status">{t.catalogError}</p>}
            <div className="fabric-grid">
              {catalogFabrics.map((fabric) => {
                const label = getFabricLabel(fabric);
                return (
                <div
                  className="fabric-card"
                  key={fabric.id}
                >
                  <div className="fabric-image-wrap">
                    <button
                      className="fabric-preview-trigger"
                      type="button"
                      aria-label={`${t.fabricAlt} ${fabric.number}: ${label}`}
                      onClick={() =>
                        setLightboxImage({
                          src: fabric.src,
                          alt: `${t.fabricAlt} ${fabric.number}: ${label}`,
                        })
                      }
                    >
                      <Image
                        src={fabric.src}
                        alt=""
                        width={700}
                        height={560}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized
                      />
                      <span className="fabric-number">
                        {String(fabric.number).padStart(2, "0")}
                      </span>
                      <span className="fabric-view" aria-hidden="true">
                        +
                      </span>
                    </button>
                  </div>
                  <div className="fabric-caption">
                    <span>{label}</span>
                    <strong>{String(fabric.number).padStart(2, "0")}</strong>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </section>

        <section className="projects section-pad" id="projects">
          <div className="container">
            <SectionHeading
              eyebrow={t.projectsEyebrow}
              title={t.projectsTitle}
              accent={t.projectsAccent}
              description={t.projectsCopy}
            />
            <div className="project-grid">
              {catalogProjects.map((project) => {
                const original = projects.find((item) => item.id === project.id);
                const title = original?.title === project.title
                  ? `${t.projectAlt} ${project.number}`
                  : project.title;
                return (
                <figure className="project-card" key={project.id}>
                  <button
                    className="project-preview-trigger"
                    type="button"
                    aria-label={title}
                    onClick={() =>
                      setLightboxImage({
                        src: project.src,
                        alt: title,
                      })
                    }
                  >
                    <Image
                      src={project.src}
                      alt=""
                      width={1200}
                      height={800}
                      sizes="(max-width: 650px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  </button>
                  <figcaption>
                    <span>{title}</span>
                    <span aria-hidden="true">
                      {String(project.number).padStart(2, "0")}
                    </span>
                  </figcaption>
                </figure>
              );
              })}
            </div>
          </div>
        </section>

        <section className="calculator-section section-pad" id="calculator">
          <div className="container calculator-layout">
            <div className="calculator-intro">
              <span className="eyebrow">{t.calculatorEyebrow}</span>
              <h2>
                {t.calculatorTitle}
                <br />
                <span>{t.calculatorAccent}</span>
              </h2>
              <p>{t.calculatorCopy}</p>
              <div className="price-note">
                <span aria-hidden="true">✳</span>
                <p>{priceNote}</p>
              </div>
              {pricingError && <p className="data-load-error" role="status">{t.pricingError}</p>}
              <div className="calculator-stamp">
                <span>{t.madeInFes}</span>
                <strong>DÉCOR.MA</strong>
              </div>
            </div>

            <div className="calculator-card">
              <div className="calculator-card-heading">
                <div>
                  <span className="eyebrow">{t.estimate}</span>
                  <h3>{t.piecesTitle}</h3>
                </div>
                <span className="piece-count">
                  {String(pieces.length).padStart(2, "0")} {t.pieceCount}
                </span>
              </div>

              <fieldset className="selection-fieldset">
                <legend>{t.colorMode}</legend>
                <div className="mode-switch">
                  <button
                    type="button"
                    className={!twoFace ? "mode-option selected" : "mode-option"}
                    aria-pressed={!twoFace}
                    onClick={() => setTwoFace(false)}
                  >
                    {t.singleColor}
                    <small>{formatMoney(pricing.singleFace, language)} {t.perMeter}</small>
                  </button>
                  <button
                    type="button"
                    className={twoFace ? "mode-option selected" : "mode-option"}
                    aria-pressed={twoFace}
                    onClick={() => setTwoFace(true)}
                  >
                    {t.doubleFace}
                    <small>{formatMoney(pricing.doubleFace, language)} {t.perMeter}</small>
                  </button>
                </div>
              </fieldset>

              <div className="pieces-list">
                {pieces.map((piece, index) => (
                  <div className="piece-row" key={piece.id}>
                    <div className="piece-row-heading">
                      <strong>{t.piece} {String(index + 1).padStart(2, "0")}</strong>
                      {pieces.length > 1 && (
                        <button
                          type="button"
                          className="remove-piece"
                          onClick={() => removePiece(piece.id)}
                          aria-label={`${t.delete} ${index + 1}`}
                        >
                          {t.delete}
                        </button>
                      )}
                    </div>
                    {index === 0 && (
                      <fieldset className="color-fieldset piece-color-fieldset">
                        <legend>{twoFace ? t.doubleColorLegend : t.singleColorLegend}</legend>
                        {!twoFace ? (
                          <div className="color-options">
                            {colors.map((color, colorIndex) => (
                              <button
                                type="button"
                                key={color.name}
                                className={`color-choice${firstColorIndex === colorIndex ? " chosen" : ""}`}
                                style={{ "--swatch-image": `url("${color.src}")` } as React.CSSProperties}
                                aria-label={`${color.name}, الصورة رقم ${color.number}`}
                                aria-pressed={firstColorIndex === colorIndex}
                                title={`${color.name} · الصورة رقم ${color.number}`}
                                onClick={() => selectFirstColor(colorIndex)}
                              >
                                <span className="color-choice-number" aria-hidden="true">
                                  {color.number}
                                </span>
                              </button>
                            ))}
                            <span className="selected-color-name">
                              {colors[firstColorIndex].name} · الصورة رقم {colors[firstColorIndex].number}
                            </span>
                          </div>
                        ) : (
                          <div className="two-color-pickers">
                            <div className="face-picker">
                              <span>{t.firstColor}</span>
                              <div className="color-options">
                                {colors.map((color, colorIndex) => (
                                  <button
                                    type="button"
                                    key={color.name}
                                    className={`color-choice${firstColorIndex === colorIndex ? " chosen" : ""}`}
                                    style={{ "--swatch-image": `url("${color.src}")` } as React.CSSProperties}
                                    aria-label={`${t.firstColor}: ${color.name}, الصورة رقم ${color.number}`}
                                    aria-pressed={firstColorIndex === colorIndex}
                                    title={`${color.name} · الصورة رقم ${color.number}`}
                                    onClick={() => selectFirstColor(colorIndex)}
                                  >
                                    <span className="color-choice-number" aria-hidden="true">
                                      {color.number}
                                    </span>
                                  </button>
                                ))}
                                <span className="selected-color-name">
                                  {colors[firstColorIndex].name} · الصورة رقم {colors[firstColorIndex].number}
                                </span>
                              </div>
                            </div>
                            <div className="face-picker">
                              <span>{t.secondColor}</span>
                              <div className="color-options">
                                {colors.map((color, colorIndex) => (
                                  <button
                                    type="button"
                                    key={color.name}
                                    className={`color-choice${secondColorIndex === colorIndex ? " chosen" : ""}`}
                                    style={{ "--swatch-image": `url("${color.src}")` } as React.CSSProperties}
                                    aria-label={`${t.secondColor}: ${color.name}, الصورة رقم ${color.number}`}
                                    aria-pressed={secondColorIndex === colorIndex}
                                    title={`${color.name} · الصورة رقم ${color.number}`}
                                    onClick={() => selectSecondColor(colorIndex)}
                                  >
                                    <span className="color-choice-number" aria-hidden="true">
                                      {color.number}
                                    </span>
                                  </button>
                                ))}
                                <span className="selected-color-name">
                                  {colors[secondColorIndex].name} · الصورة رقم {colors[secondColorIndex].number}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </fieldset>
                    )}
                    <div className="piece-fields">
                      <label>
                        <span>{t.length}</span>
                        <input
                          type="number"
                          min="0"
                          max="999"
                          step="0.01"
                          inputMode="decimal"
                          value={piece.length}
                          onFocus={(event) => {
                            if (piece.length === "0") {
                              updatePiece(piece.id, { length: "" });
                              event.currentTarget.select();
                            }
                          }}
                          onChange={(event) =>
                            updatePiece(piece.id, {
                              length: event.currentTarget.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>{t.width} ({t.centimeters})</span>
                        <select
                          value={piece.width}
                          onChange={(event) =>
                            updatePiece(piece.id, { width: event.currentTarget.value })
                          }
                        >
                          {widthOptions.map((width) => (
                            <option value={width} key={width}>
                              {width} {t.centimeters}
                            </option>
                          ))}
                        </select>
                      </label>
                      {twoFace && index === 0 && (
                        <label className="distribution-select">
                          <span>{t.distribution}</span>
                          <select
                            value={piece.distribution}
                            onChange={(event) => {
                              const distribution = event.currentTarget.value;
                              if (
                                distribution === "first-right" ||
                                distribution === "first-left"
                              ) {
                                updatePiece(piece.id, { distribution });
                              }
                            }}
                          >
                            <option value="first-right">
                              {colors[firstColorIndex].name} {t.right}
                            </option>
                            <option value="first-left">
                              {colors[firstColorIndex].name} {t.left}
                            </option>
                          </select>
                        </label>
                      )}
                    </div>
                    {twoFace && index === 0 && (
                      <p className="piece-color-summary">
                        {piece.distribution === "first-right"
                          ? `${colors[firstColorIndex].name} ${t.right} · ${colors[secondColorIndex].name} ${t.left}`
                          : `${colors[firstColorIndex].name} ${t.left} · ${colors[secondColorIndex].name} ${t.right}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" className="add-piece" onClick={addPiece}>
                <span aria-hidden="true">+</span> {t.addPiece}
              </button>

              <div className="price-breakdown">
                <div>
                  <span>
                    {t.subtotal} · {totalMeters.toFixed(2)} m × {rate} MAD
                  </span>
                  <strong>{formatMoney(fabricCost, language, true)} MAD</strong>
                </div>
                <div>
                  <span>{t.transport}</span>
                  <strong>{formatMoney(delivery, language)} MAD</strong>
                </div>
              </div>
              <div className="total-row" aria-live="polite">
                <span>{t.total}</span>
                <strong>
                  {formatMoney(roundedTotal, language)} <small>MAD</small>
                </strong>
              </div>
              <a
                className="whatsapp-cta"
                href={whatsappUrl}
              >
                <span aria-hidden="true">◉</span>
                {t.whatsappCta}
                <span aria-hidden="true">↗</span>
              </a>
              <p className="estimate-disclaimer">{t.disclaimer}</p>
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact">
          <div className="container contact-inner">
            <div>
              <span className="eyebrow">{t.contactEyebrow}</span>
              <h2>
                {t.contactTitle}
                <br />
                <span>{t.contactAccent}</span>
              </h2>
              <p>{t.contactCopy}</p>
              <a
                className="contact-phone"
                href="https://wa.me/212679299620"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">↗</span>
                <span dir="ltr">+212 679-299620</span>
              </a>
              <div className="social-links">
                <a
                  href="https://www.facebook.com/share/1DmGDGQReq/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook DÉCOR.MA"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.4-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v2.1H7v3.2h2.7V21h3.7Z" />
                  </svg>
                  Facebook <span>{t.follow}</span>
                </a>
                <a
                  href="https://www.instagram.com/decor.ma.1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram @decor.ma.1"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.6" cy="6.7" r="1" className="icon-fill" />
                  </svg>
                  Instagram <span>@decor.ma.1</span>
                </a>
                <a
                  href="https://wa.me/212679299620"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp +212 679-299620"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.5-4.9a8.4 8.4 0 1 1 16-3.9Z" />
                    <path d="M9 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .6.4.7 1.1 1.3 1.8 1.7.3.2.5.2.7-.1l.7-.8c.2-.2.4-.3.7-.1l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.1-.7 1.5-.5.5-1.1.7-1.7.7s-1.8-.4-3-1.2c-1.5-.9-2.5-2.1-3.1-3.1-.6-1-.8-1.8-.8-2.4 0-.6.2-1.1.5-1.5Z" />
                  </svg>
                  WhatsApp <span>+212 679-299620</span>
                </a>
              </div>
            </div>
            <a
              className="map-card"
              href="https://maps.app.goo.gl/9RSHaqd8jpnWkvcs7"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.location} · ${t.viewMap}`}
            >
              <span className="map-pin" aria-hidden="true">
                ✳
              </span>
              <span>{t.location}</span>
              <small>{t.viewMap} ↗</small>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <a className="brand footer-brand" href="#home">
            <Image src="/images/logo.jpg" alt="" width={40} height={40} />
            <span className="brand-name">
              <strong>DÉCOR.MA</strong>
              <small>DÉCOR.MA</small>
            </span>
          </a>
          <p>© {new Date().getFullYear()} DÉCOR.MA</p>
          <a
            href="https://maps.app.goo.gl/9RSHaqd8jpnWkvcs7"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.location} · {t.viewMap} ↗
          </a>
          <a href="#home">{t.top} ↑</a>
        </div>
      </footer>
      <dialog
        className="image-lightbox"
        ref={lightboxRef}
        aria-label={lightboxImage?.alt}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setLightboxImage(null);
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          lightboxRef.current?.close();
          setLightboxImage(null);
        }}
        onClose={() => setLightboxImage(null)}
      >
        {lightboxImage && (
          <>
            <button
              className="lightbox-close"
              type="button"
              aria-label={t.closePreview}
              onClick={() => setLightboxImage(null)}
            >
              ×
            </button>
            <Image
              className="lightbox-image"
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              width={2400}
              height={1800}
              unoptimized
              sizes="100vw"
            />
          </>
        )}
      </dialog>
    </>
  );
}
