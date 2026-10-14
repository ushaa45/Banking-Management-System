import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductShowcase.css";
import { Blend } from "lucide-react";

/* Edit slides freely. "to" = page in your app. theme = card colour. */
const TABS = {
  Trending: [
    { title: "Send Money", text: "Move money in a few simple steps.", cta: "Transfer Now", to: "/app/send-money", theme: "sky", art: "💸" },
    { title: "Personal Loan", text: "A loan for everything from dreams to emergencies.", cta: "Apply Now", to: "/app/loans", theme: "sand", art: "🏠" },
    { title: "Savings Account", text: "Start your savings journey with us.", cta: "Open Now", to: "/app/accounts", theme: "mint", art: "🐖" },
  ],
  Accounts: [
    { title: "Rural Account", text: "Unique savings accounts for farm support.", cta: "Locate Us", theme: "sand", banner:true, imgWebp: "/images/rural.jpg" },
    { title: "Savings Account", text: "Start your savings journey with us.", cta: "Open Now", to: "/open-accounts", more: "/savings-account", theme: "sky", banner: true, imgWebp: "/images/saving.webp" },
    { title: "Current Account", text: "Your everyday business banking companion.", cta: "Apply Online", to: "/apply-current-account", theme: "lilac", banner: true, Blend: true, img: "/images/current-account.jpg" },
  ],
  Deposits: [
    { title: "Fixed Deposit", text: "Guaranteed returns on your terms.", cta: "Open FD", to: "/app/deposits", theme: "mint", art: "🔒" },
    { title: "Recurring Deposit", text: "Save a little every month.", cta: "Start RD", to: "/app/deposits", theme: "sky", art: "📅" },
    { title: "Tax Saver FD", text: "5-year deposit with tax benefits.", cta: "Know Rates", to: "/app/deposits", theme: "sand", art: "🧾" },
  ],
  Cards: [
    { title: "Credit Card", text: "Cashback and rewards on everyday spends.", cta: "Apply Now", to: "/apply-credit-card", theme: "lilac", banner: true, imgWebp: "/images/credit-card.webp" },
    { title: "Debit Card", text: "Secure spending, linked to your account.", cta: "Manage Card", to: "/netbanking", theme: "sky", banner: true, imgWebp: "/images/debit-card.webp" },
    { title: "Forex Card", text: "Travel abroad worry-free.", cta: "Get Card", to: "/netbanking", theme: "mint", banner: true, imgWebp: "/images/forex-card.webp" },
    { title: "GIGA Business Credit Card", text: "Power your business everyday", cta: "Get Card", to: "/netbanking", theme: "lilac", banner: true, imgWebp: "/images/Giga.webp" },
    { title: "Prepaid Card", text: "Flexibility and ease packed into one card", cta: "Get Card", to: "/netbanking", theme: "mint", banner: true, imgWebp: "/images/prepaid-card.webp" },
    { title: "Commercial Credit Card", text: "Specialized cards for business payments", cta: "Get Card", to: "/netbanking", theme: "mint", banner: true, imgWebp: "/images/commercial.webp" },
  ],
  Loans: [
    { title: "Home Loan", text: "Competitive rates for your dream home.", cta: "Apply Now", to: "/home-loans", theme: "sand", banner: true, img: "/images/Home.jpg" },
    { title: "Personal Loan", text: "Quick approval, flexible tenure.", cta: "Check Offer", to: "/personal-loan", theme: "sky", banner: true, img: "/images/Personal.jpg" },
    { title: "Car Loan", text: "Drive home your new car today.", cta: "Apply Now", to: "/car-loan", theme: "mint", banner: true, img: "/images/Car.jpg" },
    { title: "Gold Loan", text: "Turn your Gold into possibilities.", cta: "Apply Now", to: "/gold-loan", theme: "mint", banner: true, imgWebp: "/images/gold-loan.webp" },
  ],
  Insurance: [
    { title: "Life Insurance", text: "Protect your family's future.", cta: "Explore Policies", to: "/life-insurance", theme: "lilac", art: "🛡️" },
    { title: "Health Cover", text: "Mediclaim and critical illness plans.", cta: "Explore Policies", to: "/health-insurance", theme: "mint", art: "🩺" },
    { title: "Claims", text: "File and track claims in one place.", cta: "View Claims", to: "/app/claims", theme: "sand", art: "📋" },
  ],
  Investments: [
    { title: "Mutual Funds", text: "Start a SIP in minutes.", cta: "Invest Now", to: "/app/deposits", theme: "sky", art: "📈" },
    { title: "Demat Account", text: "Trade equities and IPOs.", cta: "Open Now", to: "/app/accounts", theme: "lilac", art: "📊" },
    { title: "PPF / NPS", text: "Long-term retirement planning.", cta: "Know More", to: "/app/deposits", theme: "mint", art: "🌳" },
  ],
};

export default function ProductShowcase() {
  const navigate = useNavigate();
  const tabNames = Object.keys(TABS);

  const [tab, setTab] = useState("Accounts");
  const [index, setIndex] = useState(1); // start on the middle card
  const [query, setQuery] = useState("");

  const slides = TABS[tab];
  const n = slides.length;
  const at = (offset) => slides[(index + offset + n) % n];

  const go = (delta) => setIndex((i) => (i + delta + n) % n);

  const changeTab = (name) => {
    setTab(name);
    setIndex(1);
  };

  const learnMore = () =>
    document.getElementById("digital-banking")?.scrollIntoView({ behavior: "smooth" });

  /* search: jump to a matching tab or product */
  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    const byTab = tabNames.find((t) => t.toLowerCase().includes(q));
    if (byTab) return changeTab(byTab);

    for (const t of tabNames) {
      const i = TABS[t].findIndex((s) => s.title.toLowerCase().includes(q));
      if (i !== -1) {
        setTab(t);
        setIndex(i);
        return;
      }
    }
  };

  const cards = [-1, 0, 1].map((pos) => ({ slide: at(pos), pos }));
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    const text = "Search for accounts, loans, cards…";
    let charIndex = 0;
    let deleting = false;
    let timeout;

    const type = () => {
      setPlaceholder(text.slice(0, charIndex));

      if (!deleting && charIndex < text.length) {
        charIndex++;
        timeout = setTimeout(type, 100);
      } else if (!deleting) {
        deleting = true;
        timeout = setTimeout(type, 1200);
      } else if (charIndex > 0) {
        charIndex--;
        timeout = setTimeout(type, 45);
      } else {
        deleting = false;
        timeout = setTimeout(type, 500);
      }
    };

    type();

    return () => clearTimeout(timeout);
  }, []);


  return (
    <section className="ps" id="products">
      <div className="home-container">
        <form className="ps-search" onSubmit={handleSearch}>
          <span className="ps-search-badge">Ask Me</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">➤</button>
        </form>

        <h2 className="ps-title">Banking Solutions tailor-made for you</h2>

        <div className="ps-tabs" role="tablist">
          {tabNames.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              className={tab === name ? "active" : ""}
              onClick={() => changeTab(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="ps-stage">
          {cards.map(({ slide, pos }) => {
            const center = pos === 0;
            return (
              <article
                key={`${tab}-${slide.title}`}
                className={`ps-card theme-${slide.theme} ${center ? "is-center" : "is-side"} ${slide.banner ? "is-banner" : ""} ${slide.blend ? "is-blend" : ""}`}
                onClick={center ? undefined : () => go(pos)}
                aria-hidden={!center}
              >
                <h3>{slide.title}</h3>
                <p>{slide.text}</p>

                <div className="ps-actions">
                  <button
                    type="button"
                    className="ps-btn primary"
                    tabIndex={center ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (center) navigate(slide.to);
                    }}
                  >
                    {slide.cta}
                  </button>
                  <button
                    type="button"
                    className="ps-btn ghost"
                    tabIndex={center ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (center) (slide.more ? navigate(slide.more) : learnMore());
                    }}
                  >
                    Know More
                  </button>
                </div>

                {(() => {
                  const src = slide.img || slide.imgWebp;
                  return src ? (
                    <picture>
                      {slide.imgWebp && <source srcSet={slide.imgWebp} type="image/webp" />}
                      <img className="ps-img" src={src} alt="" loading="lazy" />
                    </picture>
                  ) : (
                    <span className="ps-art" aria-hidden="true">{slide.art}</span>
                  );
                })()}
              </article>
            );
          })}
        </div>

        <div className="ps-controls">
          <button type="button" onClick={() => go(-1)} aria-label="Previous">‹</button>
          <button type="button" onClick={() => go(1)} aria-label="Next">›</button>
        </div>
      </div>
    </section>
  );
}