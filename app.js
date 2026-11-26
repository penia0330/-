(() => {
  const STORAGE_KEY = 'my-fridge-schedule-v1';
  const dayMs = 86400000;
  const startOfDay = (date) => new Date(date.getFullYear(),date.getMonth(),date.getDate());
  const today = startOfDay(new Date());
  const dateOffset = (offset) => new Date(today.getTime() + offset * dayMs);
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const parseDate = (value) => { const [y,m,d] = value.split('-').map(Number); return new Date(y,m-1,d); };
  const fmt = (date, opts={}) => new Intl.DateTimeFormat('ko-KR',{...opts,timeZone:'Asia/Seoul'}).format(date);
  const isoOffset = (n) => dateKey(dateOffset(n));
  const seed = [
    ['대파','🌿','냉장실',2,1],['콩나물','🌱','냉장실',2,1],['서울우유 1,000ml','🥛','냉장실',0,1],['두부','🧊','냉장실',0,1],
    ['애호박','🥒','냉장실',6,1],['달걀','🥚','냉장실',10,1],['양파','🧅','실온',14,3],['사과','🍎','냉장실',7,4],
    ['삼겹살','🥩','냉동실',24,1],['김치','🥬','냉장실',18,1],['소고기','🥩','냉동실',32,1],['밥','🍚','냉동실',20,2],
    ['당근','🥕','냉장실',9,2],['감자','🥔','실온',21,4]
  ];
  const freshSeed = () => seed.map(([name,emoji,storage,offset,qty],i)=>({id:`seed-${i}`,name,emoji,storage,expiry:isoOffset(offset),qty,created:dateKey(today),reminder:true}));
  let state;
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { state = null; }
  if (!state || !Array.isArray(state.items)) state = {items:freshSeed()};
  let shownMonth = new Date(today.getFullYear(),today.getMonth(),1);
  let selectedDate = dateKey(today);
  let recipeFilter = 'urgent';
  let toastTimer;
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const daysLeft = (item) => Math.round((startOfDay(parseDate(item.expiry))-today)/dayMs);
  const emojiFor = (name) => ({'대파':'🌿','콩나물':'🌱','우유':'🥛','두부':'🧊','애호박':'🥒','달걀':'🥚','양파':'🧅','사과':'🍎','삼겹살':'🥩','김치':'🥬','소고기':'🥩','밥':'🍚','당근':'🥕','감자':'🥔'}[name] || '🥗');
  const statusOf = (item) => item.storage==='냉동실' ? 'frozen' : daysLeft(item)<0 ? 'expired' : daysLeft(item)===0 ? 'today' : daysLeft(item)<=3 ? 'soon' : 'fresh';
  const statusLabel = (item) => { const d=daysLeft(item); if(item.storage==='냉동실')return '냉동 보관'; if(d<0)return `기한 지남 ${Math.abs(d)}일`; if(d===0)return '오늘까지'; if(d<=3)return `소비 권장 D-${d}`; return `신선 D-${d}`; };
  const persist = () => localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  const showToast = (message) => { const toast=$('toast'); toast.textContent=message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2800); };
  const showMessage = (title,body) => { $('messageTitle').textContent=title; $('messageBody').textContent=body; $('messageDialog').showModal(); };
  const itemsForDate = (key) => state.items.filter(item=>item.expiry===key).sort((a,b)=>daysLeft(a)-daysLeft(b));
  const activeItems = () => state.items;
  const fmtLong = (key) => fmt(parseDate(key),{month:'long',day:'numeric',weekday:'long'});

  function renderHeader(){ $('todayDate').textContent=fmt(today,{year:'numeric',month:'long',day:'numeric',weekday:'long'}); }
  function renderCalendar(){
    const y=shownMonth.getFullYear(),m=shownMonth.getMonth();
    $('monthLabel').textContent=fmt(shownMonth,{year:'numeric',month:'long'});
    const first=new Date(y,m,1), start=new Date(y,m,1-first.getDay());
    const grid=$('calendarGrid'); grid.innerHTML='';
    for(let i=0;i<42;i++){
      const day=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i),key=dateKey(day),list=itemsForDate(key);
      const button=document.createElement('button'); button.type='button'; button.className='calendar-day'+(day.getMonth()!==m?' outside':'')+(key===selectedDate?' selected':''); button.setAttribute('role','gridcell'); button.setAttribute('aria-label',`${fmtLong(key)}${list.length?`, 식재료 ${list.length}개`:''}`); button.setAttribute('aria-selected',key===selectedDate?'true':'false');
      const dateNum=document.createElement('span'); dateNum.className='day-number'+(key===dateKey(today)?' today-number':''); dateNum.textContent=day.getDate(); button.append(dateNum);
      const badges=document.createElement('span'); badges.className='day-badges';
      list.slice(0,2).forEach(item=>{const badge=document.createElement('span'),status=statusOf(item);badge.className=`day-badge badge-${status==='expired'?'today':status}`;badge.textContent=`${status==='today'||status==='expired'?'🔔':status==='soon'?'⏳':status==='frozen'?'❄️':'🥬'} ${item.name}`;badges.append(badge);});
      if(list.length>2){const more=document.createElement('span');more.className='day-badge';more.textContent=`+${list.length-2}개`;badges.append(more);} button.append(badges);
      button.addEventListener('click',()=>{selectedDate=key;renderCalendar();renderDetails();}); grid.append(button);
    }
  }
  function itemCard(item){const status=statusOf(item);const cls=status==='frozen'?'frozen':status==='fresh'?'fresh':status;return `<article class="ingredient-item ${cls}"><div class="ingredient-top"><div><div class="ingredient-title">${esc(item.emoji||emojiFor(item.name))} ${esc(item.name)} ${item.qty>1?`${item.qty}개`:''}</div><div class="ingredient-meta">${esc(item.storage)} 보관 · ${daysLeft(item)===0?'오늘까지 권장':daysLeft(item)<0?`${Math.abs(daysLeft(item))}일 지났어요`:`${Math.max(0,daysLeft(item))}일 남았어요`}</div></div><span class="status-pill ${status}">${esc(statusLabel(item))}</span></div><div class="item-actions"><button class="button button-outline" data-consume="${esc(item.id)}" type="button">✔ 사용 완료</button><button class="button button-outline" data-remove="${esc(item.id)}" type="button">목록에서 빼기</button></div></article>`;}
  function bindItemActions(root=document){root.querySelectorAll('[data-consume]').forEach(btn=>btn.addEventListener('click',()=>removeItem(btn.dataset.consume,'사용 완료로 정리했어요.')));root.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>removeItem(btn.dataset.remove,'재료를 목록에서 뺐어요.')));}
  function renderDetails(){
    const list=itemsForDate(selectedDate); $('selectedDateTitle').textContent=fmtLong(selectedDate); $('selectedCount').textContent=`${list.length}개`; $('selectedIngredients').innerHTML=list.map(itemCard).join(''); $('emptyDay').classList.toggle('hidden',list.length>0); bindItemActions($('selectedIngredients')); renderStats();
  }
  function renderStats(){const counts={'냉장실':0,'냉동실':0,'실온':0};state.items.forEach(i=>counts[i.storage]=(counts[i.storage]||0)+1);$('stockTotal').textContent=`${state.items.length}개`;$('stockStats').innerHTML=Object.entries(counts).map(([name,count])=>`<div class="stock-stat"><span>${name}</span><strong>${count}개</strong></div>`).join('');}
  function renderAlert(){const urgent=state.items.filter(i=>i.storage!=='냉동실'&&daysLeft(i)>=0&&daysLeft(i)<=2);const fresh=state.items.filter(i=>i.storage!=='냉동실'&&daysLeft(i)>2);$('alertTitle').textContent=urgent.length?'소비를 먼저 권해요':'냉장고가 잘 정리되어 있어요';$('alertMessage').textContent=urgent.length?` ${urgent.map(i=>i.name).join(', ')} 등 ${urgent.length}개를 2일 안에 드시면 좋아요. 신선한 재료 ${fresh.length}개가 보관 중입니다.`:`곧 소비기한이 다가오는 재료가 없습니다. 신선한 재료 ${fresh.length}개가 보관 중입니다.`;$('alertBanner').classList.toggle('no-alert',!urgent.length);}
  const recipes=[
    {id:'soup',name:'대파 듬뿍 콩나물 소고기국',emoji:'🍲',time:20,level:'쉬움',ingredients:['대파','콩나물','소고기','두부'],urgent:['대파','콩나물'],desc:'시원하고 든든한 국물 요리',steps:['냄비에 참기름을 두르고 소고기를 볶아요.','물을 붓고 끓으면 콩나물과 두부를 넣어요.','대파를 넣고 국간장으로 간을 맞춰요.']},
    {id:'rice',name:'초간단 대파 계란 볶음밥',emoji:'🍳',time:10,level:'쉬움',ingredients:['대파','달걀','밥'],urgent:['대파'],desc:'고소한 파기름 향이 가득해요',steps:['대파를 잘게 썰고 기름에 볶아 향을 내요.','달걀을 넣어 익힌 뒤 밥을 넣어요.','간장 한 숟가락으로 간을 맞춰 볶아요.']},
    {id:'stew',name:'얼큰 칼칼 두부 김치찌개',emoji:'🥘',time:25,level:'쉬움',ingredients:['김치','두부','대파','양파'],urgent:['대파'],desc:'집에 있는 재료로 끓이는 깊은 맛',steps:['냄비에 김치를 넣고 달달 볶아요.','물을 붓고 두부와 양파를 넣어 끓여요.','대파를 올리고 5분 더 끓여 완성해요.']},
    {id:'sprout',name:'아삭아삭 고소한 콩나물무침',emoji:'🥗',time:12,level:'쉬움',ingredients:['콩나물','대파'],urgent:['콩나물'],desc:'쉽게 만드는 산뜻한 밑반찬',steps:['콩나물을 냄비에 넣고 뚜껑을 덮어 삶아요.','삶은 콩나물의 물기를 빼요.','다진 대파와 참기름, 소금으로 무쳐요.']},
    {id:'egg',name:'포근한 달걀 두부 부침',emoji:'🍽️',time:10,level:'쉬움',ingredients:['달걀','두부'],urgent:[],desc:'부드럽고 담백한 한 접시',steps:['두부를 도톰하게 썰고 물기를 닦아요.','달걀을 풀어 두부에 골고루 입혀요.','약불에서 앞뒤로 노릇하게 부쳐요.']}
  ];
  function renderRecipes(){const names=state.items.map(i=>i.name);const urgentNames=[...new Set(state.items.filter(i=>i.storage!=='냉동실'&&daysLeft(i)<=3&&daysLeft(i)>=0).map(i=>i.name))];$('ingredientMatch').innerHTML=`<strong>우리 집 보유 재료</strong>${names.slice(0,9).map(n=>`<span class="match-chip ${urgentNames.includes(n)?'urgent':''}">${esc(n)}${urgentNames.includes(n)?' · 임박':''}</span>`).join('')||'<span>등록된 재료가 없어요</span>'}`;
    let shown=recipes.filter(r=>r.ingredients.some(n=>names.some(owned=>owned.includes(n)||n.includes(owned))));if(recipeFilter==='urgent')shown=shown.filter(r=>r.urgent.some(n=>urgentNames.includes(n)));if(recipeFilter==='quick')shown=shown.filter(r=>r.time<=10);
    $('recipeGrid').innerHTML=shown.length?shown.map(r=>{const present=r.ingredients.filter(n=>names.some(owned=>owned.includes(n)||n.includes(owned)));const using=r.ingredients.filter(n=>names.some(owned=>owned.includes(n)||n.includes(owned))).slice(0,2);return `<article class="recipe-card"><div class="recipe-top"><span class="recipe-emoji" aria-hidden="true">${r.emoji}</span><div><h3>${r.name}</h3><p class="recipe-subtitle">${r.desc}</p></div></div><div class="recipe-tags"><span class="recipe-tag match">재료 ${present.length}/${r.ingredients.length}개 보유</span><span class="recipe-tag">⏱ ${r.time}분 · ${r.level}</span>${r.urgent.some(n=>urgentNames.includes(n))?'<span class="recipe-tag urgent">임박 재료 활용</span>':''}</div><ol class="recipe-steps">${r.steps.map(s=>`<li>${s}</li>`).join('')}</ol><button class="button button-primary" data-cook="${r.id}" type="button">👨‍🍳 요리 완료 · 재료 사용 처리</button></article>`;}).join(''):`<div class="panel empty-day"><span>🍲</span><strong>${state.items.length?'선택한 기준에 맞는 요리가 없어요':'먼저 냉장고 재료를 추가해 주세요'}</strong><span>다른 추천 기준을 선택하거나 재료를 추가해 보세요.</span></div>`;
    $('recipeGrid').querySelectorAll('[data-cook]').forEach(btn=>btn.addEventListener('click',()=>cookRecipe(btn.dataset.cook)));
  }
  function renderInventory(){const list=[...state.items].sort((a,b)=>daysLeft(a)-daysLeft(b));$('inventorySummary').innerHTML=['냉장실','냉동실','실온'].map((loc,i)=>`<div class="summary-tile"><span class="summary-icon">${['🥬','🧊','🧺'][i]}</span><div><strong>${state.items.filter(item=>item.storage===loc).length}개</strong><span>${loc} 보관</span></div></div>`).join('');$('inventoryList').innerHTML=list.length?list.map(item=>`<article class="inventory-row"><span class="inventory-emoji">${esc(item.emoji||emojiFor(item.name))}</span><div class="inventory-info"><strong>${esc(item.name)} ${item.qty>1?`${item.qty}개`:''}</strong><p>${esc(item.storage)} 보관 · ${fmt(parseDate(item.expiry),{month:'long',day:'numeric'})}까지</p></div><span class="status-pill ${statusOf(item)}">${esc(statusLabel(item))}</span><button class="button button-outline" data-consume="${esc(item.id)}" type="button">✔ 사용 완료</button></article>`).join(''):'<div class="panel empty-day"><span>🧺</span><strong>등록된 식재료가 없습니다</strong><span>식재료를 추가하면 여기에 보여요.</span></div>';bindItemActions($('inventoryList'));}
  function renderAll(){renderCalendar();renderDetails();renderAlert();renderRecipes();renderInventory();}
  function removeItem(id,message){state.items=state.items.filter(i=>i.id!==id);persist();renderAll();showToast(message);}
  function cookRecipe(id){const recipe=recipes.find(r=>r.id===id);if(!recipe)return;const used=[];recipe.ingredients.forEach(name=>{const item=state.items.find(i=>i.name.includes(name)||name.includes(i.name));if(item&&!used.includes(item)){used.push(item);state.items=state.items.filter(i=>i.id!==item.id);}});persist();renderAll();showToast(used.length?`${recipe.name} 완료! ${used.map(i=>i.name).join(', ')} 재료를 정리했어요.`:'요리 완료로 기록했어요.');}
  function setView(view){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelectorAll('.nav-link').forEach(v=>v.classList.toggle('active',v.dataset.view===view));$(`${view}View`).classList.add('active');if(view==='recipes')renderRecipes();if(view==='inventory')renderInventory();window.scrollTo({top:0,behavior:'smooth'});}
  function openAdd(){ $('expiryDate').value=isoOffset(14); $('addDialog').showModal(); }
  function speak(text){if(!('speechSynthesis'in window)){showMessage('음성 안내를 사용할 수 없어요','사용 중인 브라우저에서 음성 읽어주기를 지원하지 않습니다. 화면의 큰 글씨 안내를 이용해 주세요.');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=.9;speechSynthesis.speak(u);showToast('음성 안내를 시작했어요.');}
  renderHeader();renderAll();
  document.querySelectorAll('.nav-link,[data-view="inventory"]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
  $('prevMonth').addEventListener('click',()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()-1,1);renderCalendar();});$('nextMonth').addEventListener('click',()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()+1,1);renderCalendar();});$('todayButton').addEventListener('click',()=>{shownMonth=new Date(today.getFullYear(),today.getMonth(),1);selectedDate=dateKey(today);renderCalendar();renderDetails();});
  ['openAddButton','inventoryAddButton'].forEach(id=>$(id).addEventListener('click',openAdd));$('openRecipesButton').addEventListener('click',()=>setView('recipes'));$('urgentRecipesButton').addEventListener('click',()=>{recipeFilter='urgent';document.querySelectorAll('.filter-chip').forEach(b=>b.classList.toggle('active',b.dataset.filter==='urgent'));setView('recipes');});
  $('fontButton').addEventListener('click',()=>{document.body.classList.toggle('large-text');const on=document.body.classList.contains('large-text');$('fontButton').innerHTML=`<span aria-hidden="true">🔎</span> 글씨 ${on?'보통':'크게'}`;localStorage.setItem('my-fridge-large-text',on?'1':'0');});if(localStorage.getItem('my-fridge-large-text')==='1'){document.body.classList.add('large-text');$('fontButton').innerHTML='<span aria-hidden="true">🔎</span> 글씨 보통';}
  $('syncButton').addEventListener('click',()=>showMessage('기기 연결 안내','현재는 이 브라우저에 식재료를 저장하고 있어요. 스마트폰과 실시간으로 동기화하려면 계정과 서버 연결 설정이 필요합니다.'));
  const voiceText=()=>`오늘은 ${fmt(today,{month:'long',day:'numeric'})}입니다. ${state.items.filter(i=>i.storage!=='냉동실'&&daysLeft(i)>=0&&daysLeft(i)<=2).map(i=>i.name).join(', ')||'소비기한이 임박한 재료가 없습니다'} 재료를 확인해 주세요.`;$('speakButton').addEventListener('click',()=>speak(voiceText()));$('voiceAddButton').addEventListener('click',()=>speak('식재료 추가하기를 눌러 재료 이름과 보관 날짜를 등록할 수 있습니다. 예를 들어 냉장고야 사과 세 개 넣어줘 라고 말해보세요. 음성 입력 기능은 아직 연결되어 있지 않습니다.'));$('recipeSpeakButton').addEventListener('click',()=>speak('냉장고 재료로 만들 수 있는 요리 추천 목록입니다. '+recipes.slice(0,3).map(r=>r.name).join(', ')));
  $('addForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget),name=String(fd.get('name')).trim(),storage=String(fd.get('storage')),expiry=String(fd.get('expiry'));if(!name||!expiry)return;state.items.push({id:`item-${Date.now()}`,name,emoji:emojiFor(name),storage,expiry,qty:1,created:dateKey(today),reminder:$('reminderToggle').checked});persist();$('addDialog').close();e.currentTarget.reset();$('ingredientName').value='대파';$('expiryDate').value=isoOffset(14);selectedDate=expiry;shownMonth=new Date(parseDate(expiry).getFullYear(),parseDate(expiry).getMonth(),1);renderAll();setView('dashboard');showToast(`${name} 재료를 냉장고에 등록했어요.`);});
  $('autoDateButton').addEventListener('click',()=>{$('expiryDate').value=isoOffset(14);showToast('오늘부터 14일 뒤로 설정했어요.');});document.querySelectorAll('[data-pick]').forEach(btn=>btn.addEventListener('click',()=>{$('ingredientName').value=btn.dataset.pick;}));document.querySelectorAll('.storage-option input').forEach(input=>input.addEventListener('change',()=>document.querySelectorAll('.storage-option').forEach(option=>option.classList.toggle('selected',option.contains(input)&&input.checked))));
  document.querySelectorAll('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>{recipeFilter=btn.dataset.filter;document.querySelectorAll('.filter-chip').forEach(b=>b.classList.toggle('active',b===btn));renderRecipes();}));$('seasoningButton').addEventListener('click',()=>showMessage('양념으로 만드는 요리','간장 달걀밥, 김치 볶음밥, 참기름 비빔밥처럼 기본 양념과 밥으로 만들 수 있는 메뉴를 준비 중입니다.'));
  document.querySelectorAll('[data-close-dialog]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.closeDialog).close()));document.querySelectorAll('[data-help]').forEach(btn=>btn.addEventListener('click',()=>showMessage(btn.dataset.help,'가족 기기 연결과 도움말 기능은 계정 동기화 서비스와 함께 제공될 예정입니다.')));
})();
