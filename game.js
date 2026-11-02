const $=id=>document.getElementById(id);
const names={pork:"豚ロース",salt:"塩こしょう",flour:"小麦粉",egg:"溶き卵",panko:"パン粉"};
const stepsTips=["豚肉の表面の水分をふき取り、塩こしょうで下味をつけよう。","小麦粉→卵→パン粉の順番。パン粉はふんわりつけるとサクサクに。","低温では油を吸いやすく、高温では衣が先に焦げるよ。中心温度も確認しよう。","包丁をまっすぐ入れて、食べやすい幅に切ろう。","細く刻むほど口当たりが軽くなるよ。","お客さんに提供して、反応を見てみよう！"];
let stage=0,score=0,used=[],frying=false,elapsed=0,coreTemp=5,temp=170,loop=null,rot=0,flipped=false,cut=0,shreds=0,served=false,brown=0,oily=0,burn=0,cutletPlaced=false;
function feedback(t){$("feedback").textContent=t}
function quality(){let q=Math.min(100,Math.round(score/1.25));$("quality").textContent=q+"%";$("qualityBar").style.width=q+"%";$("score").textContent=score}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1400)}
function stageSet(){
 if(window.Tonkatsu3D)window.Tonkatsu3D.setStage(stage);
 $("stageNum").textContent=`${stage+1} / 6`;$("step").textContent=`STEP 0${stage+1}`;$("stageTitle").textContent=["下ごしらえ","衣をつける","油で揚げる","カットする","千切りキャベツ","提供する"][stage];$("progress").style.width=((stage+1)/6*100)+"%";
 $("stationName").textContent=["PREPARATION","BREADING","FRYING","CUTTING","CABBAGE","SERVING"][stage];$("stationHint").textContent=["食材をトレーへ","衣を順番につける","油温と中心温度を管理","包丁で5回カット","キャベツを8回刻む","お客さんに提供"][stage];
 ["prepView","fryView","cutView","cabbageView","serveView"].forEach((id,i)=>$(id).classList.toggle("hidden",!((stage<2&&i===0)||(stage===2&&i===1)||(stage===3&&i===2)||(stage===4&&i===3)||(stage===5&&i===4))));
 [...$("stepList").children].forEach((li,i)=>li.className=i<stage?"done":i===stage?"active":"");
 $("tip").textContent=stepsTips[stage];$("next").disabled=true;$("next").textContent=stage===5?"もう一度プレイ":"次の工程へ →";
 if(stage===0)prep(["pork","salt"],"豚ロースと塩こしょうを入れよう。");
 if(stage===1)prep(["flour","egg","panko"],"小麦粉 → 卵 → パン粉の順にドロップ！");
 if(stage===2)initFry();
 if(stage===3)initCut();
 if(stage===4)initCabbage();
 if(stage===5)initServe();
}
function prep(ids,msg){
 used=[];$("ingredientRack").innerHTML="";
 ids.forEach(id=>{let b=document.createElement("button");b.className="ingredient";b.draggable=true;b.dataset.id=id;b.innerHTML=`<span>${({pork:"🥩",salt:"🧂",flour:"🌾",egg:"🥚",panko:"🍞"})[id]}</span><b>${names[id]}</b><small>${id==="pork"?"厚切り 150g":"ドラッグして使う"}</small>`;b.addEventListener("dragstart",e=>e.dataTransfer.setData("text/plain",id));b.addEventListener("click",()=>apply(id,b));$("ingredientRack").appendChild(b)});
 $("trayItems").innerHTML="";$("trayTitle").textContent=stage===0?"下ごしらえトレー":"衣付けトレー";$("trayText").textContent=msg;
}
const tray=$("dropTray");tray.addEventListener("dragover",e=>{e.preventDefault();tray.classList.add("over")});tray.addEventListener("dragleave",()=>tray.classList.remove("over"));tray.addEventListener("drop",e=>{e.preventDefault();tray.classList.remove("over");let id=e.dataTransfer.getData("text/plain"),b=[...$("ingredientRack").children].find(x=>x.dataset.id===id);if(b)apply(id,b)});
function apply(id,b){
 let required=stage===0?["pork","salt"]:["flour","egg","panko"];
 if(used.includes(id))return;if(id!==required[used.length]){feedback("順番が違うよ！ "+names[required[used.length]]+" を先に使おう。");toast("順番を確認！");return}
 used.push(id);b.classList.add("used");let chip=document.createElement("span");chip.textContent="✓ "+names[id];$("trayItems").appendChild(chip);score+=stage===0?12:10;quality();
 if(used.length===required.length){$("next").disabled=false;feedback("工程クリア！丁寧にできたね。");toast("成功！")}else feedback(names[id]+" OK！次の食材を使おう。");
}
function initFry(){clearInterval(loop);frying=false;elapsed=0;coreTemp=5;temp=170;brown=0;oily=0;burn=0;rot=0;flipped=false;cutletPlaced=false;
 if(window.Tonkatsu3D){window.Tonkatsu3D.reset();}$("cutlet").classList.remove("in-oil");$("panGuide").classList.remove("gone");$("dragCutlet").classList.remove("placed");$("dragCutlet").draggable=true;$("flipCutlet").disabled=true;$("fryToggle").disabled=true;$("frySteps").children[0].className="active";[1,2,3].forEach(i=>$("frySteps").children[i].className="");$("temp").value=170;$("tempLabel").textContent="170℃";$("time").textContent="0.0秒";$("core").textContent="5℃";$("doneness").textContent="生";$("coreBar").style.width="0%";$("oilWarning").textContent="170℃前後をキープして揚げよう。";$("oilWarning").className="oil-warning";$("fryToggle").textContent="🔥 揚げ始める";$("cutlet").classList.remove("flipped");$("cutlet").style.background="linear-gradient(145deg,#f0d69e,#bd9254)";$("surfaceState").textContent="衣：きつね色前";$("oilState").textContent="油：適温";$("bubbles").innerHTML="";$("next").disabled=true}
$("temp").addEventListener("input",e=>{temp=+e.target.value;$("tempLabel").textContent=temp+"℃"});
function makeBubbles(){for(let i=0;i<4;i++){let b=document.createElement("i");b.className="bubble";b.style.setProperty("--x",Math.random()*90+"%");b.style.setProperty("--y",Math.random()*85+"%");b.style.setProperty("--s",(3+Math.random()*10)+"px");b.style.setProperty("--d",(.6+Math.random()*1.2)+"s");$("bubbles").appendChild(b);setTimeout(()=>b.remove(),1900)}}
function fryTick(){
 elapsed+=.2;
 // Simulated core heating: warmer oil heats the center faster, with a capped food-safe display.
 let rate=.17+Math.max(0,temp-140)*.006;
 coreTemp=Math.min(100,coreTemp+rate*1.8);
 brown=Math.min(1,brown+Math.max(0,temp-145)*.00009);
 if(temp<155)oily=Math.min(1,oily+.012);else oily=Math.max(0,oily-.002);
 if(temp>185)burn=Math.min(1,burn+(temp-185)*.0008);
 let base=[239,211,157],r=Math.round(base[0]-brown*85-burn*65),g=Math.round(base[1]-brown*120-burn*115),bl=Math.round(base[2]-brown*105-burn*115);
 $("cutlet").style.background=`linear-gradient(145deg,rgb(${Math.max(40,r+18)},${Math.max(25,g+18)},${Math.max(15,bl+12)}),rgb(${Math.max(35,r)},${Math.max(20,g)},${Math.max(10,bl)}))`;
 $("cutlet").style.filter=`saturate(${1+brown*.4})`;
 if(window.Tonkatsu3D){window.Tonkatsu3D.setCooking({brown, burn, oily, temp, elapsed});}
 $("time").textContent=elapsed.toFixed(1)+"秒";$("core").textContent=Math.round(coreTemp)+"℃";$("coreBar").style.width=coreTemp+"%";
 $("doneness").textContent=coreTemp<45?"生":coreTemp<63?"加熱中":coreTemp<70?"ほぼ火が通った":"十分加熱";
 let bubbleCount=Math.max(.15,Math.min(1,(temp-130)/80));if(Math.random()<bubbleCount)makeBubbles();
 $("oilState").textContent=temp<155?"油：低温":temp>185?"油：高温":"油：適温";
 $("surfaceState").textContent=burn>.15?"衣：焦げ始め":oily>.15?"衣：油っぽい":brown<.3?"衣：きつね色前":brown<.7?"衣：こんがり":"衣：濃いきつね色";
 if(temp<155){$("oilWarning").textContent="⚠ 低温！衣が油を吸ってベタつきやすい状態。温度を上げよう。";$("oilWarning").className="oil-warning warn"}
 else if(temp>185){$("oilWarning").textContent="⚠ 高温！衣が焦げやすい。温度を下げよう！";$("oilWarning").className="oil-warning warn"}
 else{$("oilWarning").textContent="いい温度！中心までじっくり火を通そう。";$("oilWarning").className="oil-warning"}
 if(coreTemp>=72){stopFry();$("frySteps").children[2].className="done";$("frySteps").children[3].className="done";feedback("中心温度が十分に上がったよ。焼き色と衣の状態を確認しよう。");}
}
function stopFry(){frying=false;clearInterval(loop);$("fryToggle").textContent="▶ 揚げ再開";if(cutletPlaced&&coreTemp>=63&&elapsed>=10)$("next").disabled=false}
function placeCutlet(){
 if(cutletPlaced)return;
 cutletPlaced=true;$("cutlet").classList.add("in-oil");$("panGuide").classList.add("gone");
 $("dragCutlet").classList.add("placed");$("dragCutlet").draggable=false;
 $("fryToggle").disabled=false;$("flipCutlet").disabled=false;
 $("frySteps").children[0].className="done";$("frySteps").children[1].className="active";
 feedback("ジュワッ！とんかつを油に入れたよ。揚げ始めよう。");toast("油に投入！");
}
$("dragCutlet").addEventListener("dragstart",e=>{if(!cutletPlaced)e.dataTransfer.setData("text/plain","tonkatsu")});
$("fryDropZone").addEventListener("dragover",e=>{if(!cutletPlaced){e.preventDefault();$("fryDropZone").classList.add("pan-over")}});
$("fryDropZone").addEventListener("dragleave",()=>$("fryDropZone").classList.remove("pan-over"));
$("fryDropZone").addEventListener("drop",e=>{e.preventDefault();$("fryDropZone").classList.remove("pan-over");if(e.dataTransfer.getData("text/plain")==="tonkatsu")placeCutlet()});
$("dragCutlet").addEventListener("click",placeCutlet);
$("fryDropZone").addEventListener("click",()=>{if(!cutletPlaced)placeCutlet()});
$("fryToggle").addEventListener("click",()=>{if(!cutletPlaced){feedback("まず衣付きとんかつをフライパンへ入れよう。");return}if(!frying){frying=true;$("fryToggle").textContent="⏸ 一時停止";loop=setInterval(fryTick,200);feedback("揚げ始めたよ！温度と中心温度を観察しよう。")}else stopFry()});
$("stopFry").addEventListener("click",()=>{if(frying)stopFry();if(cutletPlaced&&coreTemp>=63&&elapsed>=10){$("next").disabled=false;feedback("揚げ具合を確認。次の工程へ進めるよ。")}else feedback("まだ中心まで火が通っていないよ。もう少し揚げよう。")});
function rotate(deg){rot+=deg;$("cutlet").style.transform=`rotate(${rot}deg) rotateX(4deg)`;$("cutlet").style.filter="drop-shadow(0 5px 4px #25170b66)";if(window.Tonkatsu3D)window.Tonkatsu3D.rotate(deg)}
$("rotateLeft").onclick=()=>rotate(-25);$("rotateRight").onclick=()=>rotate(25);
$("flipCutlet").onclick=()=>{if(!cutletPlaced)return;flipped=!flipped;$("frySteps").children[1].className="done";$("frySteps").children[2].className="active";$("cutlet").classList.toggle("flipped",flipped);if(window.Tonkatsu3D)window.Tonkatsu3D.flip();score+=4;quality();toast(flipped?"裏返した！":"表面に戻したよ");};
function initCut(){cut=0;$("cutCount").textContent="0";$("cutLines").innerHTML="";$("knife").classList.remove("swipe");$("next").disabled=true}
function doCut(){if(cut>=5)return;cut++;if(window.Tonkatsu3D)window.Tonkatsu3D.cut();$("knife").classList.add("swipe");setTimeout(()=>$("knife").classList.remove("swipe"),180);let line=document.createElement("i");line.className="cut-line";line.style.left=(cut*16)+"%";$("cutLines").appendChild(line);$("cutCount").textContent=cut;score+=4;quality();feedback(`カット ${cut}/5！均等な幅で切れているよ。`);if(cut===5){$("next").disabled=false;feedback("きれいにカットできた！次はキャベツを刻もう。");toast("カット完了！")}}
$("cutButton").onclick=doCut;$("wholeCutlet").onclick=doCut;
function initCabbage(){shreds=0;$("shredCount").textContent="0";$("shreds").innerHTML="";$("cabbageHead").classList.remove("chopped");$("next").disabled=true}
$("shredButton").onclick=()=>{if(shreds>=8)return;shreds++;if(window.Tonkatsu3D)window.Tonkatsu3D.shred();$("shredCount").textContent=shreds;$("cabbageKnife").classList.add("swipe");setTimeout(()=>$("cabbageKnife").classList.remove("swipe"),130);for(let i=0;i<3;i++){let s=document.createElement("i");s.className="shred";s.style.setProperty("--r",(Math.random()*60-30)+"deg");$("shreds").appendChild(s)}score+=3;quality();if(shreds>=8){$("cabbageHead").classList.add("chopped");$("next").disabled=false;feedback("シャキシャキの千切りキャベツが完成！");toast("千切り完了！")}else feedback("トントン！千切り "+shreds+"/8 回")}
function initServe(){served=false;$("customerFace").textContent="😋";$("customerTitle").textContent="お客さんが待っています";$("customerText").textContent="できたての定食を提供しよう！";$("stars").textContent="☆☆☆☆☆";$("serveButton").disabled=false;$("next").disabled=true}
$("serveButton").onclick=()=>{if(served)return;served=true;let qualityScore=Math.min(100,Math.round(score/1.25));let reaction=qualityScore>=85?["🤩","最高！衣はサクサク、お肉はジューシー！","★★★★★"]:qualityScore>=65?["😋","おいしい！また食べに来たいな。","★★★★☆"]:qualityScore>=45?["🙂","おいしかったよ。次はもっと上を目指そう！","★★★☆☆"]:["🤔","少し惜しいところも。修行を続けよう。","★★☆☆☆"];$("customerFace").textContent=reaction[0];if(window.Tonkatsu3D)window.Tonkatsu3D.customerReaction();$("customerTitle").textContent="お客さんのリアクション";$("customerText").textContent=reaction[1];$("stars").textContent=reaction[2];$("serveButton").textContent="提供済み ✓";$("serveButton").disabled=true;$("next").disabled=false;feedback("提供完了！お客さんの反応をチェックしよう。");toast("ご注文ありがとうございました！")}
function reset(){clearInterval(loop);stage=0;score=0;used=[];frying=false;quality();stageSet();feedback("豚ロースをトレーに移動しよう。")}
$("next").onclick=()=>{if(stage<5){stage++;stageSet()}else{reset();toast("次のお客さんが来店しました！")}};
$("reset").onclick=()=>{reset();toast("最初からやり直します")};
stageSet();quality();