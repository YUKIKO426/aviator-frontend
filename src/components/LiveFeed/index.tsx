import React, { useState, useEffect } from 'react';
import './livefeed.scss';

const NAMES = ['Rahul S.','Priya M.','Amit K.','Sneha R.','Vikram P.','Anjali T.','Rohit G.','Pooja B.','Arjun N.','Kavya S.','Suresh D.','Meera J.','Kiran V.','Divya C.','Rajesh H.','Nisha A.','Deepak L.','Sonia W.','Manish E.','Ritu F.','Aakash Y.','Priyanka U.','Sanjay I.','Lakshmi O.','Varun Q.'];
const EMOJIS = ['🎯','🎲','✈️','🚀','💎','🔥','⚡','🌟','💫','🎪'];
const rand = (a:number,b:number) => Math.floor(Math.random()*(b-a+1))+a;
const randF = (a:number,b:number) => (Math.random()*(b-a)+a).toFixed(2);
const rName = () => NAMES[Math.floor(Math.random()*NAMES.length)];
const rEmoji = () => EMOJIS[Math.floor(Math.random()*EMOJIS.length)];

type AType = 'bet'|'win'|'bigwin'|'deposit'|'withdraw';
interface Act { id:number; type:AType; name:string; emoji:string; amount:number; mult?:number; profit?:number; }
let aid = 1;

function gen(): Act {
  const types:AType[] = ['bet','win','win','bigwin','deposit','withdraw','bet','win'];
  const type = types[Math.floor(Math.random()*types.length)];
  const name = rName(); const emoji = rEmoji();
  if(type==='bet') return {id:aid++,type,name,emoji,amount:rand(50,2000)};
  if(type==='win'){const b=rand(100,5000);const m=parseFloat(randF(1.2,4.5));return {id:aid++,type,name,emoji,amount:b,mult:m,profit:Math.floor(b*m)};}
  if(type==='bigwin'){const b=rand(1000,10000);const m=parseFloat(randF(8,50));return {id:aid++,type,name,emoji,amount:b,mult:m,profit:Math.floor(b*m)};}
  if(type==='deposit') return {id:aid++,type,name,emoji,amount:rand(500,25000)};
  return {id:aid++,type:'withdraw',name,emoji,amount:rand(300,15000)};
}

const initWins = Array.from({length:8},()=>{const a=gen();a.type='bigwin';a.mult=parseFloat(randF(5,40));a.profit=rand(5000,150000);return a;});

export default function LiveFeed(){
  const [acts,setActs]=useState<Act[]>(()=>Array.from({length:15},gen));
  const [toasts,setToasts]=useState<Act[]>([]);
  const [wins,setWins]=useState<Act[]>(initWins);

  useEffect(()=>{
    const go=():ReturnType<typeof setTimeout>=>{
      const t=setTimeout(()=>{
        const a=gen();
        setActs(p=>[a,...p.slice(0,19)]);
        if(a.type==='bigwin'&&(a.mult||0)>=10){
          setToasts(p=>[...p,a]);
          setWins(p=>[a,...p.slice(0,9)]);
          setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==a.id)),4000);
        }
        go();
      },rand(1500,4000));
      return t;
    };
    const t=go();
    return ()=>clearTimeout(t);
  },[]);

  return (
    <>
      {/* Ticker */}
      <div className="av-ticker">
        <div className="av-ticker-label">🔴 LIVE</div>
        <div className="av-ticker-track">
          <div className="av-ticker-inner">
            {[...wins,...wins].map((w,i)=>(
              <span key={i} className="av-tick-item">
                <span className="atn">{w.name}</span>
                <span className="atw">won</span>
                <span className={`atm ${(w.mult||0)>=20?'mega':''}`}>x{w.mult?.toFixed(2)}</span>
                <span className="ata">₹{w.profit?.toLocaleString()}</span>
                <span className="ats">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Big win toasts */}
      <div className="av-toasts">
        {toasts.slice(-2).map(t=>(
          <div key={t.id} className="av-toast">
            <span className="at-icon">🚀</span>
            <div>
              <div className="at-name">{t.name}</div>
              <div className="at-line">won <strong>x{t.mult?.toFixed(2)}</strong></div>
              <div className="at-amt">₹{t.profit?.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
