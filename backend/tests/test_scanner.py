import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scanner import MultiWebScanner

TARGET_HOST_URL = "http://testphp.vulnweb.com"

class TestMultiWebScannerSimplified(unittest.TestCase):

    @patch('scanner.requests.Session.get')
    def test_initialization_and_robots_txt_handling(self, mock_session_get):
        robots_response_found = self._create_mock_response(200, "User-agent: *\nDisallow: /admin/")
        robots_response_found.headers = {'Server': 'TestServer', 'Content-Type': 'text/plain'}
        
        robots_response_not_found = self._create_mock_response(404)
        robots_response_not_found.headers = {'Server': 'TestServer', 'Content-Type': 'text/plain'}

        mock_session_get.return_value = robots_response_found
        scanner_found = MultiWebScanner(target_url=TARGET_HOST_URL, dictionary=[], respect_robots_txt=True)
        
        self.assertEqual(scanner_found.target_url, TARGET_HOST_URL)
        self.assertTrue(scanner_found.respect_robots_txt)
        self.assertIn(f"{TARGET_HOST_URL}/admin/", scanner_found.robots_disallowed_paths)
        mock_session_get.assert_called_with(f"{TARGET_HOST_URL}/robots.txt", timeout=10)
        mock_session_get.reset_mock() 

        mock_session_get.return_value = robots_response_not_found
        scanner_not_found = MultiWebScanner(target_url=f"{TARGET_HOST_URL}/some/other/path", dictionary=[], respect_robots_txt=True)
        
        self.assertEqual(scanner_not_found.robots_disallowed_paths, set())
        mock_session_get.assert_called_with(f"{TARGET_HOST_URL}/robots.txt", timeout=10)

    def _create_mock_response(self, status_code, content="<html>Test</html>"):
        mock_response = MagicMock()
        mock_response.status_code = status_code
        mock_response.text = content
        mock_response.content = content.encode()
        mock_response.headers = {'Content-Type': 'text/html', 'Server': 'TestServer'}
        return mock_response

    @patch('scanner.requests.Session.get')
    def test_fetch_url_basic(self, mock_session_get):
        scanner = MultiWebScanner(target_url=TARGET_HOST_URL, dictionary=[], respect_robots_txt=False)
        
        mock_session_get.return_value = self._create_mock_response(200)
        response_success = scanner.fetch_url(f"{TARGET_HOST_URL}/goodpage")
        
        self.assertIsNotNone(response_success)
        self.assertEqual(response_success.status_code, 200)
        mock_session_get.assert_called_once_with(f"{TARGET_HOST_URL}/goodpage", timeout=10)
        mock_session_get.reset_mock()

        mock_session_get.return_value = self._create_mock_response(404, "Not Found")
        response_not_found = scanner.fetch_url(f"{TARGET_HOST_URL}/badpage")
        
        self.assertIsNotNone(response_not_found) 
        self.assertEqual(response_not_found.status_code, 404)
        mock_session_get.assert_called_once_with(f"{TARGET_HOST_URL}/badpage", timeout=10)

    def test_is_excluded_simple(self):
        with patch('scanner.requests.Session.get') as mock_get_init_for_robots:
            mock_get_init_for_robots.return_value.status_code = 404 
            
            scanner = MultiWebScanner(
                target_url=TARGET_HOST_URL,
                dictionary=[],
                exclusions={"/secret/", "/confidential/path/"}, 
                respect_robots_txt=False 
            )
        
        test_cases = [
            (f"{TARGET_HOST_URL}/secret/file.txt", True, "should be excluded by '/secret/'"),
            (f"{TARGET_HOST_URL}/confidential/path/deep/file.php", True, "should be excluded by '/confidential/path/'"),
            (f"{TARGET_HOST_URL}/public/file.txt", False, "should not be excluded"),
            (f"{TARGET_HOST_URL}/secret", False, "should not be excluded by '/secret/' if trailing slash matters in pattern")
        ]
        
        for url, expected_excluded, description in test_cases:
            with self.subTest(url=url):
                result = scanner.is_excluded(url)
                self.assertEqual(result, expected_excluded, f"URL '{url}' {description}")

if __name__ == '__main__':
    unittest.main()