# Directory Tracer - Web Directory & API Endpoint Scanner

Directory Tracer is a comprehensive web application designed to scan websites for exposed directories, files, and potential API endpoints. It combines dictionary-based scanning, recursive crawling, and JavaScript analysis to uncover accessible paths with an intuitive cyberpunk-themed interface.

## 🚀 Overview

This tool allows security researchers and developers to input one or more target URLs and configure various scanning parameters. It identifies directory listings, common files, and potential API base paths by analyzing linked JavaScript files. Authentication for sites requiring login can be handled by providing session cookies, making it suitable for authenticated scanning scenarios.

## ✨ Key Features

### 🎯 Multi-Target Scanning

- Scan multiple websites simultaneously
- Support for HTTP and HTTPS protocols
- Comprehensive target validation

### 📚 Dictionary-Based Scanning

- Customizable wordlist for common directories and files
- Default dictionary with 40+ common paths included
- Add or remove dictionary items for specific scans
- Supports both directory and file scanning

### 🔄 Recursive Crawling

- Parses HTML links (`<a>` tags) to discover new paths
- User-defined maximum depth control
- Intelligent link filtering and validation

### 🔐 Session Cookie Authentication

- Support for authenticated scanning
- Simple cookie string input format
- Maintains session state throughout scan

### 🔍 JavaScript API Endpoint Discovery

- Extracts JavaScript file links from crawled pages
- Fetches and parses JS files using regex patterns
- Discovers potential API endpoint base URLs
- Performs dictionary-based scans on discovered API paths
- Identifies endpoints like `/api/v1/users`, `/api/v2/status`, etc.

### 📊 Server Information Gathering

- Identifies web server software via HTTP headers
- Detects underlying frameworks and technologies
- Collects X-Powered-By and other revealing headers

### 🚫 Path Exclusions

- Respects `robots.txt` rules (configurable)
- Custom URL pattern exclusions
- Smart filtering to avoid unwanted paths

### 🌐 Proxy Support

- **Normal Mode**: Direct connection
- **Darkweb Mode**: SOCKS5 proxy support (configured for Tor at `localhost:9050`)

### 🎨 Modern Interface

- Cyberpunk-themed dark UI
- Real-time scan progress
- Sortable and filterable results table
- Responsive design for all devices

### 📄 Comprehensive Reporting

- Detailed JSON reports with scan metadata
- Server information and discovery statistics
- Complete path attempt details with status codes
- Downloadable results for further analysis

## 🛠 Technology Stack

- **Backend**: Python (FastAPI), Requests, BeautifulSoup4
- **Frontend**: React.js, Axios, CSS Modules
- **Containerization**: Docker, Docker Compose
- **Styling**: Custom CSS with cyberpunk theme

## 📋 Installation and Setup

### Prerequisites

- Docker and Docker Compose installed
- At least 2GB available RAM
- Network access to target websites

### Quick Start

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd directory_scanner
   ```

2. **Build and Run with Docker Compose**:

   ```bash
   docker-compose up --build -d
   ```

3. **Access the Application**:

   - **Frontend**: http://localhost:3000
   - **Backend API Documentation**: http://localhost:8000/docs

4. **Stop the Application**:
   ```bash
   docker-compose down
   ```

### Manual Installation (Development)

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 📖 How to Use

### Basic Scanning

1. **Open the Application** at `http://localhost:3000`

2. **Enter Target URLs**:

   - Input one or more full URLs (e.g., `http://example.com`, `https://test.site/path/`)
   - Each URL should be on a new line

3. **Configure Scan Options**:

   - **Scan Mode**: Choose between Normal or Darkweb (proxy) mode
   - **Max Depth**: Set maximum crawling depth (1-5)
   - **Respect robots.txt**: Enable/disable robots.txt compliance

4. **Dictionary Settings**:

   - Use default dictionary or customize for your scan
   - Add/remove items as needed
   - Changes apply only to current scan

5. **Start Scanning**: Click "Start Scan" button

### Authenticated Scanning

For sites requiring login:

1. **Login to Target Site** using your browser
2. **Extract Session Cookies**:
   - Open Developer Tools (F12)
   - Navigate to Application/Storage tab
   - Find Cookies for the target domain
   - Copy cookie string (e.g., `sessionid=abc123; token=xyz789`)
3. **Paste Cookie String** in the "Session Cookies" field
4. **Start Scan** - all requests will include your session cookies

### Advanced Configuration

- **Exclusions**: Specify URL patterns to skip during scanning
- **Custom Dictionary**: Modify the wordlist for specific target types
- **Proxy Settings**: Configure SOCKS5 proxy for anonymous scanning

## 📊 Understanding Results

### Result Categories

- **🟢 Status 200**: Successfully found directories/files
- **🟡 Status 403**: Access denied (directory exists but forbidden)
- **🔴 Status 404**: Not found
- **🔵 API Endpoints**: Discovered through JavaScript analysis

### Filtering Options

- **Found Directories & APIs**: All successful discoveries (200, 403)
- **Found API Endpoints**: Only JavaScript-discovered APIs
- **Found Directories**: Traditional directory discoveries only
- **All Attempted Paths**: Complete scan history
- **Excluded Paths**: Skipped due to rules/robots.txt
- **Errors/No Response**: Failed requests

### Discovery Sources

- **Initial Scan**: Dictionary-based discovery
- **Crawled Page Scan**: Found through link crawling
- **JS API Path**: Discovered in JavaScript files
- **JS API Base**: Base API URLs from JavaScript
- **Target Base URL**: Original target processing

## 📄 Report Format

Generated JSON reports include:

```json
{
  "scan_completed_timestamp": "2024-01-01T12:00:00Z",
  "scan_duration_seconds": 45.23,
  "scan_metadata": {
    "targets": ["http://example.com"],
    "max_crawling_depth": 2,
    "respect_robots_txt": true,
    "exclusions_used": [],
    "session_cookies_provided": false,
    "dictionary_settings": {
      "use_default_dictionary": true,
      "dictionary_operations": []
    },
    "server_information": [
      {
        "target": "http://example.com",
        "info": {
          "server": "nginx/1.20.1",
          "x_powered_by": "PHP/7.4.0"
        }
      }
    ]
  },
  "summary": {
    "total_targets_scanned": 1,
    "total_paths_attempted": 156,
    "successful_directories_found": 12,
    "responsive_api_endpoints_found": 3
  },
  "all_attempted_paths_details": [
    {
      "url": "http://example.com/admin/",
      "status_code": "403",
      "content_length": 1234,
      "directory_listing": false,
      "source": "initial",
      "note": "Access denied (403)."
    }
  ],
  "successful_directories_list": [...],
  "responsive_api_endpoints_list": [...]
}
```

## ⚠️ Important Notes & Disclaimer

### Ethical Use

- **Educational Purposes**: This tool is intended for learning and authorized testing only
- **Authorization Required**: Only scan systems you own or have explicit permission to test
- **Legal Compliance**: Unauthorized scanning is illegal and unethical

### Performance Considerations

- **Resource Usage**: Scanning large sites can be time and resource intensive
- **Rate Limiting**: Tool respects server resources but may trigger rate limits
- **Network Impact**: High-depth scans generate significant network traffic

### Technical Limitations

- **JavaScript Parsing**: Regex-based parsing may miss obfuscated endpoints
- **False Positives**: Some discovered paths may not be actual endpoints
- **Dynamic Content**: May not detect dynamically generated paths

### Security Considerations

- **Session Cookies**: Handle authentication tokens securely
- **Network Exposure**: Be cautious when using proxy modes
- **Data Storage**: Reports contain sensitive path information

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues, questions, or feature requests:

- Open an issue on the repository
- Check existing documentation
- Review the API documentation at `/docs`

---

**Remember**: Always obtain proper authorization before scanning any website or system. Use this tool responsibly and in accordance with applicable laws and regulations.
