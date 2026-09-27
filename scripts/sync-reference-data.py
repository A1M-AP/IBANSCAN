"""Refresh public reference snapshots. Python 3 standard library only; no credentials.
Sources: EPC participant registries, Banca d'Italia public bank register, SIX ISO 4217.
Only institutional fields are retained; never customer account details.
Run: python scripts/sync-reference-data.py. Partial/failed downloads do not replace snapshots.
"""
import datetime, json, re, time, subprocess, urllib.request, http.cookiejar, xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TODAY=datetime.date.today().isoformat()
DATA=ROOT/'data'
def save(name,value):
    target=DATA/name
    temp=target.with_suffix('.tmp')
    temp.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    temp.replace(target)
def get_xml(url):
    try:
        with urllib.request.urlopen(url,timeout=40) as r: raw=r.read(8_000_001)
    except urllib.error.URLError:
        # Node uses the OS trust store on supported installations; never disable TLS checks.
        raw=subprocess.check_output(['node','-e',"fetch(process.argv[1]).then(async r=>{if(!r.ok)throw Error(r.status);process.stdout.write(await r.text())}).catch(()=>process.exit(1))",url],timeout=45)
    if len(raw)>8_000_000 or b'<!ENTITY' in raw or b'<!DOCTYPE' in raw: raise ValueError('Unsafe XML')
    return ET.fromstring(raw)
def clean(v): return re.sub(r'\s+',' ',str(v or '')).strip()
def epc():
    records={}
    for scheme in ['sct','sct_inst','sdd_core','sdd_b2b']:
        url=f'https://www.europeanpaymentscouncil.eu/sites/default/files/participants_export/{scheme}/{scheme}.xml'
        root=get_xml(url)
        count=0
        for b in root.findall('.//BANK'):
            bic=clean(b.findtext('BIC')).upper()
            if not re.fullmatch(r'[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?',bic): continue
            bic=bic if len(bic)==11 else bic+'XXX'
            rec=records.setdefault(bic,{'name':clean(b.findtext('ParticipantName')),'bic':bic,'countryCode':bic[4:6],'address':clean(b.findtext('ADDRESS'))+', '+clean(b.findtext('CITY')),'schemes':{}})
            rec['schemes'][scheme]={'ready':clean(b.findtext('ReadinessDate')),'leaving':clean(b.findtext('SchemeLeavingDate')),'source':url}
            count+=1
        if count<100: raise ValueError('Unexpected EPC dataset size')
        print(scheme,count,flush=True)
    save('epc-banks.json',{'retrievedAt':TODAY,'source':'https://www.europeanpaymentscouncil.eu/what-we-do/be-involved/register-participants/registers-participants-sepa-payment-schemes','records':list(records.values())})
    print('EPC unique BICs',len(records),flush=True)
def currencies():
    url='https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml'
    root=get_xml(url); records={}
    for r in root.findall('.//CcyNtry'):
        code=clean(r.findtext('Ccy'))
        if not re.fullmatch('[A-Z]{3}',code):continue
        records.setdefault(code,{'code':code,'name':clean(r.findtext('CcyNm')),'numeric':clean(r.findtext('CcyNbr')),'digits':clean(r.findtext('CcyMnrUnts'))})
    if len(records)<150:raise ValueError('Unexpected currency dataset size')
    save('currencies.json',{'source':url,'publishedAt':root.attrib.get('Pblshd',''),'retrievedAt':TODAY,'records':sorted(records.values(),key=lambda r:r['code'])})
    print('Currencies',len(records),flush=True)
def italian():
    base='https://infostat.bancaditalia.it/GIAVAInquiry-public/ng/'
    session=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    session.open(base,timeout=30).read()
    def post(path,payload):
        request=urllib.request.Request(base+'api/'+path,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Accept':'application/json','Referer':base})
        with session.open(request,timeout=40) as response:return json.load(response)
    payload={'searchElement':{'intermediaryBoards':[{'boardType':{'code':'001','description':'ALBO DELLE BANCHE','type':None,'startDate':'1936-12-31','endDate':'9999-12-31'},'inscriptionProtocol':''}],'establishmentDate':TODAY},'endIndex':30,'startIndex':0,'rowCount':30,'searchOrderItems':[{'columnIndex':1,'insertedIndexColumn':1,'dataField':'abiCode','descending':False}]}
    raw=post('searchAllIntermediaries',payload)
    if not isinstance(raw,list) or len(raw)<200:raise ValueError('Unexpected bank registry size')
    records=[]
    for index,bank in enumerate(raw):
        abi=clean(bank.get('abiCode')).zfill(5)
        if not re.fullmatch(r'\d{5}',abi) or abi=='99999':continue
        bank['establishmentDate']=TODAY
        detail=post('getLegalPersonDetails',bank)
        addresses=[h for t in (detail.get('intermediaryTellers') or []) for h in (t.get('tellerHistConfigs') or [])]
        rec={'name':clean(bank['name']),'countryCode':'IT','bankIdentifier':abi,'address':clean(bank.get('modifyType')),'source':base,'verifiedAt':TODAY}
        tellers=detail.get('intermediaryTellers') or []
        for position,key in [(0,'headquarters'),(1,'legalAddress')]:
            hist=(tellers[position].get('tellerHistConfigs') or [{}])[0] if len(tellers)>position else {}
            if clean(hist.get('address')):
                rec[key]=', '.join(filter(None,[clean(hist.get('address')),clean(hist.get('zipCode')),clean((hist.get('cabPlaceIta') or {}).get('description'))]))
        for field,key in [('webSite','website'),('pecEmailAddress','pec'),('email','email'),('phoneNumber','phone')]:
            values=list(dict.fromkeys(clean(a.get(field)) for a in addresses if clean(a.get(field))))
            if len(values)==1:rec[key]=values[0]
        records.append(rec)
        if index%40==0:print('Italian bank details',index+1,'/',len(raw),flush=True)
        time.sleep(.18)
    # The public register can repeat an identical institutional record.
    # Never publish conflicting records for the same national bank code.
    seen={}
    for record in records:
        key=record['bankIdentifier']
        if key in seen and seen[key]!=record:raise ValueError('Conflicting ABI records; manual review required: '+key)
        seen[key]=record
    save('italian-banks.json',{'source':base,'retrievedAt':TODAY,'records':records})
    save('italian-bank-names.json',{'source':base,'retrievedAt':TODAY,'names':{r['bankIdentifier']:r['name'] for r in records}})
    print('Italian banks',len(records),'PEC',sum(bool(r.get('pec')) for r in records),flush=True)
def branches():
    base='https://infostat.bancaditalia.it/GIAVAInquiry-public/ng/'
    session=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    session.open(base,timeout=30).read()
    payload={'searchElement':{'startActivationDate':TODAY},'endIndex':30000,'startIndex':0,'rowCount':30000,'searchOrderItems':[{'columnIndex':0,'insertedIndexColumn':0,'dataField':'idAbi','descending':False},{'columnIndex':1,'insertedIndexColumn':1,'dataField':'idTeller','descending':False}]}
    request=urllib.request.Request(base+'api/searchBranches',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Referer':base})
    with session.open(request,timeout=90) as response:raw=json.load(response)
    if not 10000<len(raw)<30000:raise ValueError('Unexpected or truncated branch register')
    records=[]
    for b in raw:
        abi=clean(b.get('idAbi')).zfill(5);cab=clean(b.get('cabTeller')).zfill(5)
        if not re.fullmatch(r'\d{5}',abi) or not re.fullmatch(r'\d{5}',cab) or cab=='00000':continue
        if (b.get('endActivationDate') or '9999-12-31')<=TODAY:continue
        records.append({'abi':abi,'cab':cab,'id':clean(b.get('idTeller')),'address':', '.join(filter(None,[clean(b.get('address')),clean(b.get('zipCode')),clean(b.get('village'))]))})
    save('italian-branches.json',{'source':base,'retrievedAt':TODAY,'records':records})
    print('Italian branches',len(records),flush=True)
if __name__=='__main__':
    epc();currencies();italian();branches()
