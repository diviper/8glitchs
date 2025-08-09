window.widgets = (function () {
  const mounts = {
    landauer(el){
      const k = 1.380649e-23;
      const t = +el.dataset.t || +el.dataset.T || 300;
      const n = +el.dataset.n || +el.dataset.N || 1000000;
      el.innerHTML = '';
      const rowT = document.createElement('div');
      rowT.className = 'row';
      const labelT = document.createElement('label');
      labelT.textContent = 'T (K)';
      const inputT = document.createElement('input');
      inputT.type = 'range';
      inputT.min = 1; inputT.max = 1000; inputT.value = t; inputT.step = 1;
      rowT.appendChild(labelT); rowT.appendChild(inputT);
      const rowN = document.createElement('div');
      rowN.className = 'row';
      const labelN = document.createElement('label');
      labelN.textContent = 'N (бит)';
      const inputN = document.createElement('input');
      inputN.type = 'range';
      inputN.min = 1; inputN.max = 10000000; inputN.value = n; inputN.step = 1;
      rowN.appendChild(labelN); rowN.appendChild(inputN);
      const out = document.createElement('div');
      out.className = 'row';
      const outSpan = document.createElement('span');
      out.appendChild(outSpan);
      const canvas = document.createElement('canvas');
      canvas.width = 300; canvas.height = 100;
      el.appendChild(rowT); el.appendChild(rowN); el.appendChild(out); el.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      function draw(){
        const T = +inputT.value;
        const N = +inputN.value;
        const Q = k * T * Math.log(2) * N;
        outSpan.textContent = 'Q_min ≈ ' + Q.toExponential(3) + ' Дж';
        ctx.clearRect(0,0,300,100);
        ctx.beginPath();
        for(let x=0;x<300;x++){
          const TT = x/300*1000;
          const QQ = k*TT*Math.log(2)*N;
          const y = 100 - QQ/(k*1000*Math.log(2)*N)*100;
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = '#0ff';
        ctx.stroke();
        const tX = T/1000*300;
        ctx.fillStyle = '#f0f';
        ctx.fillRect(tX-2,0,4,100);
      }
      inputT.oninput = draw;
      inputN.oninput = draw;
      draw();
    },
    goodhart(el){
      el.innerHTML = '';
      const row = document.createElement('div');
      row.className = 'row';
      const label = document.createElement('label');
      label.textContent = 'жёсткость цели';
      const input = document.createElement('input');
      input.type = 'range';
      input.min = 0; input.max = 100; input.value = 50;
      row.appendChild(label); row.appendChild(input);
      const canvas = document.createElement('canvas');
      canvas.width = 300; canvas.height = 100;
      el.appendChild(row); el.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      function draw(){
        ctx.clearRect(0,0,300,100);
        ctx.beginPath(); ctx.strokeStyle='#0f0';
        for(let x=0;x<=300;x++){
          const g=x/300;
          const m=g; const y=100 - m*100;
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.beginPath(); ctx.strokeStyle='#f00';
        for(let x=0;x<=300;x++){
          const g=x/300;
          const q=1-g;
          const y=100 - q*100;
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
        const g = input.value/100;
        const x = g*300;
        ctx.strokeStyle='#fff';
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,100); ctx.stroke();
      }
      input.oninput = draw;
      draw();
    },
    zeno(el){
      el.innerHTML = '';
      const btn = document.createElement('button');
      btn.textContent = 'Старт';
      const list = document.createElement('div');
      el.appendChild(btn); el.appendChild(list);
      btn.onclick = function(){
        btn.disabled = true; list.textContent='';
        let sum=0, step=1, i=0;
        function iter(){
          sum+=step; step/=2; i++;
          const p=document.createElement('div');
          p.textContent = 'Σ'+i+' = '+sum.toFixed(3);
          list.appendChild(p);
          if(sum<2-1e-3) setTimeout(iter,300); else btn.disabled=false;
        }
        iter();
      };
    },
    arrow(el){
      el.innerHTML='';
      const row=document.createElement('div'); row.className='row';
      const label=document.createElement('label'); label.textContent='грубое зернение';
      const input=document.createElement('input'); input.type='range'; input.min=1; input.max=20; input.value=1;
      row.appendChild(label); row.appendChild(input);
      const canvas=document.createElement('canvas'); canvas.width=200; canvas.height=100;
      el.appendChild(row); el.appendChild(canvas);
      const ctx=canvas.getContext('2d');
      const data=[]; for(let i=0;i<200*100;i++) data.push(Math.random()<0.5?0:255);
      function draw(){
        const g=+input.value;
        ctx.clearRect(0,0,200,100);
        for(let y=0;y<100;y+=g){
          for(let x=0;x<200;x+=g){
            let sum=0,count=0;
            for(let yy=0;yy<g;yy++) for(let xx=0;xx<g;xx++){
              const ix=(y+yy)*200+(x+xx);
              if(data[ix]!=null){sum+=data[ix];count++;}
            }
            const c=sum/count;
            ctx.fillStyle='rgb('+c+','+c+','+c+')';
            ctx.fillRect(x,y,g,g);
          }
        }
      }
      input.oninput=draw; draw();
    },
    chsh(el){
      el.innerHTML='';
      const btn=document.createElement('button'); btn.textContent='Сгенерировать 10 000 пар';
      const out=document.createElement('div');
      el.appendChild(btn); el.appendChild(out);
      btn.onclick=function(){
        const N=10000;
        const anglesA=[0,Math.PI/2];
        const anglesB=[Math.PI/4,-Math.PI/4];
        const sums=[[0,0],[0,0]]; const counts=[[0,0],[0,0]];
        for(let i=0;i<N;i++){
          const a=Math.random()<0.5?0:1;
          const b=Math.random()<0.5?0:1;
          const diff=anglesA[a]-anglesB[b];
          const prob=(1-Math.cos(diff))/2;
          const same=Math.random()>prob;
          const aOut=Math.random()>0.5?1:-1;
          const bOut=same?aOut:-aOut;
          sums[a][b]+=aOut*bOut; counts[a][b]++;
        }
        const E=sums.map((row,i)=>row.map((v,j)=>v/counts[i][j]));
        const S=Math.abs(E[0][0]+E[0][1]+E[1][0]-E[1][1]).toFixed(3);
        out.textContent='S = '+S;
      };
    },
    twoslit(el){
      el.innerHTML='';
      const row=document.createElement('div'); row.className='row';
      const label=document.createElement('label'); label.textContent='наблюдаю';
      const chk=document.createElement('input'); chk.type='checkbox';
      row.appendChild(label); row.appendChild(chk);
      const canvas=document.createElement('canvas'); canvas.width=300; canvas.height=100;
      el.appendChild(row); el.appendChild(canvas);
      const ctx=canvas.getContext('2d');
      function draw(){
        ctx.clearRect(0,0,300,100);
        for(let x=0;x<300;x++){
          const I=chk.checked?0.5:Math.cos(x/15)**2;
          const y=100-I*100;
          ctx.beginPath(); ctx.moveTo(x,100); ctx.lineTo(x,y); ctx.strokeStyle='#0ff'; ctx.stroke();
        }
      }
      chk.onchange=draw; draw();
    }
  };
  function mount(el){
    const type=el.dataset.type;
    if(mounts[type]) mounts[type](el);
  }
  function mountAll(root=document){
    root.querySelectorAll('.widget').forEach(mount);
  }
  return { mount, mountAll };
})();
