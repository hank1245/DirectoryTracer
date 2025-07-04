import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

class TestMainAppSimplified(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    @patch('main.MultiWebScanner')
    def test_scan_endpoint_success_call(self, mock_scanner_class):
        mock_scanner_instance = MagicMock()
        mock_scanner_instance.run.return_value = {
            "directories": {"http://example.com/found": {"status_code": 200, "content_length": 100, "directory_listing": False, "note": "Mocked scan.", "source": "initial"}},
            "server_info": {"Server": "MockedServer/1.0"}
        }
        mock_scanner_class.return_value = mock_scanner_instance

        payload = {
            "target_urls": ["http://example.com"],
            "mode": "normal",
            "exclusions": [],
            "max_depth": 1,
            "respect_robots_txt": True,
            "dictionary_operations": [],
            "use_default_dictionary": False,
            "custom_dictionary_path": None,
            "session_cookies_string": None
        }

        response = self.client.post("/scan", json=payload)
        
        self.assertEqual(response.status_code, 200)
        mock_scanner_class.assert_called_once()
        args, kwargs = mock_scanner_class.call_args
        self.assertEqual(kwargs.get('target_url'), "http://example.com")
        self.assertEqual(kwargs.get('mode'), "normal")
        
        mock_scanner_instance.run.assert_called_once()
        
        response_data = response.json()
        self.assertIn("result", response_data)
        self.assertIn("http://example.com", response_data["result"])
        self.assertIn("directories", response_data["result"]["http://example.com"])

if __name__ == '__main__':
    unittest.main()