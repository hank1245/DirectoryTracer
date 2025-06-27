import sys
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from scanner import MultiWebScanner
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_DICTIONARY = [
    "admin/", "backup/", "test/", "dev/", "old/", "logs/", "tmp/", "temp/",
    "public/", "uploads/", "files/", "downloads/", "data/", "config/",
    "private/", "web/", "new/", "archive/", ".git/", ".env/", ".svn/",
    ".htaccess/", ".htpasswd/", ".vscode/", ".idea/", "node_modules/",
    "vendor/", "build/", "dist/", "out/", "db/", "sql/", "credentials/", "secret/", "static/", 
    ".well-known/",
    ".well-known/security.txt",
]

class DictionaryOperation(BaseModel):
    type: str
    paths: List[str]

class ScanRequest(BaseModel):
    target_urls: List[str]
    mode: str = 'normal'
    dictionary_operations: Optional[List[DictionaryOperation]] = None
    use_default_dictionary: bool = True
    exclusions: list[str] = []
    max_depth: int = 2
    respect_robots_txt: bool = True
    session_cookies_string: Optional[str] = None

def prepare_dictionary(request: ScanRequest) -> List[str]:
    """Prepare the final dictionary based on request parameters."""
    final_dictionary = []
    if request.use_default_dictionary:
        final_dictionary.extend(DEFAULT_DICTIONARY)
    
    if request.dictionary_operations:
        current_dict_set = set(final_dictionary)
        for op in request.dictionary_operations:
            if op.type == "add":
                current_dict_set.update(op.paths)
            elif op.type == "remove":
                current_dict_set.difference_update(op.paths)
        final_dictionary = sorted(current_dict_set)
    
    return final_dictionary or DEFAULT_DICTIONARY

@app.post("/scan")
async def scan(request: ScanRequest):
    all_results_by_target = {}
    final_dictionary = prepare_dictionary(request)
    
    try:
        for target_url_item in request.target_urls:
            scanner = MultiWebScanner(
                target_url=target_url_item,
                dictionary=final_dictionary,
                mode=request.mode,
                exclusions=request.exclusions,
                respect_robots_txt=request.respect_robots_txt,
                session_cookies_string=request.session_cookies_string
            )
            result_item_data = scanner.run(max_depth=request.max_depth)
            all_results_by_target[target_url_item] = result_item_data
        
        return {"result": all_results_by_target}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Critical error during scan process for request {request.target_urls}: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Scan failed due to an internal server error. Error: {str(e)}. Check backend logs for more details.")