// Extract display copy for the checked-in dictionaries. No runtime translation service.
const ts = require('typescript');
const fs = require('fs');
const paths=['src/components/home.tsx','src/components/client-revisions.tsx','src/data/countries.ts','src/components/celestial.tsx','src/components/language-provider.tsx','src/app/error.tsx','src/app/not-found.tsx','src/data/content.ts','src/data/site.ts'];
const texts=new Set();
for(const path of paths){
 const tree=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function walk(n){
  if(ts.isStringLiteral(n)||ts.isJsxText(n)||ts.isNoSubstitutionTemplateLiteral(n)){
   const s=n.text.trim();
   if(/[A-Za-z]/.test(s)&&!s.includes('https:')&&!s.startsWith('/')&&!s.includes('@/')&&!s.includes('className')&&(ts.isJsxText(n)||!/^[a-z0-9_./#?=,:;\-]+$/.test(s))&&s.length>1&&!s.includes('=>'))texts.add(s);
  }
  ts.forEachChild(n,walk);
 } walk(tree);
}
fs.mkdirSync('public/locales',{recursive:true});
fs.writeFileSync('public/locales/en.json',JSON.stringify(Object.fromEntries([...texts].sort().map(s=>[s,s])),null,2)+'\n');
console.log(texts.size+' source strings');
