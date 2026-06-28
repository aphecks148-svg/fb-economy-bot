const { db, getEconomy, addCoins, deductCoins, save } = require('../data/store');

const STOCKS = { AAPL: {name:'Apple', price:180, volatility:5}, TSLA: {name:'Tesla', price:250, volatility:15}, BTC: {name:'Bitcoin', price:65000, volatility:2000}, ETH: {name:'Ethereum', price:3200, volatility:150}, GOLD: {name:'Gold', price:2000, volatility:30} };

// 50 PETS - Common to Mythic
const PETS = {
  Dog:{emoji:'🐕', price:300, lvMax:50, power:30}, Cat:{emoji:'🐈', price:450, lvMax:50, power:40}, Rabbit:{emoji:'🐰', price:500, lvMax:50, power:45}, Fox:{emoji:'🦊', price:850, lvMax:60, power:60}, Wolf:{emoji:'🐺', price:4200, lvMax:70, power:100}, Tiger:{emoji:'🐅', price:9000, lvMax:70, power:140}, Lion:{emoji:'🦁', price:12000, lvMax:70, power:160}, Bear:{emoji:'🐻', price:15000, lvMax:75, power:170}, Eagle:{emoji:'🦅', price:20000, lvMax:75, power:190}, Shark:{emoji:'🦈', price:25000, lvMax:75, power:200},
  Griffin:{emoji:'🦅', price:50000, lvMax:80, power:240}, Unicorn:{emoji:'🦄', price:75000, lvMax:80, power:260}, Dragon:{emoji:'🐉', price:75000, lvMax:80, power:180}, Phoenix:{emoji:'🔥', price:100000, lvMax:85, power:300}, Kraken:{emoji:'🦑', price:150000, lvMax:85, power:320}, Leviathan:{emoji:'🐋', price:200000, lvMax:85, power:350}, Hydra:{emoji:'🐍', price:300000, lvMax:90, power:380}, Chimera:{emoji:'🦁', price:400000, lvMax:90, power:400}, Minotaur:{emoji:'🐂', price:500000, lvMax:90, power:420}, Centaur:{emoji:'🏹', price:600000, lvMax:90, power:440},
  Angel:{emoji:'👼', price:800000, lvMax:95, power:480}, Demon:{emoji:'👹', price:1000000, lvMax:95, power:500}, Vampire:{emoji:'🧛', price:1500000, lvMax:95, power:520}, Werewolf:{emoji:'🐺', price:2000000, lvMax:95, power:540}, Ghost:{emoji:'👻', price:2500000, lvMax:95, power:560}, Spirit:{emoji:'🗿', price:3000000, lvMax:95, power:580}, Golem:{emoji:'🪨', price:4000000, lvMax:95, power:600}, Titan:{emoji:'🗽', price:5000000, lvMax:95, power:650}, Behemoth:{emoji:'🦣', price:8000000, lvMax:95, power:700}, LeviathanX:{emoji:'🐳', price:10000000, lvMax:95, power:750},
  God:{emoji:'⚡', price:20000000, lvMax:99, power:1000}, Emperor:{emoji:'👑', price:30000000, lvMax:99, power:1200}, Overlord:{emoji:'💀', price:40000000, lvMax:99, power:1500}, Divine:{emoji:'✨', price:50000000, lvMax:99, power:1800}, Ancient:{emoji:'🛡️', price:75000000, lvMax:99, power:2000}, Eternal:{emoji:'♾️', price:100000, lvMax:99, power:2200}, Cosmic:{emoji:'🌌', price:150000, lvMax:99, power:2300}, Divine Emperor:{emoji:'🐉👑', price:50000000, lvMax:999, power:2350}, Celestial:{emoji:'🌟', price:250000, lvMax:999, power:2400}, Mythic:{emoji:'🌈', price:500000, lvMax:999, power:2500}
};

const BOSSES = { dragon: {name:'Ancient Dragon', emoji:'🐉', hp:5000, reward:10000000, power:300}, leviathan: {name:'Leviathan', emoji:'🐋', hp:10000, reward:25000000, power:500}, behemoth: {name:'Behemoth', emoji:'🦣', hp:20000, reward:50000000, power:800}, god: {name:'God Dragon', emoji:'🐲👑', hp:50000, reward:200000, power:1500} };
const JOBS = { beggar: {name:'Beggar', salary:500, level:1, risk:0.3}, cashier: {name:'Cashier', salary:2000, level:5, risk:0.1}, miner: {name:'Miner', salary:8000, level:15, risk:0.15}, hacker: {name:'Hacker', salary:25000, level:30, risk:0.25}, ceo: {name:'CEO', salary:100000, level:50, risk:0.05} };
const PROPERTIES = { shack: {name:'Wooden Shack', price:50000, income:1000, tax:100}, house: {name:'Suburban House', price:500000, income:8000, tax:800}, mansion: {name:'Mansion', price:5000000, income:100000, tax:10000}, penthouse: {name:'Penthouse', price:50000000, income:1200000, tax:120000} };
const CARS = { bike: {name:'Motorbike', price:20000, income:500, speed:50}, sedan: {name:'Sedan', price:200000, income:3000, speed:120}, lamborghini: {name:'Lamborghini', price:3000000, income:50000, speed:350}, bugatti: {name:'Bugatti Chiron', price:30000000, income:600000, speed:420} };
let activeBoss = null;

//... All your existing handlers: Bank, Battle, Pet, Invest, Bossfight, Casino, Job, Rob, Gamble, Property, Car...

function handleBank(args, uid) { /* same as yours */
  const eco = getEconomy(uid); const sub = args[0]; const amt = args[1] === 'all'? eco.balance : parseInt(args[1]);
  if(!sub) { const interest = Math.floor(eco.bank * 0.01); return `🏦 *BANK*\n💵 $${eco.balance.toLocaleString()}\n🏦 $${eco.bank.toLocaleString()}\n💰 +$${interest}/day\n/bank deposit [amt|all] /withdraw [amt|all]`; }
  if(sub === 'deposit') { if(!amt ||!deductCoins(uid, amt)) return '❌ Invalid/Not enough'; eco.bank += amt; save('economy'); return `✅ +$${amt.toLocaleString()} | W:$${eco.balance} B:$${eco.bank}`; }
  if(sub === 'withdraw') { if(!amt || eco.bank < amt) return '❌ Invalid/Not enough'; eco.bank -= amt; eco.balance += amt; save('economy'); return `✅ -$${amt.toLocaleString()} | W:$${eco.balance} B:$${eco.bank}`; }
}

function handleBattle(args, uid) { /* same as yours with couple bonus */
  const target = args[0]; const bet = parseInt(args[1]); if(!target ||!bet || bet < 100) return '❌ /battle [uid] [bet] Min $100';
  if(!deductCoins(uid, bet)) return '❌ No cash'; const targetEco = getEconomy(target); if(!deductCoins(target, bet)) {addCoins(uid,bet); return '❌ Target broke';}
  const myPet = db.pets?.[uid]; const petBonus = myPet? myPet.power : 0; const married = db.marriage?.[uid]?.spouse; const coupleBonus = married === target? Math.floor(bet * 0.1) : 0;
  const myP = Math.floor(Math.random()*60)+60 + petBonus + coupleBonus; const theirP = Math.floor(Math.random()*60)+60 + (db.pets?.[target]?.power || 0);
  if(myP > theirP) { const win = bet * 2; addCoins(uid, win); if(myPet && myPet.level < myPet.lvMax) { myPet.xp += Math.floor(bet/1000)+20; if(myPet.xp >= myPet.level*100) {myPet.xp=0; myPet.level++; myPet.power+=15;} save('pets'); }
    return `⚔️ WIN +$${win.toLocaleString()}\n${myP} vs ${theirP}${myPet?`\n🐾 ${myPet.emoji} Lv.${myPet.level}`:''}${coupleBonus?`\n💍 +10% Couple Bonus`:''}`;
  } else { addCoins(target, bet * 2); return `💀 LOSE -$${bet.toLocaleString()}\n${myP} vs ${theirP}`; }
}

function handlePet(args, uid) { /* same as yours but 50 pets */
  if(!db.pets) db.pets = {}; const myPet = db.pets[uid]; const sub = args[0];
  if(!sub) return myPet? `🐾 ${myPet.emoji} ${myPet.name}\nLv.${myPet.level} XP:${myPet.xp}/${myPet.level*100} Power:${myPet.power}\n/pet train` : '❌ No pet. /pet shop';
  if(sub === 'shop') { let text = '🐾 *50 PETS SHOP*\n\n'; Object.keys(PETS).slice(0,20).forEach(p => { const d = PETS[p]; text += `${d.emoji} ${p} $${d.price.toLocaleString()}\n`; }); return text + '...and 30 more /pet shop 2\n/pet buy [name]'; }
  if(sub === 'shop' && args[1]==='2') { let text = '🐾 *50 PETS SHOP PAGE 2*\n\n'; Object.keys(PETS).slice(20,40).forEach(p => { const d = PETS[p]; text += `${d.emoji} ${p} $${d.price.toLocaleString()}\n`; }); return text + '...'; }
  if(sub === 'buy') { if(myPet) return '❌ /pet release first'; const petName = args.slice(1).join(' '); const petData = PETS[petName]; if(!petData) return '❌ Not found'; if(!deductCoins(uid, petData.price)) return `❌ $${petData.price.toLocaleString()}`; db.pets[uid] = {name:petName, emoji:petData.emoji, level:1, xp:0, power:petData.power, lvMax:petData.lvMax}; save('pets'); return `✅ ${petData.emoji} ${petName} Lv.1 Power ${petData.power}`; }
  if(sub === 'train') { if(!myPet) return '❌ No pet'; if(myPet.level >= myPet.lvMax) return '👑 Max'; const cost = myPet.level * 5000; if(!deductCoins(uid, cost)) return `❌ $${cost}`; const xpGain = Math.floor(Math.random()*50)+30; myPet.xp += xpGain; if(myPet.xp >= myPet.level*100) {myPet.xp=0; myPet.level++; myPet.power+=15; save('pets'); return `💪 +${xpGain} XP\n🎉 Lv.${myPet.level} Power ${myPet.power}`} save('pets'); return `💪 +${xpGain} XP | Lv.${myPet.level}`; }
  if(sub === 'release') { if(!myPet) return '❌ No pet'; delete db.pets[uid]; save('pets'); return '✅ Released'; }
}

function handleInvest(args, uid) { /* same as yours */
  const eco = getEconomy(uid); const sub = args[0];
  if(!sub || sub === 'market') { let text = '📈 *MARKET*\n\n'; Object.keys(STOCKS).forEach(sym => { const change = Math.floor(Math.random()*STOCKS[sym].volatility)-STOCKS[sym].volatility/2; STOCKS[sym].price = Math.max(10, STOCKS[sym].price + change); text += `${sym}: $${STOCKS[sym].price.toLocaleString()}\n`; }); return text + '/invest buy [SYM] [qty] /portfolio'; }
  if(sub === 'buy') { const sym = args[1]?.toUpperCase(); const qty = parseInt(args[2]); if(!STOCKS[sym]) return '❌'; const cost = STOCKS[sym].price * qty; if(!deductCoins(uid, cost)) return `❌ $${cost}`; eco.investments[sym] = (eco.investments[sym] || 0) + qty; save('economy'); return `✅ ${qty} ${sym} $${cost}`; }
  if(sub === 'portfolio') { let total = 0; let text = '💼 *PORTFOLIO*\n\n'; Object.keys(eco.investments||{}).forEach(sym => { const val = STOCKS[sym].price * eco.investments[sym]; total += val; text += `${sym}: ${eco.investments[sym]} $${val.toLocaleString()}\n`; }); return text + `\nTotal: $${total.toLocaleString()}`; }
}

function handleBossfight(args, uid) { /* same as yours */
  const sub = args[0]; if(!sub || sub === 'spawn') { const bossKey = Object.keys(BOSSES)[Math.floor(Math.random()*4)]; activeBoss = {...BOSSES[bossKey], hp:BOSSES[bossKey].hp, players:{}}; return `🚨 ${activeBoss.emoji} ${activeBoss.name}\nHP: ${activeBoss.hp}\nReward: $${activeBoss.reward}\n/bossfight attack`; }
  if(sub === 'attack') { if(!activeBoss) return '❌ /bossfight spawn'; const pet = db.pets?.[uid]; const dmg = Math.floor(Math.random()*100)+50+(pet?pet.power:0); activeBoss.hp -= dmg; activeBoss.players[uid] = (activeBoss.players[uid]||0)+dmg; if(activeBoss.hp <= 0) { const total = Object.values(activeBoss.players).reduce((a,b)=>a+b,0); let msg = `🎉 DEFEATED!\n`; Object.keys(activeBoss.players).forEach(id=>{ const share = Math.floor(activeBoss.players[id]/total*activeBoss.reward); addCoins(id, share); msg += `User${id.slice(-4)}: $${share}\n`; }); activeBoss = null; return msg; } return `⚔️ -${dmg} HP: ${activeBoss.hp}`; }
}

function handleCasino(args, uid) { /* same as yours */
  const sub = args[0]; const bet = parseInt(args[1]); if(sub === 'slots') { if(!bet || bet < 100) return '❌ Min $100'; if(!deductCoins(uid, bet)) return '❌'; const spin = ['🍒','🔔','💎','7️⃣','🍀'].sort(()=>0.5-Math.random()).slice(0,3); const multi = spin[0]===spin[1]&&spin[1]===spin[2]?10:spin[0]===spin[1]||spin[1]===spin[2]?2:0; const win = bet*multi; if(win>0) addCoins(uid, win); return `🎰 [${spin.join('|')}]\n${multi===10?'🎉 10x':multi===2?'✅ 2x':'❌'} $${win}`; }
  if(sub === 'roulette') { const choice = args[1]; if(!bet || bet < 100) return '❌ /casino roulette [red/black/num] [bet]'; if(!deductCoins(uid, bet)) return '❌'; const num = Math.floor(Math.random()*37); const color = num===0?'green':num%2===0?'black':'red'; const multi = choice===num.toString()?35:choice===color?2:0; const win = bet*multi; if(win>0) addCoins(uid, win); return `🎡 ${num} ${color}\n${multi===35?'🎉 35x':multi===2?'✅ 2x':'❌'} $${win}`; }
}

function handleJob(args, uid) { /* same as yours */
  const eco = getEconomy(uid); const sub = args[0]; if(!sub || sub === 'work') { const job = JOBS[eco.job.name.toLowerCase()] || {salary:0}; if(job.salary===0) return '❌ /job apply [name]'; if(Date.now()-eco.job.lastPay < 60000) return '⏰ 60s'; if(Math.random() < job.risk) { const loss = Math.floor(job.salary*0.5); deductCoins(uid, loss); return `💀 -$${loss}`; } addCoins(uid, job.salary); eco.job.xp += 10; eco.job.lastPay = Date.now(); if(eco.job.xp >= eco.job.level*50) {eco.job.xp=0; eco.job.level++;} save('economy'); return `💰 +$${job.salary} | Lv.${eco.job.level}`; }
  if(sub === 'apply') { const job = JOBS[args[1]?.toLowerCase()]; if(!job) return `❌ ${Object.keys(JOBS).join(', ')}`; if(eco.job.level < job.level) return `❌ Lv.${job.level}`; eco.job.name = job.name; save('economy'); return `✅ ${job.name} $${job.salary}`; }
}

function handleRob(args, uid) { /* same as yours */
  const target = args[0]; if(!target) return '❌ /rob [uid]'; const eco = getEconomy(uid); const targetEco = getEconomy(target); if(Date.now()-eco.lastRob < 300000) return '🚔 5min'; if(targetEco.balance < 1000) return '❌ Broke'; eco.lastRob = Date.now(); const steal = Math.floor(targetEco.balance*(Math.random()*0.3+0.1)); if(Math.random() < 0.4) { const fine = Math.floor(steal*1.5); deductCoins(uid, Math.min(fine, eco.balance)); return `🚔 CAUGHT -$${fine}`; } deductCoins(target, steal); addCoins(uid, steal); return `🔫 +$${steal} from ${target.slice(-4)}`; }
}

function handleGamble(args, uid) { /* same as yours */
  const bet = parseInt(args[1]); if(!bet || bet < 100) return '🎲 /gamble coinflip [heads|tails] [bet]'; if(!deductCoins(uid, bet)) return '❌'; const coin = Math.random()<0.5?'heads':'tails'; if(args[0]===coin) { addCoins(uid, bet*2); return `🎲 ${coin} WIN +$${bet*2}`; } return `🎲 ${coin} LOSE -$${bet}`; }

function handleProperty(args, uid) { /* same as yours */
  const eco = getEconomy(uid); const sub = args[0]; if(sub === 'buy') { const p = PROPERTIES[args[1]]; if(!p) return `🏠 ${Object.keys(PROPERTIES).join(', ')}`; if(!deductCoins(uid, p.price)) return `❌ $${p.price}`; eco.properties.push(p); save('economy'); return `🏠 ${p.name} $${p.price}`; }
  if(sub === 'collect') { const income = eco.properties.reduce((s,p)=>s+p.income-p.tax,0); addCoins(uid, income); return `💰 +$${income} from ${eco.properties.length}`; }
}

function handleCar(args, uid) { /* same as yours */
  const eco = getEconomy(uid); const sub = args[0]; if(sub === 'buy') { const c = CARS[args[1]]; if(!c) return `🚗 ${Object.keys(CARS).join(', ')}`; if(!deductCoins(uid, c.price)) return `❌ $${c.price}`; eco.cars.push(c); save('economy'); return `🚗 ${c.name} $${c.price}`; }
  if(sub === 'collect') { const income = eco.cars.reduce((s,c)=>s+c.income,0); addCoins(uid, income); return `💰 +$${income} from ${eco.cars.length}`; }
}

// NEW: MARRIAGE
function handleMarry(args, uid) {
  const target = args[0]; if(!target || target===uid) return '❌ /marry [uid]';
  if(db.marriage[uid]) return '❌ Already married. /divorce first';
  if(db.marriage[target]) return '❌ They are married';
  db.marriage[uid] = {spouse:target, date:Date.now()}; db.marriage[target] = {spouse:uid, date:Date.now()}; save('marriage');
  return `💍 Married User${target.slice(-4)}! +10% battle bonus together`;
}
function handleDivorce(uid) {
  if(!db.marriage[uid]) return '❌ Not married'; const ex = db.marriage[uid].spouse; delete db.marriage[uid]; delete db.marriage[ex]; save('marriage');
  return '💔 Divorced';
}

// NEW: LOAN
function handleLoan(args, uid) {
  const eco = getEconomy(uid); const sub = args[0]; const amt = parseInt(args[1]);
  if(sub === 'take') { if(eco.loan.amount>0) return '❌ Pay loan first'; if(!amt || amt>100000) return '❌ Max $100k'; eco.loan.amount = amt; eco.loan.due = Math.floor(amt*1.2); eco.balance += amt; save('economy'); return `💳 Loan +$${amt} Due: $${eco.loan.due}`; }
  if(sub === 'pay') { if(eco.loan.amount===0) return '❌ No loan'; if(!deductCoins(uid, eco.loan.due)) return `❌ Need $${eco.loan.due}`; eco.loan = {amount:0,due:0}; save('economy'); return '✅ Loan paid'; }
  return `💳 Loan: $${eco.loan.amount} Due: $${eco.loan.due}\n/loan take [amt] /loan pay`;
}

// NEW: GIVE
function handleGive(args, uid) {
  const target = args[0]; const amt = parseInt(args[1]); if(!target ||!amt || amt<1) return '❌ /give [uid] [amt]';
  if(!deductCoins(uid, amt)) return '❌ No cash'; addCoins(target, amt); return `💸 Sent $${amt.toLocaleString()} to ${target.slice(-4)}`;
}

module.exports = { handleBank, handleBattle, handlePet, handleInvest, handleBossfight, handleCasino, handleJob, handleRob, handleGamble, handleProperty, handleCar, handleMarry, handleDivorce, handleLoan, handleGive, STOCKS, activeBoss };
