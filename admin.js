const config = require('./config');
const { getEconomy, addCoins, deductCoins, db } = require('../data/store');

function handleAdmin(args, uid) {
  if(!config.owners.includes(uid)) return '❌ Owner only';
  const sub = args[0];
  if(sub === 'addcoins') { addCoins(args[1], parseInt(args[2])); return `✅ +$${parseInt(args[2]).toLocaleString()}`; }
  return '/admin addcoins [uid] [amt]';
}

function handleTop(args, uid) {
  if(args[0] === 'rich') {
    const all = Object.keys(db.economy).map(id => { const e = db.economy[id]; let stockVal = 0; Object.keys(e.investments||{}).forEach(s => stockVal += STOCKS[s]?.price * e.investments[s] || 0); return {id, net:e.balance+e.bank+stockVal}; }).sort((a,b)=>b.net-a.net).slice(0,10);
    let text = '💎 TOP 10\n'; all.forEach((p,i)=>text+=`${i+1}. ${p.id.slice(-4)} $${p.net.toLocaleString()}\n`); return text;
  }
  return '/top rich';
}

function handleHelp() {
  return `📜 *ECONOMY BOT v7.0*\n\n*Money*: /bank /daily /give /loan\n*Games*: /battle /bossfight /casino /gamble\n*Assets*: /pet 50+ /job /property /car /invest\n*Crime*: /rob\n*Social*: /marry /divorce /top rich\nPrefix: /`;
}

module.exports = { handleAdmin, handleTop, handleHelp };
