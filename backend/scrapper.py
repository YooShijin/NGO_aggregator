# scrapper.py — PHASE 6 (FINAL)
import re
from datetime import datetime

from bs4 import BeautifulSoup

from app import create_app
from models import db, NGO

# All your HTML pages
HTML_FILES = [
    "ngos.html",
    "ngos2.html",
    "ngos3.html",
    "ngos4.html",
    "ngos5.html",
    "ngos6.html",
]


def decode_cfemail(cfstring: str) -> str:
    """
    Decode Cloudflare's email protection value from data-cfemail.
    """
    r = int(cfstring[:2], 16)
    email = "".join(
        chr(int(cfstring[i : i + 2], 16) ^ r) for i in range(2, len(cfstring), 2)
    )
    return email


def parse_ngos_from_file(html_path):
    """
    Parse one HTML file and return a list of NGO dicts.
    """
    # Encoding from the site: windows-1252 is safe here
    with open(html_path, "r", encoding="windows-1252", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    # Each NGO block is inside this div
    ngo_divs = soup.select("div.lay-1.donor-menories-bg")

    ngos = []

    for div in ngo_divs:
        spans = div.find_all("span")
        if len(spans) < 4:
            # if structure is broken, skip this block
            continue

        # First 4 spans are: name, address, city, state
        name = spans[0].get_text(strip=True)
        address = spans[1].get_text(strip=True)
        city = spans[2].get_text(strip=True)
        state = spans[3].get_text(strip=True)

        # All text lines inside the NGO block
        all_strings = [s.strip() for s in div.stripped_strings if s.strip()]
        # Skip first 4 (already taken as name, address, city, state)
        details_text = " ".join(all_strings[4:])

        # Defaults
        pincode = None
        phone = None
        mobile = None
        email = None
        website = None

        # Pincode - 440001
        m = re.search(r"Pincode\s*-\s*(\d{6})", details_text, flags=re.IGNORECASE)
        if m:
            pincode = m.group(1).strip()

        # Phone: ...
        m = re.search(r"Phone:\s*([^EMW<]+)", details_text)  # stop before Email/Mobile/Website
        if m:
            phone = m.group(1).strip(" /")

        # Mobile: ...
        m = re.search(r"Mobile:\s*([^PEW<]+)", details_text)  # stop before Phone/Email/Website
        if m:
            mobile = m.group(1).strip(" /")

        # Email: decode Cloudflare-protected email if present
        email_a = div.find("a", class_="__cf_email__")
        if email_a and email_a.get("data-cfemail"):
            cf = email_a["data-cfemail"]
            email = decode_cfemail(cf)
        else:
            # fallback if not protected
            m = re.search(r"Email:\s*([^\s<]+@[^\s<]+)", details_text)
            if m:
                email = m.group(1).strip()

        # Website: plain text or link
        # e.g. "Website: www.anthyestifoundation.com"
        m = re.search(r"Website:\s*([^\s<]+)", details_text)
        if m:
            website = m.group(1).strip()
        else:
            # fall back: look for first http/www link in anchors
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
    """Parse all 6 HTML files and return a combined list of NGO dicts."""
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
    """
    Take list of parsed NGO dicts and insert into DB.
    Skips duplicates based on (name, city, state).
    """
    created = 0
    skipped = 0

    for data in ngos_data:
        name = data["name"]
        city = data["city"]
        state = data["state"]

        # Check for existing NGO with same name + city + state
        existing = NGO.query.filter_by(name=name, city=city, state=state).first()
        if existing:
            print(f"[-] Skipping existing NGO: {name} ({city}, {state})")
            skipped += 1
            continue

        # Combine phone + mobile if both present
        phone = data["phone"] or ""
        if data["mobile"]:
            if phone:
                phone = f"{phone} | Mobile: {data['mobile']}"
            else:
                phone = data["mobile"]

        ngo = NGO(
            name=name,
            address=data["address"],
            city=city,
            state=state,
            # Mohan Foundation page doesn’t give district; leave null
            district=None,
            email=data["email"],
            phone=phone if phone else None,
            website=data["website"],
            # registration_no, darpan_id etc are unknown, keep None
            verified=False,
            active=True,
            source="Mohan Foundation (HTML scrape)",
            scraped_at=datetime.utcnow(),
        )

        db.session.add(ngo)
        created += 1

    db.session.commit()
    return created, skipped


def main():
    # Create app + push context so we can use db + models
    app = create_app()

    with app.app_context():
        print("=" * 80)
        print("  🏥 Importing Mohan Foundation NGOs into the database")
        print("=" * 80)

        ngos_data = load_all_ngos_from_html()
        created, skipped = save_ngos_to_db(ngos_data)

        print("\n" + "=" * 80)
        print(f"Inserted NGOs into DB: {created}")
        print(f"Skipped (already existed): {skipped}")
        print("=" * 80)


if __name__ == "__main__":
    main()
