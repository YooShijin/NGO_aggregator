# scrapper.py — PHASE 1
import re
from bs4 import BeautifulSoup

HTML_FILE = "ngos.html"


def parse_ngos_from_file(html_path):
    """
    Very first version:
    - Parse one HTML file
    - Print NGO names only (from the first <span> in each block)
    """
    with open(html_path, "r", encoding="windows-1252", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    ngo_divs = soup.select("div.lay-1.donor-menories-bg")
    ngos = []

    for div in ngo_divs:
        spans = div.find_all("span")
        if not spans:
            continue

        name = spans[0].get_text(strip=True)
        ngos.append({"name": name})

    print(f"[+] Parsed {len(ngos)} NGOs from {html_path}")
    return ngos


def main():
    ngos = parse_ngos_from_file(HTML_FILE)

    for i, ngo in enumerate(ngos, start=1):
        print("=" * 80)
        print(f"NGO #{i}")
        print(f"Name    : {ngo['name']}")
    print("=" * 80)
    print(f"Total NGOs: {len(ngos)}")


if __name__ == "__main__":
    main()
