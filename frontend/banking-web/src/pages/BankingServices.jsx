import { Link } from "react-router-dom";
import "./BankingServices.css";
import LoginMenu from "./LoginMenu";

const services = [
    {
        title: "NetBanking",
        description: "Access your banking services online.",
        to: "/netbanking",
    },
    {
        title: "Prepaid / Forex Card",
        description: "Manage prepaid and foreign exchange card services.",
        url: "https://v.hdfc.bank.in/assets/popuppages/Prepaid-card.html",
        more: "https://v.hdfc.bank.in/assets/popuppages/Prepaid-card.html",
    },
    {
        title: "Loans Portal",
        description: "View and manage your loan accounts.",
        url: "https://v.hdfc.bank.in/htdocs/common/NetBanking/nbip-loan-accounts/nbip-loan-account.html",
        more: "https://www.hdfc.bank.in/loans",
    },
    {
        title: "MyLoans",
        description: "Explore your loan services.",
        url: "https://www.hdfc.bank.in/myloans",
    },
    {
        title: "HDFC Limited",
        description: "Access housing finance services.",
        url: "https://homeloans.hdfc.bank.in/",
    },
    {
        title: "Home Loans",
        description: "Access the home loan portal.",
        url: "https://portal.hdfc.bank.in/login",
    },
    {
        title: "Fixed Deposits",
        description: "Explore fixed deposit options.",
        url: "https://www.hdfc.bank.in/fixed-deposit",
    },
    {
        title: "Xpressway",
        description: "Explore online banking applications.",
        url: "https://applyonline.hdfc.bank.in/xpressway.html?icid=website_organic_loxw",
    },
    {
        title: "FASTag",
        description: "Access your FASTag account.",
        url: "https://apply.fastag.hdfc.bank.in/customer/login/CustomerPortal/",
        more: "https://v.hdfc.bank.in/htdocs/common/fastag/index.html",
    },
    {
        title: "Merchant Standing Instructions",
        description: "Manage merchant payment instructions.",
        url: "https://merchantmandate.hdfc.bank.in/login",
    },
    {
        title: "Verified by Visa / Mastercard / RuPay",
        description: "Access card authentication services.",
        url: "https://netsafe.hdfc.bank.in/ACSWeb/enrolljsp/HDFCValidate.jsp",
        more: "https://www.hdfc.bank.in/stay-secure/verified-by-visa-mastercard-securecode",
    },
];

export default function BankingServices() {
    return (
        <div className="banking-services-page">
            <header className="services-header">
                <Link to="/" className="services-brand">
                    <span className="services-brand-dot" />
                    Meridian Bank
                </Link>
                <LoginMenu />
            </header>

            <section className="services-hero">
                <span className="services-eyebrow">DIGITAL BANKING</span>
                <h1>Your banking, all in one place.</h1>
                <p>
                    Choose a service below to continue to the relevant banking portal.
                </p>
            </section>

            <main className="services-container">
                <div className="services-grid">
                    {services.map((service) => (
                        <article className="service-card" key={service.title}>
                            <div className="service-card-icon">↗</div>
                            <h2>{service.title}</h2>
                            <p>{service.description}</p>

                            <a
                                className="service-primary-link"
                                href={service.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open service <span>→</span>
                            </a>

                            {service.more && (
                                <a
                                    className="service-more-link"
                                    href={service.more}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Know more
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            </main>

            <footer className="services-footer">
                © {new Date().getFullYear()} Meridian Bank · Digital Banking Services
            </footer>
        </div>
    );
}