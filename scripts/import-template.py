from pathlib import Path
import json, re, shutil

root = Path(__file__).resolve().parent.parent
target = root / 'public/template'
target.mkdir(parents=True, exist_ok=True)
for name in ('style.css', 'bootstrap.min.css'):
    shutil.copy2(root / 'template-source/css' / name, target / name)
html = (root / 'template-source/index.html').read_text(encoding='utf-8')
body = re.search(r'<body>(.*?)<script', html, re.S).group(1)
# Retain the client's original markup, layout and illustrations as React-rendered nodes.
body = body.replace('100% Escrow-Protected Payments', 'Direct Buyer–Supplier Connections').replace('Secure Trading with Escrow', 'Optional Buyer Protection').replace('RBI-Regulated Escrow Partner', 'Manual Claim Review').replace('ISO 9001:2015 Certified', 'Business Verification').replace('Startup India Recognized', 'Pan-India Supplier Network').replace('GST-Verified Transactions', 'Supplier KYC Review').replace('256-bit SSL Secured', 'Private Document Access').replace('100% Verified Suppliers', 'Find Verified Suppliers')
body = body.replace('Every supplier is verified and every lead is genuine', 'Discover verified suppliers and relevant requirements').replace('Every buyer inquiry is screened before it reaches you', 'Relevant buyer requirements reach your category').replace('100% Trusted Suppliers', 'Manual Supplier Verification')
body = body.replace('Grow Your Business – <strong>Get 3 Months Free</strong> Premium Business Listing', 'Grow Your Business — <strong>Connect Directly</strong> with Relevant Buyers').replace('Claim Offer', 'Explore Plans').replace('🎉 Limited Time', 'For Your Business')
body = body.replace('The escrow step made the first order painless.', 'Direct supplier connections made sourcing simpler.').replace('Payments through escrow finally gave our overseas buyers the confidence to place bigger first orders.', 'Finding relevant manufacturers helped our team build new business connections.').replace('Post a free RFQ and get quotes from up to 5 verified suppliers within 24 hours.', 'Post a free requirement and connect with up to 5 relevant suppliers.').replace('Client Testimonials &amp; Success Stories', 'Client Testimonials &amp; Success Stories — Illustrative')
body = re.sub(r'<div class="ad-slot.*?</div>', '', body, flags=re.S)
body = body.replace('backed by escrow protection.', 'with optional Buyer Protection.').replace('Trade Securely', 'Connect & Negotiate').replace('Pay via escrow, release funds once goods are confirmed.', 'Agree prices, terms, and delivery directly with your supplier.').replace('Connect &amp; Negotiate', 'Unlock Relevant Leads').replace('Chat directly with verified suppliers and agree on terms.', 'Up to five relevant suppliers unlock each buyer requirement.')
body = re.sub(r'<span class="num".*?</span>', '', body)
(root / 'components/template.json').write_text(json.dumps(body, ensure_ascii=True), encoding='utf-8')
print('Imported original template and styles without changing source files.')
