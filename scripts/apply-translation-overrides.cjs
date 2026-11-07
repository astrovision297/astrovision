const fs=require('fs');
const codes=['el','fr','nl','tr','hi'];
const rows=['ui.tsv','client-revisions.tsv'].flatMap(name=>fs.readFileSync('src/data/translations/'+name,'utf8').trim().split('\n').map(line=>line.split('\t')));
for(const row of rows) if(row.length!==6) throw new Error('Expected six columns: '+row[0]);
for(const [index,code] of codes.entries()){
 const file=`public/locales/${code}.json`;
 const dictionary=JSON.parse(fs.readFileSync(file,'utf8'));
 const source=JSON.parse(fs.readFileSync('public/locales/en.json','utf8'));
 const englishRegions=new Intl.DisplayNames(['en'],{type:'region'});
 const localRegions=new Intl.DisplayNames([code],{type:'region'});
 for(const key of Object.keys(source)){
  if(dictionary[key])continue;
  let countryName;
  for(const a of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')for(const b of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){const id=a+b;if(englishRegions.of(id)===key)countryName=localRegions.of(id);}
  dictionary[key]=countryName||key;
 }
 for(const row of rows)dictionary[row[0]]=row[index+1];
 const months={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
 for(const key of Object.keys(dictionary)){
  const match=key.match(/^(\w{3}) (\d+) – (\w{3}) (\d+)$/);
  if(match){const format=new Intl.DateTimeFormat(code,{day:'numeric',month:'short',timeZone:'UTC'});dictionary[key]=format.format(new Date(Date.UTC(2026,months[match[1]],Number(match[2]))))+' – '+format.format(new Date(Date.UTC(2026,months[match[3]],Number(match[4]))));}
 }
 dictionary['Escape']='Escape';
 if(code==='tr'){
  dictionary['AstroVision in Nicosia']="Lefkoşa’da AstroVision";
  dictionary['Contact AstroVision']="AstroVision ile iletişime geçin";
  for(const key of Object.keys(dictionary)) dictionary[key]=dictionary[key].replaceAll('AstrolojiVision','AstroVision');
 }
 if(code==='el')dictionary['Visit AstroVision on Ledras Street in Nicosia, or ask about a phone or video appointment. Before you commit, agree the session format, fees, and time. Bring one question or several; share only the details you feel comfortable discussing.']='Επισκεφθείτε το AstroVision στην οδό Λήδρας στη Λευκωσία ή ρωτήστε για ένα τηλεφωνικό ραντεβού ή μια βιντεοκλήση. Πριν δεσμευθείτε, συμφωνήστε τη μορφή, το κόστος και την ώρα της συνεδρίας. Ελάτε με μία ή περισσότερες ερωτήσεις και μοιραστείτε μόνο όσα αισθάνεστε άνετα να συζητήσετε.';

 fs.writeFileSync(file,JSON.stringify(dictionary,null,2)+'\n');
}
console.log(`Applied ${rows.length} reviewed UI translations per language.`);
