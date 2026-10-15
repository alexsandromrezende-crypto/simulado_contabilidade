// AVALIA 4: uso local sem servidor. Persistência depende do navegador/dispositivo.
const $=id=>document.getElementById(id);
const CODE='AVALIA2026';const KEY='avalia6_records';const LEGACY_KEY='avalia4_session';
let attempt=null;
let records={};
function identifier(reg){return clean(reg).toLocaleUpperCase('pt-BR');}
function save(){
  if(!attempt)return;
  const id=identifier(attempt.registration);
  if(!Array.isArray(records[id]))records[id]=[];
  const i=records[id].findIndex(a=>a.id===attempt.id);
  if(i>=0)records[id][i]=attempt;else records[id].push(attempt);
  localStorage.setItem(KEY,JSON.stringify(records));
}
function load(){
 try{const r=JSON.parse(localStorage.getItem(KEY)||'{}');if(r&&typeof r==='object'&&!Array.isArray(r))records=r;}catch{}
 // Aproveitar uma tentativa já existente ao migrar da versão anterior.
 try{const old=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(old?.registration&&old?.answers){const id=identifier(old.registration);if(!records[id]?.length){old.id='migrada-1';records[id]=[old];localStorage.setItem(KEY,JSON.stringify(records));}}}catch{}
}
function beginNew(name,registration,classroom){
 const id=identifier(registration),used=records[id]||[];
 if(used.length>=2)return alert('Limite de duas tentativas atingido nesta instalação do navegador.');
 attempt={id:'tentativa-'+(used.length+1),number:used.length+1,name,registration,classroom,startedAt:new Date().toISOString(),cursor:0,answers:{},finished:false};save();show();
}

function clean(s){return String(s||'').trim().replace(/\s+/g,' ').slice(0,120);}
function showLogin(){ $('login').hidden=false;$('exam').hidden=true;$('done').hidden=true; }
function question(){return QUESTIONS[attempt.cursor];}
function show(){
 $('login').hidden=true;$('exam').hidden=!!attempt.finished;$('done').hidden=!attempt.finished;
 if(attempt.finished){
   $('attemptInfo').textContent='Tentativa '+(attempt.number||1)+' de 2';
   $('retry').hidden=(records[identifier(attempt.registration)]||[]).length>=2;
   return;
 }
 $('tryNumber').textContent='Tentativa '+(attempt.number||1)+' de 2';
 const q=question(),locked=attempt.answers[attempt.cursor]!=null;
 $('hello').textContent=attempt.name;
 $('count').textContent=Object.keys(attempt.answers).length+' de '+QUESTIONS.length+' confirmadas';
 $('progressbar').style.width=Object.keys(attempt.answers).length/QUESTIONS.length*100+'%';
 $('questionNumber').textContent='QUESTÃO '+String(q.id).padStart(2,'0')+' / '+QUESTIONS.length;
 $('statement').src=q.image;
 $('options').replaceChildren();
 for(const op of q.options){const lab=document.createElement('label');lab.className='option'+(locked?' locked':'');const inp=document.createElement('input');inp.type='radio';inp.name='choice';inp.value=op.letter;inp.checked=attempt.answers[attempt.cursor]===op.letter;inp.disabled=locked;const b=document.createElement('b');b.textContent=op.letter+')';const span=document.createElement('span');span.textContent=op.text;lab.append(inp,b,span);$('options').append(lab)}
 $('status').textContent=locked?'Resposta confirmada e bloqueada':'Aguardando confirmação';
 $('message').textContent=locked?'Resposta salva neste navegador. Avance para continuar.':'Depois de confirmar, não será possível alterar pelo fluxo normal da aplicação.';
 $('confirm').hidden=locked;$('next').hidden=!locked;
 $('next').textContent=attempt.cursor===QUESTIONS.length-1?'Finalizar avaliação →':'Próxima questão →';
}
$('loginForm').onsubmit=e=>{
 e.preventDefault();const name=clean($('name').value),registration=clean($('registration').value),classroom=clean($('classroom').value);
 if($('code').value.trim()!==CODE)return alert('Código de acesso incorreto.');
 if(!name||!registration||!classroom)return alert('Preencha a identificação.');
 const used=records[identifier(registration)]||[];
 if(used.length&&used.some(a=>a.name!==name||a.classroom!==classroom))return alert('Esta matrícula já foi usada neste navegador com uma identificação diferente.');
 if(used.length){attempt=used[used.length-1];show();return;}
 beginNew(name,registration,classroom);
};
$('retry').onclick=()=>{
 if(!attempt?.finished)return;
 const used=records[identifier(attempt.registration)]||[];
 if(used.length>=2)return alert('As duas tentativas já foram utilizadas.');
 if(!confirm('Iniciar a segunda e última tentativa? A primeira ficará registrada neste navegador.'))return;
 beginNew(attempt.name,attempt.registration,attempt.classroom);
};
$('confirm').onclick=()=>{if(!attempt||attempt.finished||attempt.answers[attempt.cursor]!=null)return;const selected=document.querySelector('input[name="choice"]:checked');if(!selected)return alert('Selecione uma alternativa.');if(!confirm('Confirmar a alternativa '+selected.value+'? Não será possível voltar e alterar a resposta pelo sistema.'))return;attempt.answers[attempt.cursor]=selected.value;save();show();};
$('next').onclick=()=>{if(!attempt||attempt.answers[attempt.cursor]==null)return alert('Confirme a resposta antes de avançar.');if(attempt.cursor===QUESTIONS.length-1){attempt.finished=true;attempt.finishedAt=new Date().toISOString();}else attempt.cursor++;save();show();window.scrollTo({top:0,behavior:'smooth'});};
// PDF A4 em bytes, sem bibliotecas externas; textos em Windows-1252 e Helvetica.
function pdfEscape(t){return Array.from(String(t)).map(c=>{if(c==='\\'||c==='('||c===')')return '\\'+c;const n=c.charCodeAt(0);if(n>=32&&n<=126)return c;if(n>=160&&n<=255)return c;return '-';}).join('');}
function latinBytes(str){const arr=[];for(const ch of str){let n=ch.charCodeAt(0);if(n>255)n=45;arr.push(n)}return new Uint8Array(arr)}
function makePDF(){
 const total=QUESTIONS.length;
 const correct=QUESTIONS.filter((q,i)=>attempt.answers[i]===q.correct).length;
 const wrong=total-correct,percentage=100*correct/total;
 const pct=percentage.toFixed(2).replace('.',',')+'%';
 const level=percentage<50?'ABAIXO DO BÁSICO':percentage<=70?'BÁSICO':'AVANÇADO';
 let stream='';
 const pen=(r,g,b)=>{stream+=`${r} ${g} ${b} rg\n`;};
 const stroke=(r,g,b)=>{stream+=`${r} ${g} ${b} RG\n`;};
 const text=(t,x,y,size=10)=>{stream+=`BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfEscape(t)}) Tj ET\n`;};
 const rect=(x,y,w,h)=>{stream+=`${x} ${y} ${w} ${h} re f\n`;};
 const line=(x,y,x2,y2)=>{stream+=`${x} ${y} m ${x2} ${y2} l S\n`;};
 pen(.08,.20,.38);rect(0,777,595,65);pen(1,1,1);text('AVALIA | RELATÓRIO INDIVIDUAL',33,804,17);text('AVALIAÇÃO DE CONTABILIDADE',33,785,10);
 pen(.12,.22,.37);text('Estudante: '+attempt.name,33,753,11);text('Matrícula: '+attempt.registration+'   |   Turma: '+attempt.classroom,33,733,10);
 text('Data: '+new Date(attempt.finishedAt).toLocaleDateString('pt-BR'),33,716,10);
 pen(.93,.96,.99);rect(30,641,535,61);pen(.10,.25,.46);
 text('QUESTÕES: '+total,43,679,11);text('ACERTOS: '+correct,188,679,11);text('ERROS: '+wrong,326,679,11);
 text('EFICIÊNCIA: '+pct,43,653,12);text('STATUS: '+level,231,653,12);
 pen(.09,.22,.39);text('GRADE DE DESEMPENHO POR QUESTÃO',33,616,12);
 const x=[32,295,563],top=600,rowH=15.7;
 pen(.12,.28,.49);rect(x[0],top-25,x[2]-x[0],25);
 pen(1,1,1);text('MARCOU',x[0]+20,top-17,9);text('RESULTADO',x[1]+20,top-17,9);
 QUESTIONS.forEach((q,i)=>{
  const y=top-25-(i+1)*rowH; const selected=attempt.answers[i]||'-';const hit=selected===q.correct;
  if(i%2===0){pen(.94,.96,.98);rect(x[0],y,x[2]-x[0],rowH);}
  pen(.12,.23,.35);text('QUESTÃO '+String(q.id).padStart(2,'0')+'  -  '+selected,x[0]+20,y+4.6,9);
  if(hit)pen(.09,.42,.28);else pen(.70,.17,.17);
  text(hit?'ACERTOU':'ERROU',x[1]+25,y+4.6,9);
 });
 stroke(.82,.86,.91);stream+='0.5 w\n';for(const a of x)line(a,top-25-30*rowH,a,top);line(x[0],top-25-30*rowH,x[2],top-25-30*rowH);
 pen(.36,.43,.52);text('Classificação: abaixo de 50% = Abaixo do básico; 50% a 70% = Básico;',33,74,8);
 text('acima de 70% = Avançado. Resultado individual sem enunciados.',33,61,8);
 text('AVALIA 6.0 | Tentativa '+(attempt.number||1)+' de 2 | Relatório local',33,38,8);
 const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',`<< /Length ${latinBytes(stream).length} >>\nstream\n${stream}endstream`];
 let parts=['%PDF-1.4\n%AVALIA\n'],offsets=[0],length=latinBytes(parts[0]).length;
 for(let i=0;i<objs.length;i++){offsets.push(length);const str=`${i+1} 0 obj\n${objs[i]}\nendobj\n`;parts.push(str);length+=latinBytes(str).length;}
 const xref=length;parts.push(`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`);
 for(let i=1;i<offsets.length;i++)parts.push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
 parts.push(`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
 const arrays=parts.map(latinBytes),out=new Uint8Array(arrays.reduce((sum,a)=>sum+a.length,0));let pos=0;
 for(const a of arrays){out.set(a,pos);pos+=a.length;}
 return new Blob([out],{type:'application/pdf'});
}
$('report').onclick=()=>{if(!attempt?.finished)return;const blob=makePDF(),url=URL.createObjectURL(blob);const tab=window.open(url,'_blank');if(!tab){const link=document.createElement('a');link.href=url;link.download='AVALIA_Relatorio_'+attempt.registration+'.pdf';link.click();alert('O navegador bloqueou a nova aba. O relatório foi enviado para download.');}setTimeout(()=>URL.revokeObjectURL(url),180000);};
load();showLogin();

// Medidas de dissuasão. Sites não conseguem impedir capturas pelo SO ou por câmeras externas.
document.addEventListener('contextmenu',e=>{if(!e.target.closest('input'))e.preventDefault();});
document.addEventListener('copy',e=>{if(!e.target.closest('input'))e.preventDefault();});
document.addEventListener('cut',e=>{if(!e.target.closest('input'))e.preventDefault();});
document.addEventListener('dragstart',e=>{if(e.target.closest('#exam'))e.preventDefault();});
document.addEventListener('keydown',e=>{
 if($('exam').hidden)return;
 const k=e.key.toLowerCase();
 if((e.ctrlKey||e.metaKey)&&['c','s','p','u'].includes(k))e.preventDefault();
 if(k==='printscreen'){$('protectionNote').textContent='Evite capturar ou compartilhar o conteúdo da avaliação.';}
});
