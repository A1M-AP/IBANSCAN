"""Import national bank-code registries for countries beyond Italy.

Source: the MIT-licensed schwifty package (https://github.com/mdomke/schwifty), whose
`generated_*` files are produced from national central-bank / clearing registers and whose
`manual_*` files are community-curated. The release is pinned and its SHA-256 is checked
against PyPI before anything is read. Only bank code, name and BIC are kept.

Run: python scripts/import-bank-registries.py [version]
"""
import datetime, hashlib, io, json, re, sys, urllib.request, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'data' / 'national-banks.json'
VERSION = sys.argv[1] if len(sys.argv) > 1 else '2026.7.3'
BIC = re.compile(r'[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?')


def fetch(url, limit):
    with urllib.request.urlopen(url, timeout=60) as r:
        raw = r.read(limit + 1)
    if len(raw) > limit:
        raise ValueError('Download too large: ' + url)
    return raw


def wheel():
    meta = json.loads(fetch(f'https://pypi.org/pypi/schwifty/{VERSION}/json', 2_000_000))
    files = [f for f in meta['urls'] if f['packagetype'] == 'bdist_wheel']
    if len(files) != 1:
        raise ValueError('Expected exactly one wheel')
    raw = fetch(files[0]['url'], 50_000_000)
    if hashlib.sha256(raw).hexdigest() != files[0]['digests']['sha256']:
        raise ValueError('Wheel checksum mismatch')
    released = files[0]['upload_time_iso_8601'][:10]
    return zipfile.ZipFile(io.BytesIO(raw)), released


def rows(data):
    if isinstance(data, list):
        return data
    # v2 files group several codes under one entry.
    out = []
    for entry in data['entries']:
        for code in entry.get(data['expand_from'], []):
            row = {k: v for k, v in entry.items() if k != data['expand_from']}
            row[data['expand_into']] = code
            out.append(row)
    return out


def clean(value):
    return re.sub(r'\s+', ' ', str(value or '')).strip()


def main():
    archive, released = wheel()
    registry = {c['code']: c for c in json.loads((ROOT / 'data' / 'iban-registry.json').read_text('utf8'))['countries']}
    countries = {}
    names = sorted(n for n in archive.namelist() if re.search(r'schwifty/bank_registry/(generated|manual)_[a-z]{2}(\.v2)?\.json$', n))
    for name in names:
        kind = 'register' if '/generated_' in name else 'curated'
        for row in rows(json.loads(archive.read(name))):
            cc = clean(row.get('country_code')).upper()
            code = clean(row.get('bank_code')).upper()
            bank = clean(row.get('name'))[:160]
            bic = clean(row.get('bic')).upper()
            span = registry.get(cc, {}).get('bank')
            # Keep only codes that can actually be extracted from that country's IBAN.
            if not span or len(code) != span[1] or not re.fullmatch(r'[A-Z0-9]+', code) or not bank:
                continue
            if bic and not BIC.fullmatch(bic):
                bic = ''
            entry = countries.setdefault(cc, {'kind': kind, 'file': name.rsplit('/', 1)[1], 'banks': {}})
            if entry['kind'] != kind:
                # Register data wins over curated data for the same country.
                if kind == 'curated':
                    if code in entry['banks']:
                        continue
                else:
                    entry.update(kind=kind, file=name.rsplit('/', 1)[1])
            current = entry['banks'].get(code)
            # Several rows can share a code (e.g. German branches); prefer the primary row.
            if current is None or (row.get('primary') and not current[2]):
                entry['banks'][code] = [bank, bic, bool(row.get('primary')), kind]
    for entry in countries.values():
        # A trailing 1 marks a curated row inside a country otherwise covered by its register.
        entry['banks'] = {code: v[:2] + ([1] if v[3] != entry['kind'] else []) for code, v in sorted(entry['banks'].items())}
    total = sum(len(c['banks']) for c in countries.values())
    if total < 10_000 or 'DE' not in countries or 'FR' not in countries:
        raise ValueError('Unexpected registry size')
    value = {
        'source': f'https://github.com/mdomke/schwifty/tree/{VERSION}/schwifty/bank_registry',
        'package': f'schwifty {VERSION} (MIT licence)',
        'releasedAt': released,
        'retrievedAt': datetime.date.today().isoformat(),
        'countries': dict(sorted(countries.items())),
    }
    temp = TARGET.with_suffix('.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
    temp.replace(TARGET)
    print(f'{total} bank codes in {len(countries)} countries')


if __name__ == '__main__':
    main()
