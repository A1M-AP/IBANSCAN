import { readFileSync,writeFileSync } from 'node:fs';
const registry=JSON.parse(readFileSync(new URL('../data/iban-registry.json',import.meta.url),'utf8'));
const currencies=JSON.parse(readFileSync(new URL('../data/currencies.json',import.meta.url),'utf8'));
const codes={region:registry.countries.map(c=>c.code),currency:currencies.records.map(c=>c.code)};
const names={};
for(const locale of ['en','it','de','es','fr']){
 names[locale]={};
 for(const type of ['region','currency']){
  const display=new Intl.DisplayNames([locale],{type});
  names[locale][type]=Object.fromEntries(codes[type].map(code=>[code,display.of(code)||code]));
 }
}
writeFileSync(new URL('../data/display-names.json',import.meta.url),JSON.stringify(names)+'\n');
console.log('Generated shared display names for five languages. Commit the reviewed snapshot.');
