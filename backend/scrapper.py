import re
from datetime import datetime

from bs4 import BeautifulSoup

from app import create_app
from models import db, NGO

HTML_FILES = [
    "ngos.html",
    "ngos2.html",
    "ngos3.html",
    "ngos4.html",
    "ngos5.html",
    "ngos6.html",
]


def decode_cfemail(cfstring: str) -> str:
    r = int(cfstring[:2], 16)
    email = "".join(
        chr(int(cfstring[i : i + 2], 16) ^ r) for i in range(2, len(cfstring), 2)
    )
    return email


def parse_ngos_from_file(html_path):
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

        email_a = div.find("a", class_="__cf_email__")
        if email_a and email_a.get("data-cfemail"):
            cf = email_a["data-cfemail"]
            email = decode_cfemail(cf)
        else:
            m = re.search(r"Email:\s*([^\s<]+@[^\s<]+)", details_text)
            if m:
                email = m.group(1).strip()

        m = re.search(r"Website:\s*([^\s<]+)", details_text)
        if m:
            website = m.group(1).strip()
        else:
            for a in div.find_all("a", href=True):
                href = a["href"]
                if href.startswith("http") or "www." in href:
                    website = href.strip()
                    break

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


def save_ngos_to_db(ngos_data):
    created = 0

    for data in ngos_data:
        ngo = NGO(
            name=data["name"],
            address=data["address"],
            city=data["city"],
            state=data["state"],
            district=None,
            email=data["email"],
            phone=data["phone"],
            website=data["website"],
            verified=False,
            active=True,
            source="Mohan Foundation (HTML scrape)",
            scraped_at=datetime.utcnow(),
        )
        db.session.add(ngo)
        created += 1

    db.session.commit()
    return created


def main():
    app = create_app()

    with app.app_context():
        print("=" * 80)
        print("  🏥 Importing Mohan Foundation NGOs into the database")
        print("=" * 80)

        ngos_data = load_all_ngos_from_html()
        created = save_ngos_to_db(ngos_data)

        print("\n" + "=" * 80)
        print(f"✅ Inserted NGOs into DB: {created}")
        print("=" * 80)


if __name__ == "__main__":
    main()
