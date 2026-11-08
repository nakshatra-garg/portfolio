"""Point the site at its final domain.

Usage:
    python scripts/set_domain.py naksh.ai

Replaces the __SITE_URL__ placeholder (or a previously set domain) in the
HTML/robots/sitemap files and writes the CNAME file used by GitHub Pages.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = ["index.html", "robots.txt", "sitemap.xml"]
STATE = ROOT / "scripts" / ".domain.json"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("Usage: python scripts/set_domain.py <domain>   e.g. naksh.ai")

    domain = re.sub(r"^https?://", "", sys.argv[1].strip()).strip("/").lower()
    if not re.fullmatch(r"[a-z0-9-]+(\.[a-z0-9-]+)+", domain):
        sys.exit(f"'{domain}' doesn't look like a domain name.")

    old = json.loads(STATE.read_text())["url"] if STATE.exists() else "__SITE_URL__"
    new = f"https://{domain}"

    for name in FILES:
        path = ROOT / name
        text = path.read_text(encoding="utf-8")
        path.write_text(text.replace(old, new), encoding="utf-8")
        print(f"updated {name}")

    (ROOT / "CNAME").write_text(domain + "\n", encoding="utf-8")
    STATE.write_text(json.dumps({"url": new}), encoding="utf-8")
    print(f"wrote CNAME -> {domain}\nDone. Site URL is now {new}")


if __name__ == "__main__":
    main()
