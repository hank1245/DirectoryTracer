import { useEffect } from "react";

export default function useBuyMeACoffee(styles) {
  useEffect(() => {
    const loadBuyMeACoffeeScript = () => {
      const existingScript = document.querySelector(
        'script[src*="buymeacoffee"]'
      );
      if (existingScript) existingScript.remove();

      const existingButton = document.getElementById("bmc-wbtn");
      if (existingButton) existingButton.innerHTML = "";

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
        setTimeout(() => {
          const htmlButton = document.querySelector(`.${styles?.bmcLink}`);
          const scriptButton = document.getElementById("bmc-wbtn");

          if (scriptButton && scriptButton.children.length > 0) {
            if (htmlButton) htmlButton.style.display = "none";
            scriptButton.style.display = "block";
            scriptButton.style.opacity = "1";
            scriptButton.classList.add("loaded");
          } else if (htmlButton) {
            htmlButton.style.display = "flex";
          }
        }, 200);
      };

      script.onerror = () => {
        const htmlButton = document.querySelector(`.${styles?.bmcLink}`);
        if (htmlButton) htmlButton.style.display = "flex";
      };

      document.head.appendChild(script);
    };

    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadBuyMeACoffeeScript);
      } else {
        loadBuyMeACoffeeScript();
      }
    }

    return () => {
      const existingScript = document.querySelector(
        'script[src*="buymeacoffee"]'
      );
      if (existingScript) existingScript.remove();
    };
  }, [styles]);
}
