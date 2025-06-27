import React, { useEffect } from "react";
import styles from "../styles/Header.module.css";

const Header = () => {
  useEffect(() => {
    const loadBuyMeACoffeeScript = () => {
      // 기존 스크립트 정리
      const existingScript = document.querySelector(
        'script[src*="buymeacoffee"]'
      );
      if (existingScript) existingScript.remove();

      // 기존 버튼 정리
      const existingButton = document.getElementById("bmc-wbtn");
      if (existingButton) existingButton.innerHTML = "";

      // 새 스크립트 생성
      const script = document.createElement("script");
      script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";

      const attributes = {
        "data-name": "bmc-button",
        "data-slug": "hank1245",
        "data-color": "#FFDD00",
        "data-emoji": "",
        "data-font": "Cookie",
        "data-text": "Buy me a coffee",
        "data-outline-color": "#000000",
        "data-font-color": "#000000",
        "data-coffee-color": "#ffffff",
      };

      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });

      script.onload = () => {
        // 로딩 완료 후 잠시 대기하여 BMC 버튼이 생성되도록 함
        setTimeout(() => {
          const htmlButton = document.querySelector(`.${styles.bmcLink}`);
          const scriptButton = document.getElementById("bmc-wbtn");

          if (scriptButton && scriptButton.children.length > 0) {
            // BMC 스크립트 버튼이 성공적으로 로드됨
            if (htmlButton) htmlButton.style.display = "none";
            scriptButton.style.display = "block";
            scriptButton.style.opacity = "1";
            scriptButton.classList.add("loaded");
          } else {
            // BMC 스크립트 버튼이 로드되지 않음, fallback 유지
            if (htmlButton) htmlButton.style.display = "flex";
          }
        }, 200);
      };

      script.onerror = () => {
        // 스크립트 로딩 실패 시 HTML fallback 유지
        const htmlButton = document.querySelector(`.${styles.bmcLink}`);
        if (htmlButton) {
          htmlButton.style.display = "flex";
        }
      };

      document.head.appendChild(script);
    };

    // 즉시 실행하되, DOM이 준비된 후
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadBuyMeACoffeeScript);
    } else {
      loadBuyMeACoffeeScript();
    }

    return () => {
      const existingScript = document.querySelector(
        'script[src*="buymeacoffee"]'
      );
      if (existingScript) existingScript.remove();
    };
  }, []);

  const linkData = [
    {
      href: "https://github.com/hank1245",
      className: styles.githubLink,
      icon: (
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      ),
      text: "GitHub",
      iconClass: styles.githubIcon,
    },
    {
      href: "https://www.buymeacoffee.com/hank1245",
      className: styles.bmcLink,
      icon: (
        <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.766-1.613a4.53 4.53 0 0 0-1.364-1.06c-.354-.263-.76-.45-1.204-.558L19.716 2a1.5 1.5 0 0 0-2.934-.516l-1.716 2.402c-.347.486-.891.847-1.534.847-.642 0-1.186-.361-1.533-.847L10.283 1.484A1.5 1.5 0 0 0 7.35 2l2.966 4.14c-.445.108-.851.295-1.205.558a4.53 4.53 0 0 0-1.364 1.06c-.378.45-.647 1.015-.766 1.613L6.85 6.415C5.39 6.263 4.163 7.69 4.434 9.1l.766 3.99c.201 1.047.787 1.978 1.64 2.606.854.629 1.915.982 2.97.982h4.38c1.055 0 2.116-.353 2.97-.982.853-.628 1.439-1.559 1.64-2.606l.766-3.99c.271-1.41-.956-2.837-2.416-2.685z" />
      ),
      text: "Buy me a coffee",
      iconClass: styles.bmcIcon,
    },
  ];

  return (
    <header className={styles.appHeader}>
      <div className={styles.supportLinks}>
        {linkData.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={link.className}
          >
            <svg
              className={link.iconClass}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {link.icon}
            </svg>
            {link.text}
          </a>
        ))}
        <div id="bmc-wbtn" className={styles.bmcButton}></div>
      </div>
      <h1>📁 Directory Tracer</h1>
      <p className={styles.appDescription}>
        A tool for exploring website directories and discovering hidden paths.
      </p>
    </header>
  );
};

export default Header;
