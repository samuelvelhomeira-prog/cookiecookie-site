(function(){
  var TEX=CC_IMG.hero,TEXB=CC_IMG.body,PL1=CC_IMG.pl1,PL2=CC_IMG.pl2,STK=CC_IMG.stk;
  var ITEMS=[
    {id:"trad",n:"Cookie tradicional",d:"Massa de baunilha com pedaços de chocolate meio amargo. O tradicional que todos nós amamos!",p:4,i:CC_IMG.trad},
    {id:"nozes",n:"Cookie de nozes",d:"Massa de cacau 70% com pedaços de chocolate meio amargo e nozes.",p:5,i:CC_IMG.nozes},
    {id:"limao",n:"Cookie de limão siciliano",d:"Massa de baunilha com raspas de limão siciliano e pedaços de chocolate branco.",p:6,i:CC_IMG.limao},
    {id:"kitkat",n:"Cookie de Kit Kat",d:"Massa de baunilha com pedaços de Kit Kat, chocolate meio amargo e recheio cremoso de Kit Kat.",p:6,i:CC_IMG.kitkat},
    {id:"ovo",n:"Cookie de Ovomaltine",d:"Massa de baunilha recheada com creme de Ovomaltine, camada de chocolate meio amargo e cereal de Ovomaltine.",p:7,i:CC_IMG.ovo},
    {id:"oreo",n:"Cookie de Oreo",d:"Massa de baunilha com pedaços de Oreo, chocolate meio amargo e branco, com um mini Oreo no topo.",p:7,i:CC_IMG.oreo}
  ];
  var ROUTES=["sobre","contato","inicio","carrinho","avaliacoes"],PHONE="5547999037955";
  var $=function(s){return document.querySelector(s)};
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var money=function(v){return "R$ "+v.toFixed(2).replace(".",",")};
  var cart={};
  try{cart=JSON.parse(localStorage.getItem("cc-cart")||"{}")||{}}catch(e){cart={}}
  function save(){try{localStorage.setItem("cc-cart",JSON.stringify(cart))}catch(e){}}
  function count(){return Object.keys(cart).reduce(function(a,k){return a+cart[k]},0)}

  // cardápio
  $("#grid").innerHTML=ITEMS.map(function(x){
    return '<article class="panel item"><img src="'+x.i+'" alt="'+x.n+'"><div><h3>'+x.n+'</h3><p>'+x.d+'</p><div class="row"><span class="price">'+money(x.p)+'</span><button class="add" data-add="'+x.id+'" aria-label="Adicionar '+x.n+' ao carrinho">+</button></div></div></article>';
  }).join("");
  var tt;function toast(m){var t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on")},1400)}

  // ---- frete ----
  var LOJA="Rua Santa Efigênia, Blumenau – SC",FRETE={km:1.5,free:20};
  // km ESTIMADOS a partir da loja: ajuste cada valor para a distância real
  var REG=[["Centro",2],["Jardim Blumenau",2],["Ponta Aguda",3],["Vila Nova",3],["Bom Retiro",3],["Vorstadt",3],["Victor Konder",3.5],["Boa Vista",4],["Garcia",4],["Valparaíso",4],["Glória",4],["Itoupava Seca",4],["Água Verde",5],["Progresso",5],["Velha",5],["Itoupava Norte",6],["Fidélis",6],["Escola Agrícola",7],["Fortaleza",8],["Badenfurt",9],["Gaspar",14],["Indaial",18],["Pomerode",22]];
  var ship={mode:"retirar",reg:"",rua:"",ref:""};
  var kmf=function(k){return String(k).replace(".",",")};
  function lines(){return Object.keys(cart).filter(function(k){return cart[k]>0}).map(function(k){return{x:ITEMS.filter(function(i){return i.id===k})[0],q:cart[k]}})}
  function shipInfo(c){
    if(ship.mode!=="entrega")return{fee:0,ok:true};
    var r=REG.filter(function(x){return x[0]===ship.reg})[0],free=c>=FRETE.free;
    if(!r)return{ok:false,fee:0,free:free};
    return{sel:true,km:r[1],free:free,fee:free?0:Math.round(r[1]*FRETE.km*100)/100,ok:ship.rua.trim().length>2};
  }
  function buildMsg(sub,si,tot){
    var L=["Olá! Quero fazer um pedido:"];
    lines().forEach(function(l){L.push(l.q+"x "+l.x.n)});
    L.push("Subtotal: "+money(sub));
    if(ship.mode==="entrega"){
      L.push("Recebimento: ENTREGA");
      L.push("Endereço: "+ship.rua.trim()+", "+ship.reg+(ship.ref.trim()?" ("+ship.ref.trim()+")":""));
      L.push("Frete: "+(si.free?"Grátis (a partir de "+FRETE.free+" cookies)":money(si.fee)+" (~"+kmf(si.km)+" km)"));
    }else L.push("Recebimento: RETIRADA na loja ("+LOJA+")");
    L.push("Total: "+money(tot));
    L.push("Horário: a combinar");
    return encodeURIComponent(L.join("\n"));
  }
  function renderShip(){
    var el=$("#shipbody");if(!el)return;
    if(ship.mode==="retirar"){el.innerHTML='<p class="soft" style="margin:0">Retirada na loja: '+LOJA+'. Horário a combinar.</p>';return}
    el.innerHTML='<label class="f">Bairro ou cidade<select class="in" id="sreg"><option value="">Selecione</option>'+REG.map(function(r){return'<option'+(r[0]===ship.reg?" selected":"")+'>'+r[0]+'</option>'}).join("")+'</select></label>'+
      '<label class="f">Rua e número<input class="in" id="srua" autocomplete="street-address" placeholder="Ex.: Rua das Flores, 123" value="'+esc(ship.rua)+'"></label>'+
      '<label class="f">Complemento ou ponto de referência (opcional)<input class="in" id="sref" value="'+esc(ship.ref)+'"></label>'+
      '<p class="soft small" id="sinfo" style="margin:.8rem 0 0"></p>';
  }
  function updSum(){
    var ls=lines(),c=count(),sub=ls.reduce(function(a,l){return a+l.x.p*l.q},0),si=shipInfo(c),tot=sub+si.fee;
    $("#sum").innerHTML='<div class="sumrow soft"><span>Subtotal</span><span>'+money(sub)+'</span></div>'+(ship.mode==="entrega"?'<div class="sumrow soft"><span>Frete</span><span>'+(si.free?"Grátis":si.sel?money(si.fee):"—")+'</span></div>':"")+'<div class="total"><span>Total</span><b>'+money(tot)+'</b></div>';
    var inf=$("#sinfo");
    if(inf)inf.textContent=!si.sel?"Escolha o bairro para calcular o frete (R$ "+String(FRETE.km).replace(".",",")+"0 por km)."
      :si.free?"Frete grátis: seu pedido tem "+c+" cookies (a partir de "+FRETE.free+")."
      :"Distância estimada: ~"+kmf(si.km)+" km. Faltam "+(FRETE.free-c)+" cookies para frete grátis.";
    var f=$("#fin");f.dataset.ok=si.ok?"1":"";f.classList.toggle("off",!si.ok);
    f.href=si.ok?"https://wa.me/"+PHONE+"?text="+buildMsg(sub,si,tot):"#carrinho";
    $("#fhint").textContent=si.ok?"O pedido é confirmado pelo WhatsApp. O horário é combinado por lá.":"Escolha o bairro e informe a rua e o número para finalizar.";
  }
  function renderCart(){
    var b=$("#badge"),c=count();b.textContent=c;b.hidden=!c;
    var ls=lines();
    if(!ls.length){$("#cart").innerHTML='<div class="panel"><p class="soft" style="margin:0 0 1rem">Seu carrinho está vazio. Que tal escolher um cookie?</p><a class="cta" href="#cardapio">Ver cardápio</a></div>';return}
    var rows=ls.map(function(l){return '<div class="line"><b>'+l.x.n+'<br><span class="soft" style="font-weight:400;font-size:.9rem">'+money(l.x.p)+'</span></b><div class="qty"><button data-q="-'+l.x.id+'" aria-label="Diminuir">−</button><span>'+l.q+'</span><button data-q="+'+l.x.id+'" aria-label="Aumentar">+</button></div></div>'}).join("");
    $("#cart").innerHTML='<div class="panel">'+rows+'<div class="ship"><b>Como você quer receber?</b><div class="seg" role="group"><button data-m="retirar" aria-pressed="'+(ship.mode==="retirar")+'">Retirar</button><button data-m="entrega" aria-pressed="'+(ship.mode==="entrega")+'">Entrega</button></div><div id="shipbody"></div></div><div id="sum" style="margin-top:1.2rem"></div><a class="cta" id="fin" target="_blank" rel="noopener">Finalizar pedido</a><p class="soft small" id="fhint" style="margin:.9rem 0 0"></p></div>';
    renderShip();updSum();
  }
  document.addEventListener("input",function(e){var i=e.target.id;if(i==="srua")ship.rua=e.target.value;else if(i==="sref")ship.ref=e.target.value;else return;updSum()});
  document.addEventListener("change",function(e){if(e.target.id==="sreg"){ship.reg=e.target.value;updSum()}});
  document.addEventListener("click",function(e){
    var m=e.target.closest("[data-m]"),f=e.target.closest("#fin");
    if(m){ship.mode=m.dataset.m;document.querySelectorAll("[data-m]").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===ship.mode)});renderShip();updSum()}
    if(f&&!f.dataset.ok){e.preventDefault();toast("Informe o endereço de entrega")}
  });
  document.addEventListener("click",function(e){
    var a=e.target.closest("[data-add]"),q=e.target.closest("[data-q]");
    if(a){var k=a.dataset.add;cart[k]=(cart[k]||0)+1;save();renderCart();toast("Adicionado ao carrinho")}
    if(q){var s=q.dataset.q,id=s.slice(1);cart[id]=Math.max(0,(cart[id]||0)+(s[0]==="+"?1:-1));if(!cart[id])delete cart[id];save();renderCart()}
  });

  // ---- avaliações e sugestões ----
  var DBX=null,UID=null,remote={rev:[],ide:[]},LOC={rev:[],ide:[]},rate=0,itype="Sabor novo",ifil="Todas",ITYPES=["Sabor novo","Doce","Outro"];
  try{LOC=Object.assign({rev:[],ide:[]},JSON.parse(localStorage.getItem("cc-av")||"{}"))}catch(e){}
  var saveLoc=function(){try{localStorage.setItem("cc-av",JSON.stringify(LOC))}catch(e){}};
  var fdate=function(d){try{return new Date(d).toLocaleDateString("pt-BR")}catch(e){return""}};
  function all(k){return remote[k].concat(LOC[k]).sort(function(a,b){return(b.d||0)-(a.d||0)})}
  function stars(n){n=Math.max(0,Math.min(5,parseInt(n)||0));return"★★★★★".slice(0,n)+"☆☆☆☆☆".slice(0,5-n)}
  function renderRev(){
    var L=all("rev"),n=L.length,avg=n?L.reduce(function(a,r){return a+(parseInt(r.s)||0)},0)/n:0;
    $("#rsum").innerHTML=n?'<div style="display:flex;align-items:center;gap:1rem"><span class="big">'+avg.toFixed(1).replace(".",",")+'</span><div><div class="rv" style="padding:0;border:0"><span class="st">'+stars(Math.round(avg))+'</span></div><span class="soft small">'+n+(n>1?" avaliações":" avaliação")+'</span></div></div>':'<p class="soft" style="margin:0">Ainda não há avaliações. Seja o primeiro a contar como foi!</p>';
    $("#rlist").innerHTML=n?L.map(function(r){return'<div class="rv"><h4>'+esc(r.n||"Cliente")+(r.local?'<span class="tag">só neste aparelho</span>':"")+'</h4><span class="st">'+stars(r.s)+'</span> <small>'+(r.f?esc(r.f)+" · ":"")+fdate(r.d)+'</small>'+(r.t?'<p>'+esc(r.t)+'</p>':"")+'</div>'}).join(""):"";
    $("#rlist").hidden=!n;
  }
  function renderIde(){
    var L=all("ide"),F=L.filter(function(i){return ifil==="Todas"||i.c===ifil});
    $("#ilist").innerHTML=F.length?F.map(function(i){return'<div class="rv"><h4>'+esc(i.n||"Cliente")+'<span class="tag">'+esc(i.c||"Outro")+'</span>'+(i.local?'<span class="tag">só neste aparelho</span>':"")+'</h4><p>'+esc(i.t)+'</p><small>'+fdate(i.d)+'</small></div>'}).join(""):'<p class="soft" style="margin:0">Nenhuma sugestão nesta categoria ainda.</p>';
    document.querySelectorAll("[data-if]").forEach(function(b){var k=b.dataset.if;b.setAttribute("aria-pressed",k===ifil);b.textContent=k+" ("+(k==="Todas"?L.length:L.filter(function(i){return i.c===k}).length)+")"});
  }
  function initAv(){
    $("#av-rev").innerHTML='<div class="panel" id="rsum"></div><div class="panel sub"><h3>Deixe sua avaliação</h3><label class="f">Seu nome<input class="in" id="rn" maxlength="30" placeholder="Como quer aparecer"></label><label class="f">Sabor que você provou<select class="in" id="rf"><option>Vários sabores</option>'+ITEMS.map(function(x){return'<option>'+x.n+'</option>'}).join("")+'</select></label><div class="f">Sua nota</div><div class="sbtn" id="rs">'+[1,2,3,4,5].map(function(i){return'<button data-s="'+i+'" aria-label="'+i+' estrelas">★</button>'}).join("")+'</div><label class="f">Comentário<textarea class="in" id="rt" rows="3" maxlength="400" placeholder="Conte como foi"></textarea></label><p class="small" id="rmsg" role="status" style="color:var(--butter);min-height:1.3em;margin:.6rem 0 0"></p><button class="cta" id="rsend">Publicar avaliação</button></div><div class="panel sub" id="rlist"></div>';
    $("#av-ide").innerHTML='<p class="lead" style="margin:0 0 .5rem">Quer ver um sabor ou doce novo por aqui? Conte para a gente.</p><div class="panel"><div class="f" style="margin:0">Tipo de sugestão</div><div class="seg" role="group">'+ITYPES.map(function(k){return'<button data-it="'+k+'" aria-pressed="'+(k===itype)+'">'+k+'</button>'}).join("")+'</div><label class="f" style="margin-top:0">Sua ideia<textarea class="in" id="it" rows="3" maxlength="400" placeholder="Ex.: cookie de pistache com chocolate branco"></textarea></label><label class="f">Seu nome (opcional)<input class="in" id="in" maxlength="30"></label><p class="small" id="imsg" role="status" style="color:var(--butter);min-height:1.3em;margin:.6rem 0 0"></p><button class="cta" id="isend">Enviar sugestão</button></div><div class="chips">'+["Todas"].concat(ITYPES).map(function(k){return'<button data-if="'+k+'" aria-pressed="'+(k===ifil)+'"></button>'}).join("")+'</div><div class="panel" id="ilist"></div>';
    renderRev();renderIde();
  }
  function persist(kind,o){
    function loc(){o.local=1;LOC[kind].push(o);saveLoc()}
    if(!(DBX&&UID)){loc();return Promise.resolve()}
    var p=kind==="rev"?DBX.doc("reviews/"+UID).set(o):DBX.doc("ideas/"+UID).set({items:remote.ide.filter(function(i){return i.u===UID}).concat([o])});
    return p.then(function(){},function(){loc()});
  }
  $("#p-avaliacoes").addEventListener("click",function(e){
    var t=e.target.closest("[data-t]"),s=e.target.closest("[data-s]"),it=e.target.closest("[data-it]"),fl=e.target.closest("[data-if]");
    if(t){document.querySelectorAll("[data-t]").forEach(function(b){b.setAttribute("aria-pressed",b===t)});$("#av-rev").hidden=t.dataset.t!=="rev";$("#av-ide").hidden=t.dataset.t!=="ide"}
    if(s){rate=+s.dataset.s;document.querySelectorAll("#rs button").forEach(function(b,i){b.classList.toggle("on",i<rate)})}
    if(it){itype=it.dataset.it;document.querySelectorAll("[data-it]").forEach(function(b){b.setAttribute("aria-pressed",b===it)})}
    if(fl){ifil=fl.dataset.if;renderIde()}
    if(e.target.closest("#rsend")){
      if(!rate){$("#rmsg").textContent="Escolha uma nota de 1 a 5 estrelas.";return}
      persist("rev",{n:$("#rn").value.trim().slice(0,30),s:rate,f:$("#rf").value,t:$("#rt").value.trim().slice(0,400),d:Date.now(),u:UID||""}).then(function(){
        $("#rmsg").textContent="Obrigado pela avaliação!";$("#rt").value="";rate=0;document.querySelectorAll("#rs button").forEach(function(b){b.classList.remove("on")});renderRev()});
    }
    if(e.target.closest("#isend")){
      var tx=$("#it").value.trim();if(tx.length<3){$("#imsg").textContent="Escreva sua ideia para enviar.";return}
      persist("ide",{n:$("#in").value.trim().slice(0,30),c:itype,t:tx.slice(0,400),d:Date.now(),u:UID||""}).then(function(){
        $("#imsg").textContent="Obrigado! Sua sugestão foi enviada.";$("#it").value="";renderIde()});
    }
  });
  initAv();
  try{
    if(window.claude&&claude.use)Promise.all([claude.use("db"),claude.use("user")]).then(function(r){
      DBX=r[0];if(!DBX)return;
      return(r[1]&&r[1].id?r[1].id():Promise.resolve(null)).then(function(id){
        UID=id;var no=function(){};
        DBX.collection("reviews").onSnapshot(function(s){remote.rev=s.docs.map(function(d){return d.data()||{}});renderRev()},no);
        DBX.collection("ideas").onSnapshot(function(s){remote.ide=[];s.docs.forEach(function(d){((d.data()||{}).items||[]).forEach(function(i){remote.ide.push(i)})});renderIde()},no);
      });
    }).catch(function(){});
  }catch(e){}

  // rotas e transições
  var cur=null;
  function show(r,after){
    var nav=$("#nav");nav.style.setProperty("--i",ROUTES.indexOf(r));
    nav.querySelectorAll("button").forEach(function(b){b.dataset.r===r?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current")});
    var next=$("#p-"+r);
    if(cur===r){after&&after();return}
    var old=cur&&$("#p-"+cur);cur=r;
    function swap(){
      if(old){old.hidden=true;old.classList.remove("leave")}
      next.hidden=false;next.classList.remove("enter");void next.offsetWidth;next.classList.add("enter");
      window.scrollTo(0,0);if(r==="carrinho")renderCart();if(r==="inicio")fit();upd();after&&after();
    }
    old?(old.classList.add("leave"),setTimeout(swap,220)):swap();
  }
  function route(){
    var h=(location.hash||"#inicio").slice(1);
    if(h==="cardapio"){show("inicio",function(){var h=$("#hero");window.scrollTo({top:h.offsetTop+h.offsetHeight-innerHeight*.15,behavior:"smooth"})});return}
    show(ROUTES.indexOf(h)>-1?h:"inicio");
  }
  $("#nav").addEventListener("click",function(e){var b=e.target.closest("button");if(b)location.hash=b.dataset.r});
  window.addEventListener("hashchange",route);

  // hero 3D guiado pelo scroll
  var hero=$("#hero"),words=$("#words"),intro=$("#intro"),cv=$("#gl"),tick=false;
  var cl=function(v){return Math.min(1,Math.max(0,v))},sm=function(t){return t*t*(3-2*t)};
  var AUTO={on:false,p:0},T={e1:0,e2:0},S={e1:0,e2:0},mx=0,my=0,R,cam,sc,piv,Z=8,VH=4.5,lw=0;
  function plastic(t1,t2,k){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{k:{value:k},t1:{value:t1},t2:{value:t2}},
    vertexShader:"varying vec3 n;varying vec3 v;varying vec2 pp;void main(){pp=position.xz;vec4 m=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=-m.xyz;gl_Position=projectionMatrix*m;}",
    fragmentShader:"uniform float k;uniform sampler2D t1,t2;varying vec3 n;varying vec3 v;varying vec2 pp;float H(vec2 p){return texture2D(t1,p/2.7+.5).r*.6+texture2D(t2,p/2.4+vec2(.45,.5)).r*.4;}void main(){vec2 p=pp;vec2 dd=abs(p)-vec2(1.11);if(length(max(dd,0.))-.16>0.)discard;float e=.02,h0=H(p),hx=H(p+vec2(e,0.))-H(p-vec2(e,0.)),hy=H(p+vec2(0.,e))-H(p-vec2(0.,e));float av=(H(p+vec2(.07,0.))+H(p-vec2(.07,0.))+H(p+vec2(0.,.07))+H(p-vec2(0.,.07)))*.25;float d=h0-av;vec3 N=normalize(n);if(!gl_FrontFacing)N=-N;N=normalize(N+vec3(hx,-hy,0.)*.7);vec3 V=normalize(v);float f=pow(1.-abs(dot(N,V)),2.2);vec3 A=normalize(vec3(.6,.9,.8)),B=normalize(vec3(-.8,.2,.6));float s=pow(max(dot(N,normalize(A+V)),0.),60.)+.5*pow(max(dot(N,normalize(B+V)),0.),35.);float cr=clamp(d*7.,0.,1.);float a=k*(.05+.2*f)+s*.45+cr*.06;gl_FragColor=vec4(mix(vec3(.88,.94,1.),vec3(1.),clamp(s+cr,0.,1.)),clamp(a,0.,1.));}"});}
  function init3d(){
    if(!window.THREE){var f=$("#fb");f.src=TEX;f.hidden=false;cv.hidden=true;return}
    try{R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true})}catch(e){var f2=$("#fb");f2.src=TEX;f2.hidden=false;cv.hidden=true;return}
    R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.outputEncoding=THREE.sRGBEncoding;R.setClearColor(0,0);
    sc=new THREE.Scene();cam=new THREE.PerspectiveCamera(32,1,.1,50);
    sc.add(new THREE.HemisphereLight(0xfff0e0,0x7a5a48,.95));
    var d1=new THREE.DirectionalLight(0xffffff,.9);d1.position.set(2,3,5);sc.add(d1);
    var d2=new THREE.DirectionalLight(0xffc999,.5);d2.position.set(-4,-1,2);sc.add(d2);
    var H=.17,RR=1,DM=.06,P=Math.PI,NS=96,i,a,x;
    var topY=function(x){return H+DM*((RR-H)*(RR-H)-x*x)/(RR*RR)};
    var kf=function(th){return 1+.025*Math.sin(3*th+1)+.018*Math.sin(5*th+2)};
    var ss=function(a,b,x){x=cl((x-a)/(b-a));return x*x*(3-2*x)};
    var prof=[];
    for(i=0;i<=8;i++)prof.push(new THREE.Vector2(i/8*(RR-H),-H));
    for(i=0;i<=14;i++){a=-P/2+i/14*P;prof.push(new THREE.Vector2(RR-H+H*Math.cos(a),H*Math.sin(a)))}
    for(i=0;i<=10;i++){x=(RR-H)*(1-i/10);prof.push(new THREE.Vector2(x,topY(x)))}
    var np=prof.length,body=new THREE.LatheGeometry(prof,NS),bp=body.attributes.position,bu=body.attributes.uv;
    for(i=0;i<bp.count;i++){var ci=Math.floor(i/np),pj=i%np,pu,pv;
      if(pj>=9&&pj<=23){pu=(512+(ci/NS)*1024)/1536;pv=1-((((pj-9)/14)*127)+.5)/512}
      else{pu=(.5+bp.getX(i)/2)/3;pv=.5-bp.getZ(i)/2}
      bu.setXY(i,pu,pv)}
    for(i=0;i<bp.count;i++){var k0=kf(Math.atan2(bp.getZ(i),bp.getX(i)));bp.setX(i,bp.getX(i)*k0);bp.setZ(i,bp.getZ(i)*k0)}
    body.computeVertexNormals();
    var TL=new THREE.TextureLoader(),ld=function(u,s){var x=TL.load(u);if(s)x.encoding=THREE.sRGBEncoding;x.anisotropy=8;return x};
    var atlas=ld(TEXB,1);atlas.generateMipmaps=false;atlas.minFilter=THREE.LinearFilter;
    var cookie=new THREE.Group();
    cookie.add(new THREE.Mesh(body,new THREE.MeshStandardMaterial({map:atlas,bumpMap:atlas,bumpScale:1.5,roughness:.95,side:THREE.DoubleSide})));
    var hp=function(x,z){var r=Math.hypot(x,z)/kf(Math.atan2(z,x)),q=Math.max(Math.abs(x),Math.abs(z)),c=0;
      if(r<RR-H)c=topY(r);else if(r<RR){var d=r-(RR-H);c=Math.sqrt(Math.max(0,H*H-d*d))}
      c+=.045;
      var h=c*(1-ss(.98,1.2,q))+.016*(1-ss(1.15,1.27,q));
      h+=.005*Math.sin(x*7+z*3)*Math.sin(z*6-x*2.5)+.003*Math.sin(x*19+z*15);
      h+=.007*(Math.abs(x)>Math.abs(z)?Math.sin(z*62):Math.sin(x*62))*ss(1.12,1.18,q)*(1-ss(1.24,1.27,q));
      return Math.max(h,.002)};
    var PS=1.27,mk=function(sg){var g=new THREE.PlaneGeometry(2*PS,2*PS,150,150);g.rotateX(-P/2);var p=g.attributes.position;for(var j=0;j<p.count;j++)p.setY(j,sg*hp(p.getX(j),p.getZ(j)));g.computeVertexNormals();return g};
    var pm=plastic(ld(PL1,0),ld(PL2,0),1),fs=new THREE.Mesh(mk(1),pm),bs=new THREE.Mesh(mk(-1),pm);
    fs.renderOrder=3;bs.renderOrder=3;
    var SR=.6,stg=new THREE.PlaneGeometry(2*SR,2*SR,48,48);stg.rotateX(-P/2);var sq=stg.attributes.position;
    for(i=0;i<sq.count;i++)sq.setY(i,hp(sq.getX(i),sq.getZ(i))+.006);
    stg.computeVertexNormals();
    var stk=new THREE.Mesh(stg,new THREE.MeshStandardMaterial({map:ld(STK,1),roughness:.4,transparent:true,alphaTest:.02}));stk.renderOrder=1;
    var obj=new THREE.Group();obj.rotation.x=P/2;obj.add(cookie,stk,fs,bs);
    piv=new THREE.Group();piv.add(obj);sc.add(piv);
    window.addEventListener("mousemove",function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
    (function frame(t){requestAnimationFrame(frame);if(cur!=="inicio")return;
      var w=cv.clientWidth,h=cv.clientHeight;
      if(w&&(w!==lw||h!==lh)){lw=w;lh=h;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();var tn=Math.tan(16*P/180);Z=Math.max(5.6/(2*tn),3.7/(w/h*2*tn));VH=2*Z*tn;cam.position.set(0,0,Z)}
      S.e1+=(T.e1-S.e1)*.22;S.e2+=(T.e2-S.e2)*.2;
      piv.rotation.y=(1-S.e1)*-.75+Math.sin(t/1400)*.05*(1-S.e1*.6)+mx*.12;
      piv.rotation.x=(1-S.e1)*.14+Math.cos(t/1700)*.03+my*.08;
      piv.position.y=S.e2*VH*.25+Math.sin(t/1000)*.03;
      var s=1-.42*S.e2;piv.scale.set(s,s,s);R.render(sc,cam)})(0);
  }
  var lh=0;
  function upd(){
    tick=false;if(cur!=="inicio")return;
    var r=hero.getBoundingClientRect(),p=AUTO.on?AUTO.p:cl(-r.top/(hero.offsetHeight-innerHeight));
    var e1=sm(cl(p/.08)),e2=sm(cl((p-.18)/.37)),e3=sm(cl((p-.5)/.3));
    T.e1=e1;T.e2=e2;
    words.style.opacity=1-e2;words.style.filter="blur("+(e2*14)+"px)";words.style.transform="scale("+(1+e2*.08)+")";
    intro.style.opacity=e3;intro.style.transform="translateY("+((1-e3)*18-6)+"svh)";
    intro.style.pointerEvents=e3>.6?"auto":"none";
  }
  window.addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
  window.addEventListener("resize",upd);
  // palavras no maior tamanho que cabe na tela
  function fit(){
    var st=$("#stage"),w=$(".w1"),vw=st.clientWidth,vh=st.clientHeight;if(!vw||!vh)return;
    st.style.setProperty("--S","100px");
    var ratio=w.offsetWidth/100,D=Math.min(.36*vh,.54*vw);
    var S=Math.floor(Math.min(.97*vw/ratio,(.92*vh-.76*D)/1.64));
    st.style.setProperty("--S",Math.max(S,40)+"px");
  }
  window.addEventListener("resize",fit);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  // apresentação automática: o cookie vira e a tela desce sozinha até o convite
  function autoplay(){
    var h0=location.hash.slice(1);if((h0&&h0!=="inicio")||window.scrollY>5)return;
    var y1=function(){return .9*(hero.offsetHeight-innerHeight)};
    var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
    var lock=function(e){e.preventDefault()},keys={32:1,33:1,34:1,35:1,36:1,38:1,40:1};
    var klock=function(e){if(keys[e.keyCode])e.preventDefault()};
    function end(){
      window.removeEventListener("wheel",lock);window.removeEventListener("touchmove",lock);window.removeEventListener("keydown",klock);
      if(cur==="inicio"){var el=document.documentElement,sb=el.style.scrollBehavior;el.style.scrollBehavior="auto";window.scrollTo(0,y1());el.style.scrollBehavior=sb;AUTO.p=.9}
      requestAnimationFrame(function(){requestAnimationFrame(function(){AUTO.on=false;upd()})});
    }
    AUTO.on=true;AUTO.p=0;upd();
    if(reduce){AUTO.p=.9;upd();end();return}
    window.addEventListener("wheel",lock,{passive:false});window.addEventListener("touchmove",lock,{passive:false});window.addEventListener("keydown",klock);
    setTimeout(function(){
      var t0=null,D=3000;
      function step(ts){
        if(cur!=="inicio"){end();return}
        if(t0===null)t0=ts;
        var u=Math.min(1,(ts-t0)/D),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
        AUTO.p=.9*e;upd();
        if(u<1)requestAnimationFrame(step);else end();
      }
      requestAnimationFrame(step);
    },700);
  }
  init3d();
  renderCart();route();autoplay();
})();
