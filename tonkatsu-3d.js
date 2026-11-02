
(() => {
  const host = document.getElementById("threeStage");
  const canvas = document.getElementById("threeCanvas");
  const loading = document.getElementById("threeLoading");
  const caption = document.getElementById("threeCaption");
  if (!host || !canvas) return;
  if (!window.THREE) {
    if (loading) loading.textContent = "3D表示にはインターネット接続が必要です。";
    return;
  }

  const T = window.THREE;
  const scene = new T.Scene();
  scene.background = new T.Color(0x28211d);
  scene.fog = new T.Fog(0x28211d, 15, 31);

  const camera = new T.PerspectiveCamera(34, 1, .1, 80);
  const homeCamera = new T.Vector3(8.7, 7.2, 10.5);
  camera.position.copy(homeCamera);
  camera.lookAt(0, 1.2, 0);

  const renderer = new T.WebGLRenderer({canvas, antialias:true, powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  scene.add(new T.HemisphereLight(0xffe8cc, 0x343039, 2.1));
  const keyLight = new T.DirectionalLight(0xffd9ad, 3.3);
  keyLight.position.set(-5, 11, 7); keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048,2048);
  keyLight.shadow.camera.left=-12; keyLight.shadow.camera.right=12;
  keyLight.shadow.camera.top=12; keyLight.shadow.camera.bottom=-12;
  scene.add(keyLight);
  const fillLight = new T.PointLight(0xffa85b, 30, 18);
  fillLight.position.set(5,5,-5); scene.add(fillLight);
  const coolLight = new T.PointLight(0x9bbce0, 18, 16);
  coolLight.position.set(-7,4,-4); scene.add(coolLight);

  const mat = (color, roughness=.65, metalness=0) =>
    new T.MeshStandardMaterial({color, roughness, metalness});
  const wood = mat(0x68442d,.78), darkWood=mat(0x3b2922,.78);
  const steel=mat(0x9ba3a7,.24,.86), darkSteel=mat(0x3e454a,.32,.8);
  const ceramic=mat(0xf1e8d7,.22), tile=mat(0x665b53,.82);
  const green=mat(0x3f7938,.88), cabbageMat=mat(0x79a84a,.78);

  function box(parent, name, size, pos, material, bevel=0) {
    const mesh=new T.Mesh(new T.BoxGeometry(...size),material);
    mesh.name=name; mesh.position.set(...pos); mesh.castShadow=true; mesh.receiveShadow=true;
    parent.add(mesh); return mesh;
  }
  function sphere(parent,name,r,pos,material,scale=[1,1,1],segments=24) {
    const mesh=new T.Mesh(new T.SphereGeometry(r,segments,Math.max(12,segments>>1)),material);
    mesh.name=name; mesh.position.set(...pos); mesh.scale.set(...scale);
    mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }
  function cylinder(parent,name,rTop,rBottom,h,pos,material,segments=32) {
    const mesh=new T.Mesh(new T.CylinderGeometry(rTop,rBottom,h,segments),material);
    mesh.name=name; mesh.position.set(...pos); mesh.castShadow=true; mesh.receiveShadow=true;
    parent.add(mesh); return mesh;
  }
  function group(parent,name,pos=[0,0,0]) {
    const g=new T.Group(); g.name=name; g.position.set(...pos); parent.add(g); return g;
  }

  // Room shell: warm tiled wall, floor, ceiling lamps and back shelves
  const room=group(scene,"restaurant kitchen");
  const floor=box(room,"stone floor",[26,.25,22],[0,-.2,0],mat(0x49413b,.9));
  for(let x=-12;x<=12;x+=2) for(let z=-9;z<=9;z+=2) {
    const grout=box(room,"floor tile seam",[.018,.006,19],[x,-.067,0],mat(0x5d544d,.95));
    const seam=box(room,"floor tile seam",[25,.006,.018],[0,-.066,z],mat(0x5d544d,.95));
  }
  box(room,"back wall",[26,8,.28],[0,3.8,-8.8],mat(0x54463e,.88));
  for(let x=-12;x<=12;x+=1.1) for(let y=.4;y<7.5;y+=1.1) {
    box(room,"wall tile", [1.04,1.04,.035],[x,y,-8.63],tile);
  }
  box(room,"hood",[8,.32,2],[0,7.2,-4.7],darkSteel);
  box(room,"hood lip",[8,.12,.18],[0,7.02,-3.72],steel);
  for(let x=-5;x<=5;x+=2.5) {
    const lamp= new T.Mesh(new T.CylinderGeometry(.12,.12,.1,20),mat(0xffe2a6,.25));
    lamp.position.set(x,6.75,-2.5); room.add(lamp);
    const light=new T.PointLight(0xffc77b,12,8); light.position.set(x,6.5,-2.5); room.add(light);
  }
  // Shelf with jars, plates and bottles
  box(room,"wall shelf",[10,.16,.9],[-5.2,5.1,-8.1],darkWood);
  box(room,"shelf edge",[10,.12,.1],[-5.2,5.0,-7.65],wood);
  for(let i=0;i<5;i++) {
    cylinder(room,"seasoning jar",.22,.22,.55,[-9.2+i*1.35,5.48,-8.1],ceramic,24);
    cylinder(room,"jar lid",.23,.23,.08,[-9.2+i*1.35,5.79,-8.1],darkWood,24);
  }
  for(let i=0;i<3;i++) {
    cylinder(room,"stacked plate",.55,.55,.07,[1.8+i*1.3,5.23,-8.1],ceramic,40);
  }

  // Central stainless preparation island and lower cabinets
  const island=group(room,"preparation island",[0,0,0]);
  box(island,"countertop",[10,.28,5.1],[0,1.18,0],steel);
  box(island,"counter front",[9.8,1.15,4.9],[0,.48,0],mat(0x55433a,.5));
  for(let x=-3.5;x<=3.5;x+=2.3) {
    box(island,"cabinet door",[1.9,.84,.08],[x,.46,2.48],darkWood);
    const knob=sphere(island,"cabinet handle",.055,[x+.65,.48,2.56],steel,[1,.7,.5],12);
  }
  box(island,"wood cutting board",[3.5,.16,2.1],[-2.5,1.4,.1],wood);
  box(island,"board groove",[3.3,.018,.025],[-2.5,1.49,1.0],darkWood);

  // Raw pork loin with realistic fat cap and marbling on cutting board
  const prep=group(scene,"preparation ingredients");
  const rawMeatMat=mat(0xb66c70,.58), fatMat=mat(0xf0d9c2,.52);
  const pork=sphere(prep,"raw pork loin",1,[-2.55,1.68,.05],rawMeatMat,[1.35,.23,.72],40);
  const fat=sphere(prep,"pork fat edge",1,[-2.58,1.84,-.57],fatMat,[1.2,.07,.13],32);
  for(let i=0;i<8;i++) {
    const m=sphere(prep,"pork marbling",.035,[-3.35+i*.22,1.88,-.22+(i%3)*.17],fatMat,[1.4,.55,.8],10);
  }
  const seasoning=group(prep,"salt and pepper shaker",[-4.05,1.85,.9]);
  cylinder(seasoning,"shaker glass",.14,.14,.48,[0,0,0],mat(0xd8d5c9,.25,.05),24);
  cylinder(seasoning,"metal cap",.15,.15,.1,[0,.28,0],steel,24);
  const flourBowl=cylinder(prep,"flour bowl",.66,.48,.3,[-.2,1.55,-1.45],ceramic,48);
  const flourTop=cylinder(prep,"flour",.52,.52,.035,[-.2,1.72,-1.45],mat(0xe6d9bb,.95),48);
  const eggBowl=cylinder(prep,"egg bowl",.66,.48,.3,[1.45,1.55,-1.45],ceramic,48);
  const eggTop=cylinder(prep,"beaten egg",.52,.52,.035,[1.45,1.72,-1.45],mat(0xe7a83e,.22),48);
  const pankoBowl=cylinder(prep,"panko bowl",.66,.48,.3,[3.1,1.55,-1.45],ceramic,48);
  const pankoTop=cylinder(prep,"panko crumbs",.52,.52,.035,[3.1,1.72,-1.45],mat(0xe0b66e,.95),48);
  // Panko flakes
  for(let i=0;i<90;i++) {
    const a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*.46;
    const flake=sphere(prep,"panko flake",.025,[3.1+Math.cos(a)*r,1.77, -1.45+Math.sin(a)*r],mat(0xf1d59c,.98),[1.8,.4,.65],8);
  }

  // Knife: blade, bolster and dark handle, posed on cutting board
  const knife=group(scene,"chef knife",[-1.5,1.7,1.05]);
  const blade=box(knife,"stainless chef knife blade",[1.25,.055,.3],[.15,.03,0],steel);
  blade.rotation.z=-.07;
  const handle=box(knife,"wooden knife handle",[.65,.13,.2],[-.78,.02,0],darkWood);
  handle.rotation.z=-.07;
  const bolster=box(knife,"knife bolster",[.1,.14,.24],[-.48,.02,0],darkSteel);

  // Cabbage head, outer leaves and fine shredded cabbage
  const cabbage=group(scene,"cabbage station",[3.4,1.6,.7]);
  const cabHead=sphere(cabbage,"whole cabbage",.82,[0,.2,0],cabbageMat,[1,.9,.88],40);
  for(let i=0;i<11;i++) {
    const a=i*Math.PI*2/11;
    const leaf=sphere(cabbage,"outer cabbage leaf",.58,[Math.cos(a)*.38,.12,Math.sin(a)*.38],green,[.5,.18,.8],20);
    leaf.rotation.y=-a;
  }
  const cabbageShreds=group(cabbage,"shredded cabbage",[-.1,-.5,0]);
  const shredMat=mat(0xa6c96b,.9);
  for(let i=0;i<75;i++) {
    const a=Math.random()*Math.PI*2, r=Math.random()*.72;
    const strip=box(cabbageShreds,"thin cabbage ribbon",[.035,.025,.35],[Math.cos(a)*r,Math.random()*.08,Math.sin(a)*r],shredMat);
    strip.rotation.y=Math.random()*Math.PI;
    strip.rotation.z=(Math.random()-.5)*.7;
  }
  cabbageShreds.visible=false;

  // Frying range and 3D pan with oil and tonkatsu
  const stove=group(scene,"frying station",[0,.62,-3.8]);
  box(stove,"gas range body",[5.8,.72,4.4],[0,.45,0],darkSteel);
  box(stove,"stove top",[5.9,.13,4.5],[0,.88,0],steel);
  for(let x of [-1.65,1.65]) for(let z of [-1.2,1.2]) {
    const burner=cylinder(stove,"gas burner",.62,.62,.12,[x,.98,z],darkSteel,40);
    const ring=new T.Mesh(new T.TorusGeometry(.47,.055,10,48),mat(0x222426,.35,.65));
    ring.rotation.x=Math.PI/2; ring.position.set(x,1.07,z); stove.add(ring);
  }
  const pan=group(stove,"frying pan",[0,1.12,-.1]);
  cylinder(pan,"pan body",2.0,1.86,.42,[0,0,0],darkSteel,72);
  const panRim=new T.Mesh(new T.TorusGeometry(1.96,.09,14,80),steel);
  panRim.rotation.x=Math.PI/2; panRim.position.y=.23; pan.add(panRim);
  const oilMat=new T.MeshPhysicalMaterial({color:0xc48a37,roughness:.16,metalness:.08,clearcoat:.8,transparent:true,opacity:.94});
  const oil=new T.Mesh(new T.CircleGeometry(1.83,80),oilMat);
  oil.rotation.x=-Math.PI/2; oil.position.y=.225; pan.add(oil);
  const panHandle=box(pan,"pan handle",[2.25,.16,.28],[2.95,.05,0],darkWood);
  panHandle.rotation.z=.03;
  const fried=group(pan,"tonkatsu in oil",[0,.42,0]);
  const crustMat=mat(0xc78e45,.9);
  const crust=sphere(fried,"golden panko crust",1, [0,0,0],crustMat,[1.2,.24,.73],48);
  for(let i=0;i<330;i++) {
    const a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random());
    const x=Math.cos(a)*r*1.16,z=Math.sin(a)*r*.69;
    sphere(fried,"crunchy panko crumb",.035,[x,.19,z],mat(i%4===0?0xe6bd78:0xd7a35a,.98),[1,.5,.85],8);
  }
  // steam and bubbles
  const bubbles=[];
  for(let i=0;i<34;i++) {
    const b=sphere(pan,"hot oil bubble",.045,[Math.sin(i*4.1)*1.45,.29+(i%4)*.09,Math.cos(i*3.2)*1.35],mat(0xffd78a,.12,.05),[1,1,1],12);
    bubbles.push({mesh:b,phase:i*.41});
  }

  // Finished dish, ceramic plate, sliced cutlet, rice and miso soup
  const serve=group(scene,"serving counter",[0,0,0]);
  const plate=group(serve,"tonkatsu set plate",[2.2,1.48,1.15]);
  cylinder(plate,"large white plate",1.6,1.48,.16,[0,0,0],ceramic,72);
  const plateWell=cylinder(plate,"plate center",1.34,1.34,.025,[0,.09,0],mat(0xf7f1e6,.28),72);
  const riceBowl=group(serve,"rice bowl",[-.5,1.45,1.3]);
  cylinder(riceBowl,"rice bowl",.62,.52,.48,[0,0,0],ceramic,48);
  sphere(riceBowl,"steamed rice",.49,[0,.2,0],mat(0xf8f3e7,.95),[1,.28,1],32);
  const soup=group(serve,"miso soup bowl",[-2.1,1.45,1.2]);
  cylinder(soup,"miso bowl",.56,.48,.42,[0,0,0],mat(0x3e3028,.24),48);
  cylinder(soup,"miso soup",.48,.48,.025,[0,.22,0],mat(0x9a6538,.25),48);
  const cutPieces=group(plate,"sliced pork cutlet",[0,.17,0]);
  for(let i=0;i<6;i++) {
    const slice=sphere(cutPieces,"cutlet slice",.5,[-.72+i*.29,.06,.1],crustMat,[.32,.13,.65],24);
    slice.rotation.y=-.08;
    const meatCore=sphere(cutPieces,"pork cross section",.35,[-.72+i*.29,.13,.1],mat(0xe6d5b8,.8),[.24,.04,.5],16);
  }
  const garnish=group(plate,"shredded cabbage garnish",[-.95,.12,-.7]);
  for(let i=0;i<55;i++) {
    const a=i*2.4,r=Math.sqrt(i/55)*.42;
    const strip=box(garnish,"cabbage strand",[.035,.025,.42],[Math.cos(a)*r,.08,Math.sin(a)*r],shredMat);
    strip.rotation.y=a;
  }
  const sauce=group(plate,"tonkatsu sauce", [.92,.13,.55]);
  sphere(sauce,"sauce dollop",.22,[0,0,0],mat(0x5a2c16,.22),[1,.08,.7],24);

  // Customer at counter: human-like 3D body, face, hair, apron, arms and plate.
  const customer=group(scene,"customer",[0,0,-5.8]);
  const skin=mat(0xd6a27e,.82), shirt=mat(0x47718a,.75), apron=mat(0x4b3430,.82), hair=mat(0x292321,.94);
  const torso=sphere(customer,"customer torso",1,[0,2.0,0],shirt,[.86,1.05,.48],36);
  const apronMesh=box(customer,"apron",[1.0,1.1,.12],[0,1.78,.44],apron);
  const neck=cylinder(customer,"neck",.2,.22,.35,[0,2.9,0],skin,20);
  const head=group(customer,"customer head",[0,3.55,.05]);
  sphere(head,"face",.66,[0,0,0],skin,[.86,1.05,.72],40);
  sphere(head,"hair cap",.66,[0,.35,-.08],hair,[.9,.55,.78],32);
  sphere(head,"left eye",.065,[-.22,.05,.59],mat(0x201b18,.3),[.8,1, .5],16);
  sphere(head,"right eye",.065,[.22,.05,.59],mat(0x201b18,.3),[.8,1, .5],16);
  const smile=new T.Mesh(new T.TorusGeometry(.16,.025,8,24,Math.PI),mat(0x743e37,.7));
  smile.position.set(0,-.2,.6); smile.rotation.z=Math.PI; head.add(smile);
  const leftArm=group(customer,"left arm",[-.85,2.55,0]);
  sphere(leftArm,"upper arm",.27,[0,-.38,0],shirt,[.9,1.8,.9],20).rotation.z=-.4;
  sphere(leftArm,"hand",.18,[.1,-.82,.12],skin,[1,.9,.8],20);
  const rightArm=group(customer,"right arm",[.85,2.55,0]);
  sphere(rightArm,"upper arm",.27,[0,-.38,0],shirt,[.9,1.8,.9],20).rotation.z=.4;
  const rightHand=sphere(rightArm,"hand",.18,[0,-.82,.12],skin,[1,.9,.8],20);
  const chair=group(customer,"chair",[0,0,-.75]);
  box(chair,"chair seat",[2,.18,1.1],[0,.85,0],darkWood);
  box(chair,"chair back",[2,2,.18],[0,2,-.52],darkWood);
  const customerPlate=group(customer,"customer meal",[0,1.25,1.45]);
  cylinder(customerPlate,"customer plate",1.05,.98,.12,[0,0,0],ceramic,48);
  sphere(customerPlate,"customer tonkatsu",.55,[0,.12,0],crustMat,[.85,.15,.5],32);

  // Decorative pass shelf and order ticket
  box(room,"pass shelf",[5,.16,1.2],[5.5,2.25,-3.4],wood);
  box(room,"order ticket",[.9,1.15,.08],[7.5,3.3,-8.35],mat(0xf0dfbd,.9));
  const ticketText=box(room,"ticket clip",[.5,.08,.1],[7.5,3.92,-8.25],steel);

  // Initial visibility: hide scene-specific elements as each stage changes.
  let activeStage=0, cutProgress=0, shredProgress=0, reaction=false;
  let yaw=0, dragging=false, lastX=0, targetCamera=new T.Vector3(8.7,7.2,10.5);
  const stageCaptions=[
    "下ごしらえ：豚ロースの厚みと脂身をチェック",
    "衣付け：小麦粉・卵・パン粉を順番につける",
    "揚げ工程：油温を管理して、きつね色に揚げる",
    "カット：包丁でサクッと均等に切り分ける",
    "千切り：キャベツを細く刻んでふんわり盛る",
    "提供：できたての定食をお客さんへ！"
  ];

  // A second stainless counter for the guest-facing pass.
  const pass=group(scene,"front counter",[0,0,0]);
  box(pass,"front counter top",[8,.22,3.2],[0,1.05,4.5],wood);
  box(pass,"front counter fascia",[8,.95,.16],[0,.55,6.05],darkWood);

  function updateStage(n) {
    activeStage=Math.max(0,Math.min(5,n));
    prep.visible=activeStage<=1;
    stove.visible=activeStage===2;
    knife.visible=activeStage===3;
    cabbage.visible=activeStage===4;
    serve.visible=activeStage===5;
    customer.visible=activeStage===5;
    pass.visible=activeStage===5;
    if(activeStage===0) { pork.visible=true; fat.visible=true; }
    if(activeStage===1) { pork.visible=true; }
    if(activeStage===2) { fried.visible=true; }
    cutProgress=0; shredProgress=0; reaction=false;
    head.rotation.set(0,0,0);
    leftArm.rotation.set(0,0,0); rightArm.rotation.set(0,0,0);
    camera.position.copy(homeCamera);
    yaw=0;
    if(activeStage===0) targetCamera.set(-2.8,5.2,6.3);
    if(activeStage===1) targetCamera.set(0,5.7,6.2);
    if(activeStage===2) targetCamera.set(0,5.2,5.5);
    if(activeStage===3) targetCamera.set(-1.6,4.8,5.2);
    if(activeStage===4) targetCamera.set(3.2,4.8,5.3);
    if(activeStage===5) targetCamera.set(1.3,5.7,7.2);
    if(caption) caption.textContent=stageCaptions[activeStage];
  }

  function setCooking(s) {
    const b=Math.max(0,Math.min(1,s.brown||0)), burn=Math.max(0,Math.min(1,s.burn||0));
    const oily=Math.max(0,Math.min(1,s.oily||0)), t=s.temp||170;
    crustMat.color.set(0xc78e45).lerp(new T.Color(0x8d4b20),b*.8).lerp(new T.Color(0x342019),burn*.9);
    oilMat.color.set(t<155?0x927044:t>185?0x9a5425:0xc48a37);
    oilMat.roughness=.16+oily*.34;
    bubbles.forEach(bub=>bub.mesh.visible=t>135);
  }
  function doCut() {
    cutProgress=Math.min(5,cutProgress+1);
    const piece= new T.Mesh(new T.BoxGeometry(.025,.34,1.2),mat(0x49301e,.9));
    piece.position.set(-1.25+cutProgress*.42,1.95,1.08);
    piece.rotation.z=-.08; scene.add(piece);
    knife.rotation.z=-.4; setTimeout(()=>knife.rotation.z=0,160);
  }
  function doShred() {
    shredProgress++;
    const n=6;
    for(let i=0;i<n;i++) {
      const strip=box(cabbageShreds,"fresh cabbage shred",[.035,.02,.42],[Math.random()-.5,-.35,Math.random()-.5],shredMat);
      strip.rotation.y=Math.random()*Math.PI;
    }
    cabbageShreds.visible=true;
    cabHead.scale.multiplyScalar(.985);
  }
  function eat() {
    reaction=true;
    head.rotation.x=-.16;
    rightArm.rotation.x=-1.2;
    rightArm.rotation.z=-.25;
    torso.position.y=2.03;
  }

  // Pointer drag rotates the whole kitchen view.
  canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener("pointerup",()=>dragging=false);
  canvas.addEventListener("pointercancel",()=>dragging=false);
  canvas.addEventListener("pointermove",e=>{
    if(!dragging)return;
    yaw+=(e.clientX-lastX)*.006; lastX=e.clientX;
    camera.position.x=targetCamera.x+Math.sin(yaw)*2.0;
    camera.position.z=targetCamera.z+Math.cos(yaw)*2.0;
    camera.lookAt(0,1.6,0);
  });

  function resize() {
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  const observer=new ResizeObserver(resize); observer.observe(host); resize();
  updateStage(0);
  if(loading) setTimeout(()=>loading.classList.add("is-hidden"),1200);

  const clock=new T.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    oil.position.y=.225+Math.sin(t*1.7)*.008;
    bubbles.forEach((b,i)=>{
      b.mesh.position.y=.29+((t*.45+b.phase)%0.6);
      b.mesh.scale.setScalar(.75+Math.sin(t*3+i)*.22);
    });
    fried.rotation.y=Math.sin(t*.65)*.08;
    if(activeStage===5) {
      torso.position.y=2+Math.sin(t*1.8)*.025;
      if(reaction) {
        head.rotation.x=-.16+Math.sin(t*5)*.035;
        rightArm.rotation.x=-1.2+Math.sin(t*5)*.06;
      } else {
        head.rotation.x=Math.sin(t*1.2)*.025;
      }
    }
    camera.lookAt(0,1.55,0);
    renderer.render(scene,camera);
  }
  animate();

  window.Tonkatsu3D={
    setStage:updateStage,
    reset(){updateStage(0);setCooking({brown:0,burn:0,oily:0,temp:170});},
    rotate(deg){yaw+=deg*Math.PI/180;camera.position.x=targetCamera.x+Math.sin(yaw)*2;camera.position.z=targetCamera.z+Math.cos(yaw)*2;},
    flip(){fried.rotation.z+=Math.PI;},
    setCooking,
    cut:doCut,
    shred:doShred,
    customerReaction:eat
  };
})();
