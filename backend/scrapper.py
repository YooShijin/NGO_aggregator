# scrapper.py — PHASE 3
import re
from bs4 import BeautifulSoup

HTML_FILES = [
    "ngos.html",
    "ngos2.html",
    "ngos3.html",
    "ngos4.html",
    "ngos5.html",
    "ngos6.html",
]


def parse_ngos_from_file(html_path):
    """
    Same parsing logic, but now used for each HTML file.
    """
    with open(html_path, "r", encoding="windows-1252", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    ngo_divs = soup.select("div.lay-1.donor-menories-bg")
    ngos = []

    for div in ngo_divs:
        spans = div.find_all("span")
        if len(spans) < 4:
            continue

        name = spans[0].get_text(strip=True)
        address = spans[1].get_text(strip=True)
        city = spans[2].get_text(strip=True)
        state = spans[3].get_text(strip=True)

        all_strings = [s.strip() for s in div.stripped_strings if s.strip()]
        details_text = " ".join(all_strings[4:])

        pincode = None
        phone = None
        mobile = None
        email = None
        website = None

        m = re.search(r"Pincode\s*-\s*(\d{6})", details_text, flags=re.IGNORECASE)
        if m:
            pincode = m.group(1).strip()

        m = re.search(r"Phone:\s*([^EMW<]+)", details_text)
        if m:
            phone = m.group(1).strip(" /")

        m = re.search(r"Mobile:\s*([^PEW<]+)", details_text)
        if m:
            mobile = m.group(1).strip(" /")

        m = re.search(r"Email:\s*([^\s<]+@[^\s<]+)", details_text)
        if m:
            email = m.group(1).strip()

        m = re.search(r"Website:\s*([^\s<]+)", details_text)
        if m:
            website = m.group(1).strip()

        ngos.append(
            {
                "name": name,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode,
                "phone": phone,
                "mobile": mobile,
                "email": email,
                "website": website,
            }
        )

    print(f"[+] Parsed {len(ngos)} NGOs from {html_path}")
    return ngos


def load_all_ngos_from_html():
    all_ngos = []
    for path in HTML_FILES:
        try:
            ngos = parse_ngos_from_file(path)
            all_ngos.extend(ngos)
        except FileNotFoundError:
            print(f"[!] File not found: {path} (skipping)")
    print(f"[+] Total NGOs parsed from all files: {len(all_ngos)}")
    return all_ngos


def main():
    ngos = load_all_ngos_from_html()

    for i, ngo in enumerate(ngos, start=1):
        print("=" * 80)
        print(f"NGO #{i}")
        print(f"Name    : {ngo['name']}")
        print(f"Address : {ngo['address']}")
        print(f"City    : {ngo['city']}")
        print(f"State   : {ngo['state']}")
        print(f"Pincode : {ngo['pincode']}")
        print(f"Phone   : {ngo['phone']}")
        if ngo["mobile"]:
            print(f"Mobile  : {ngo['mobile']}")
        if ngo["email"]:
            print(f"Email   : {ngo['email']}")
        if ngo["website"]:
            print(f"Website : {ngo['website']}")
    print("=" * 80)
    print(f"Total NGOs across all files: {len(ngos)}")


if __name__ == "__main__":
    main()
