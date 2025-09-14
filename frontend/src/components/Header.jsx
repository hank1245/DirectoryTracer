import React from "react";
import styles from "../styles/Header.module.css";
import useBuyMeACoffee from "../hooks/useBuyMeACoffee";

const Header = () => {
  useBuyMeACoffee(styles);

  const linkData = [
    {
      href: "https://github.com/hank1245",
      className: styles.githubLink,
      ariaLabel: "GitHub profile (opens in a new tab)",
      icon: (
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      ),
      text: "GitHub",
      iconClass: styles.githubIcon,
    },
    {
      href: "https://www.buymeacoffee.com/hank1245",
      className: styles.bmcLink,
      ariaLabel: "Buy me a coffee (opens in a new tab)",
      icon: (
        <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.766-1.613a4.53 4.53 0 0 0-1.364-1.06c-.354-.263-.76-.45-1.204-.558L19.716 2a1.5 1.5 0 0 0-2.934-.516l-1.716 2.402c-.347.486-.891.847-1.534.847-.642 0-1.186-.361-1.533-.847L10.283 1.484A1.5 1.5 0 0 0 7.35 2l2.966 4.14c-.445.108-.851.295-1.205.558a4.53 4.53 0 0 0-1.364 1.06c-.378.45-.647 1.015-.766 1.613L6.85 6.415C5.39 6.263 4.163 7.69 4.434 9.1l.766 3.99c.201 1.047.787 1.978 1.64 2.606.854.629 1.915.982 2.97.982h4.38c1.055 0 2.116-.353 2.97-.982.853-.628 1.439-1.559 1.64-2.606l.766-3.99c.271-1.41-.956-2.837-2.416-2.685z" />
      ),
      text: "Buy me a coffee",
      iconClass: styles.bmcIcon,
    },
  ];

  return (
    <header className={styles.appHeader}>
      <nav className={styles.supportLinks} aria-label="Support links" role="navigation">
        <ul style={{ listStyle: "none", display: "flex", gap: "1rem", margin: 0, padding: 0 }}>
          {linkData.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={link.className}
                aria-label={link.ariaLabel}
              >
                <svg
                  className={link.iconClass}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  {link.icon}
                </svg>
                {link.text}
              </a>
            </li>
          ))}
        </ul>
        <div id="bmc-wbtn" className={styles.bmcButton} aria-hidden="true"></div>
      </nav>
      <h1>📁 Directory Tracer</h1>
      <p className={styles.appDescription}>
        A tool for exploring website directories and discovering hidden paths.
      </p>
    </header>
  );
};

export default Header;
