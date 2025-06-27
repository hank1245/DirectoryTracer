import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import concurrent.futures
import re
from typing import Optional, List

PROXIES = {
    'http': 'socks5h://torproxy:9050',
    'https': 'socks5h://torproxy:9050'
}

HEADERS = {
    'User-Agent': ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                   'AppleWebKit/537.36 (KHTML, like Gecko) '
                   'Chrome/110.0.0.0 Safari/537.36')
}

DEFAULT_API_DICTIONARY = [
    "", "users", "user", "items", "products", "orders", "cart", "auth", "login", "logout",
    "register", "profile", "settings", "config", "status", "health", "ping", "api-docs",
    "swagger", "openapi", "graphql", "v1", "v2", "v3", "test", "dev", "prod", "data",
    "metrics", "logs", "admin", "management", "payment", "search", "notifications"
]

class MultiWebScanner:
    def __init__(self, target_url, dictionary, mode='normal', exclusions=None, respect_robots_txt=True, session_cookies_string: Optional[str] = None):
        self.target_url = target_url.rstrip('/')
        self.dictionary = dictionary
        self.api_dictionary = DEFAULT_API_DICTIONARY
        self.base_domain = urlparse(self.target_url).netloc
        self.found_directories = {}
        self.dictionary_scanned = set()
        self.mode = mode
        self.exclusions = set(exclusions) if exclusions else set()
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.respect_robots_txt = respect_robots_txt
        self.robots_disallowed_paths = set()
        
        self.server_info = {"Server": "Unknown", "X-Powered-By": "Unknown", "Framework_Hint": "Unknown"}
        self._headers_analyzed_for_target = False
        self.processed_js_files = set()
        self.js_discovered_api_endpoints = set()

        self._configure_session_cookies(session_cookies_string)
        self._configure_mode_settings()
        
        if self.respect_robots_txt:
            self._parse_robots_txt()

    def _configure_session_cookies(self, session_cookies_string: Optional[str]):
        """Configure session cookies from string."""
        if not session_cookies_string:
            return
            
        try:
            cookies_dict = {}
            for cookie_pair in session_cookies_string.split(';'):
                cookie_pair = cookie_pair.strip()
                if '=' in cookie_pair:
                    name, value = cookie_pair.split('=', 1)
                    cookies_dict[name.strip()] = value.strip()
            if cookies_dict:
                self.session.cookies.update(cookies_dict)
                print(f"[*] 세션 쿠키 적용됨: {cookies_dict.keys()}")
        except Exception as e:
            print(f"[!] 제공된 세션 쿠키 문자열 파싱 중 오류 발생: {e}")

    def _configure_mode_settings(self):
        """Configure session settings based on mode."""
        if self.mode == 'darkweb':
            self.session.proxies = PROXIES
            self.session.timeout = 30
            self.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0',
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1'
            })

    def _analyze_response_headers(self, response):
        if not self._headers_analyzed_for_target and response:
            server_header = response.headers.get('Server')
            x_powered_by_header = response.headers.get('X-Powered-By')
            cookies = response.cookies

            if server_header:
                self.server_info['Server'] = server_header
            if x_powered_by_header:
                self.server_info['X-Powered-By'] = x_powered_by_header
            
            framework_hint = self._detect_framework(server_header, x_powered_by_header, cookies)
            if framework_hint:
                self.server_info['Framework_Hint'] = framework_hint
            
            self._headers_analyzed_for_target = True

    def _detect_framework(self, server_header, x_powered_by_header, cookies):
        framework_checks = [
            (lambda: 'ASP.NET' in (server_header or '') or 'ASP.NET' in (x_powered_by_header or ''), 'ASP.NET'),
            (lambda: 'PHP' in (x_powered_by_header or ''), 'PHP'),
            (lambda: any(cookie.name.upper() == 'PHPSESSID' for cookie in cookies), 'PHP (Session)'),
            (lambda: 'Express' in (x_powered_by_header or ''), 'Express.js (Node.js)'),
            (lambda: 'Django' in (server_header or '') or any(cookie.name == 'csrftoken' for cookie in cookies), 'Django (Python)'),
            (lambda: 'Ruby' in (server_header or '') or 'Rails' in (x_powered_by_header or ''), 'Ruby on Rails'),
            (lambda: any(cookie.name.upper() == 'JSESSIONID' for cookie in cookies), 'Java (JSP/Servlets)')
        ]
        
        for check_func, framework_name in framework_checks:
            if check_func():
                return framework_name
        return None

    def _parse_robots_txt(self):
        parsed_url = urlparse(self.target_url)
        robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
        
        try:
            timeout = 30 if self.mode == 'darkweb' else 10
            response = self.session.get(robots_url, timeout=timeout)
            if response.status_code != 200:
                return
                
            lines = response.text.splitlines()
            current_user_agent = "*"
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                    
                parts = line.split(':', 1)
                if len(parts) != 2:
                    continue
                    
                directive = parts[0].strip().lower()
                value = parts[1].strip()
                
                if directive == "user-agent":
                    current_user_agent = value
                elif directive == "disallow" and self._should_apply_robots_rule(current_user_agent):
                    if value:
                        path = value
                        disallowed_url = urljoin(f"{parsed_url.scheme}://{parsed_url.netloc}", path)
                        self.robots_disallowed_paths.add(disallowed_url)
        except Exception:
            pass

    def _should_apply_robots_rule(self, user_agent):
        return (user_agent == "*" or 
                "mozilla" in user_agent.lower() or 
                self.session.headers['User-Agent'] in user_agent)

    def is_disallowed_by_robots(self, url):
        if not self.respect_robots_txt or not self.robots_disallowed_paths:
            return False
            
        return any(url.startswith(disallowed_path) for disallowed_path in self.robots_disallowed_paths)

    def is_excluded(self, url):
        parsed_url = urlparse(url)
        
        if url in self.exclusions or parsed_url.netloc in self.exclusions:
            return True

        current_path = parsed_url.path or "/"
        
        for exclusion_pattern in self.exclusions:
            if exclusion_pattern.startswith('/') and current_path.startswith(exclusion_pattern):
                return True

        return self.is_disallowed_by_robots(url)

    def fetch_url(self, url, timeout=None):
        if self.is_excluded(url):
            return None
        
        if timeout is None:
            timeout = 30 if self.mode == 'darkweb' else 10
            
        try:
            response = self.session.get(url, timeout=timeout)
            if urlparse(url).netloc == self.base_domain:
                self._analyze_response_headers(response)
            return response
        except requests.RequestException:
            return None

    def _extract_js_links(self, soup, page_url):
        """JavaScript 파일 URL을 script 태그에서 추출."""
        js_links = set()
        if not soup:
            return list(js_links)
        
        for script_tag in soup.find_all("script", src=True):
            js_src = script_tag.get("src")
            if js_src and js_src.lower().endswith('.js'):
                full_js_url = urljoin(page_url, js_src)
                if urlparse(full_js_url).netloc == self.base_domain:
                    js_links.add(full_js_url)
        return list(js_links)

    def _parse_js_for_endpoints(self, js_content, page_url_where_script_was_found):
        if not js_content:
            return []
        
        found_paths = set()
        patterns = [
            r"""fetch\s*\(\s*['"]((?:[^'"\s]|\\')+)['"]""",
            r"""axios\.(?:get|post|put|delete|request)\s*\(\s*['"]((?:[^'"\s]|\\')+)['"]""",
            r"""['"]((?:\/[a-zA-Z0-9_.-]+)*(?:\/(api|v\d+|rest|service|data|user|auth)\S*?))['"]""",
            r"""['"](\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:[?#]\S*)?)['"]"""
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, js_content):
                path = match.group(1)
                processed_path = self._process_js_path(path, page_url_where_script_was_found)
                if processed_path:
                    found_paths.add(processed_path)
                        
        return self._filter_valid_endpoints(found_paths)

    def _process_js_path(self, path, page_url):
        if path.startswith(('http://', 'https://', '//')):
            parsed_path = urlparse(path)
            if parsed_path.netloc and parsed_path.netloc == self.base_domain:
                return urljoin(self.target_url, parsed_path.path)
        elif path.startswith('/'):
            return urljoin(self.target_url, path)
        else:
            if not any(c in path for c in ['<', '>', '{', '}']):
                return urljoin(page_url, path)
        return None

    def _filter_valid_endpoints(self, found_paths):
        filtered_endpoints = set()
        excluded_extensions = ['.js', '.css', '.html', '.png', '.jpg', '.gif', '.svg', '.woff', '.ttf']
        
        for p in found_paths:
            parsed_p = urlparse(p)
            base_p_path = parsed_p.path 
            if (base_p_path and 
                not any(base_p_path.lower().endswith(ext) for ext in excluded_extensions) and 
                len(base_p_path) > 3):
                full_endpoint_url = urljoin(self.target_url, base_p_path)
                if urlparse(full_endpoint_url).netloc == self.base_domain:
                    filtered_endpoints.add(full_endpoint_url)
        
        return list(filtered_endpoints)

    def _check_directory_listing_patterns(self, text_content):
        patterns = [
            r"Index of /",
            r"<title>Index of .*?</title>",
            r"Parent Directory",
            r"\[To Parent Directory\]",
            r"Directory Listing For /",
            r"<h1>Index of .*?</h1>"
        ]
        return any(re.search(pattern, text_content, re.IGNORECASE) for pattern in patterns)

    def analyze_directory_listing(self, response):
        """응답을 분석하여 디렉토리 리스팅 여부를 판단."""
        if not response or response.status_code != 200:
            return False

        content_type = response.headers.get('Content-Type', '').lower()
        if 'text/html' in content_type:
            return self._check_directory_listing_patterns(response.text)
        
        return False

    def dictionary_scan_single(self, base_url, dir_name, source='unknown'):
        url = f"{base_url.rstrip('/')}/{dir_name.lstrip('/')}"
        
        if self.is_excluded(url):
            return url, self._create_excluded_result(source)

        response = self.fetch_url(url)
        if response:
            return url, self._create_response_result(response, source)
        else:
            return url, self._create_error_result(source)

    def _create_excluded_result(self, source):
        return {
            'status_code': 'EXCLUDED',
            'content_length': 0,
            'directory_listing': False,
            'note': 'URL excluded by configuration or robots.txt.',
            'source': source 
        }

    def _create_response_result(self, response, source):
        status_code = response.status_code
        content_length = len(response.content)
        directory_listing = False
        
        if source == 'js_api':
            note = self._get_api_note(status_code)
        else:
            directory_listing = self.analyze_directory_listing(response) if status_code == 200 else False
            note = self._get_directory_note(status_code, directory_listing)
        
        return {
            'status_code': status_code,
            'content_length': content_length,
            'directory_listing': directory_listing,
            'note': note,
            'source': source 
        }

    def _create_error_result(self, source):
        return {
            'status_code': 'NO_RESPONSE_OR_ERROR',
            'content_length': 0,
            'directory_listing': False,
            'note': 'Failed to fetch URL (request error or excluded by fetch_url).',
            'source': source 
        }

    def _get_api_note(self, status_code):
        api_notes = {
            200: 'API endpoint/path responded (200).',
            403: 'API endpoint/path access denied (403).',
            404: 'API endpoint/path not found (404).'
        }
        return api_notes.get(status_code, f'API endpoint/path. Status: {status_code}')

    def _get_directory_note(self, status_code, directory_listing):
        if status_code == 200:
            return 'Directory listing found (200).' if directory_listing else 'Path found (200).'
        elif status_code == 403:
            return 'Access denied (403).'
        else:
            return f'Scan attempted. Status: {status_code}'

    def dictionary_scan(self, base_url, source='initial'):
        current_dictionary = self.api_dictionary if source == 'js_api' else self.dictionary
        if not current_dictionary:
            return

        results = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_dir = {
                executor.submit(self.dictionary_scan_single, base_url, dir_name, source): dir_name
                for dir_name in current_dictionary
            }
            for future in concurrent.futures.as_completed(future_to_dir):
                original_dir_name = future_to_dir[future]
                attempted_url = f"{base_url.rstrip('/')}/{original_dir_name.lstrip('/')}"
                try:
                    _, scan_info = future.result() 
                    results[attempted_url] = scan_info 
                except Exception as e:
                    results[attempted_url] = {
                        'status_code': 'SCANNER_TASK_ERROR',
                        'content_length': 0,
                        'directory_listing': False,
                        'note': f'Internal error during scan attempt for {original_dir_name}: {str(e)}',
                        'source': source 
                    }
        
        self.found_directories.update(results)
        if source in ['initial', 'crawl']:
            self.dictionary_scanned.add(base_url)

    def crawl_recursive(self, current_url, visited, depth, max_depth):
        if depth > max_depth or current_url in visited or self.is_excluded(current_url):
            return

        visited.add(current_url)
        response = self.fetch_url(current_url)
        if not response:
            return

        if current_url not in self.found_directories:
            self.found_directories[current_url] = self._create_crawl_result(response)
        
        self.dictionary_scan(current_url, source='crawl')

        if urlparse(current_url).netloc == self.base_domain:
            self._analyze_response_headers(response)

        self._process_page_content(response, current_url, visited, depth, max_depth)

    def _create_crawl_result(self, response):
        status_code = response.status_code
        content_length = len(response.content)
        directory_listing = False

        if 'text/html' in response.headers.get('Content-Type', '').lower():
            directory_listing = self.analyze_directory_listing(response)

        if status_code == 200:
            note = 'Crawled path with directory listing found (200).' if directory_listing else 'Crawled path found (200).'
        elif status_code == 403:
            note = 'Crawled path access denied (403).'
        else:
            note = f'Crawled path. Status: {status_code}'
        
        return {
            'status_code': status_code,
            'content_length': content_length,
            'directory_listing': directory_listing,
            'note': note,
            'source': 'crawl'
        }

    def _process_page_content(self, response, current_url, visited, depth, max_depth):
        soup = BeautifulSoup(response.text, 'html.parser')
        
        if soup: 
            js_file_urls = self._extract_js_links(soup, current_url)
            for js_url in js_file_urls:
                if js_url not in self.processed_js_files:
                    self.processed_js_files.add(js_url) 
                    js_response = self.fetch_url(js_url) 
                    if js_response and js_response.text:
                        self.js_scan_and_evaluate_api_bases(js_response.text, js_url)

        links = self._extract_internal_links(soup, current_url, visited)
        for link in links:
            if link not in visited: 
                self.crawl_recursive(link, visited, depth + 1, max_depth)

    def _extract_internal_links(self, soup, current_url, visited):
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(current_url, href)
            parsed_full_url = urlparse(full_url)
            
            if (parsed_full_url.netloc != self.base_domain or 
                parsed_full_url.scheme not in ['http', 'https'] or
                full_url in visited or 
                self.is_excluded(full_url)):
                continue
                
            links.append(full_url)
        return links

    def report(self):
        if not self.found_directories:
            return
            
        for url, info in self.found_directories.items():
            if info:
                status = info['status_code']
                length = info['content_length']
                listing = "Enabled (잠재적 노출)" if info['directory_listing'] else "Disabled or Not Detected"
                print(f"URL: {url}")
                print(f"  Status: {status}, Length: {length}")
                print(f"  Directory Listing: {listing}")

    def run(self, max_depth=2):
        initial_response = self.fetch_url(self.target_url)
        if initial_response and self.target_url not in self.found_directories:
            self.found_directories[self.target_url] = self._create_initial_result(initial_response)

            if not self._headers_analyzed_for_target:
                self._analyze_response_headers(initial_response)

        self.dictionary_scan(self.target_url, source='initial') 
        
        visited = set()
        self.crawl_recursive(self.target_url, visited, depth=0, max_depth=max_depth)
        
        return {"directories": self.found_directories, "server_info": self.server_info}

    def _create_initial_result(self, response):
        status_code = response.status_code
        content_length = len(response.content)
        directory_listing = False

        if 'text/html' in response.headers.get('Content-Type', '').lower():
            directory_listing = self.analyze_directory_listing(response)

        if status_code == 200:
            note = 'Initial target with directory listing found (200).' if directory_listing else 'Initial target found (200).'
        elif status_code == 403:
            note = 'Initial target access denied (403).'
        else:
            note = f'Initial target. Status: {status_code}'
        
        return {
            'status_code': status_code,
            'content_length': content_length,
            'directory_listing': directory_listing,
            'note': note,
            'source': 'target_base' 
        }

    def js_scan_and_evaluate_api_bases(self, js_content, page_url):
        potential_api_paths = self._parse_js_for_endpoints(js_content, page_url)

        if potential_api_paths:
            for api_base_url in potential_api_paths:
                if api_base_url in self.js_discovered_api_endpoints:
                    continue
                if self.is_excluded(api_base_url):
                    self.js_discovered_api_endpoints.add(api_base_url)
                    continue
                
                self.js_discovered_api_endpoints.add(api_base_url)

                response = self.fetch_url(api_base_url)
                if response and response.status_code in [200, 403, 401, 405, 400, 404, 500]:
                    self.found_directories[api_base_url] = self._create_js_api_result(response, api_base_url)
                
                self.dictionary_scan(api_base_url, source='js_api')

    def _create_js_api_result(self, response, api_base_url):
        status_code = response.status_code
        content_length = len(response.content)
        directory_listing = self.analyze_directory_listing(response) if 'text/html' in response.headers.get('Content-Type','').lower() else False
        
        note_map = {
            200: "JS Discovered API Base found (200).",
            403: "JS Discovered API Base access denied (403).",
            401: "JS Discovered API Base requires authentication (401).",
            405: "JS Discovered API Base - Method Not Allowed (405).",
            404: "JS Discovered API Base - Not Found (404)."
        }
        note = note_map.get(status_code, f"JS Discovered API Base. Status: {status_code}")

        return {
            'status_code': status_code,
            'content_length': content_length,
            'directory_listing': directory_listing,
            'note': note,
            'source': 'js_api_base'
        }
