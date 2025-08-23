const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000"; // 'backend'를 'localhost'로 변경

export const scanWebsite = async (
  targetUrls,
  mode,
  exclusions,
  maxDepth,
  respectRobotsTxt,
  dictionaryOperations,
  useDefaultDictionary,
  sessionCookies // ADDED
) => {
  const payload = {
    target_urls: targetUrls,
    mode: mode,
    exclusions: exclusions || [],
    max_depth: maxDepth,
    respect_robots_txt: respectRobotsTxt,
    dictionary_operations: dictionaryOperations || [],
    use_default_dictionary: useDefaultDictionary,
    session_cookies_string: sessionCookies || null, // ADDED
  };
  const resp = await fetch(`${API_BASE_URL}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = resp.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await resp.json();
  } else {
    const text = await resp.text();
    throw new Error(text || `Request failed with status ${resp.status}`);
  }

  if (!resp.ok) {
    const detail = data && (data.detail || data.error);
    throw new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail
            .map((d) => `${d.loc?.join?.(".") || "error"} - ${d.msg || d}`)
            .join("; ")
        : `Request failed with status ${resp.status}`
    );
  }

  return data.result;
};

// 기본 딕셔너리 목록 가져오기 (프론트엔드 상수로 정의)
export const getDefaultDictionary = () => [
  "admin/",
  "backup/",
  "test/",
  "dev/",
  "old/",
  "logs/",
  "tmp/",
  "temp/",
  "public/",
  "uploads/",
  "files/",
  "downloads/",
  "data/",
  "config/",
  "private/",
  "web/",
  "new/",
  "archive/",
  ".git/",
  ".env/",
  ".svn/",
  ".htaccess/",
  ".htpasswd/",
  ".vscode/",
  ".idea/",
  "node_modules/",
  "vendor/",
  "build/",
  "dist/",
  "out/",
  "db/",
  "sql/",
  "credentials/",
  "secret/", // 추가
  "static/", // 추가
  // .well-known 경로 추가
  ".well-known/",
  ".well-known/security.txt",
];
