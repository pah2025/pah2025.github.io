/**********************************************
 * Polished Interactive PAH Demo 
 * 
 * - Shows a more refined layout, improved styling
 * - Animates prototypes, forward pass lines, 
 *   hypernetwork weight lines, and red gradient lines
 * - Places Lhm, Lsm, Lsp circles with hover effects
 **********************************************/

const width = 1100, height = 700;
const svg = d3.select("#pahViz")
  .attr("viewBox", [0, 0, width, height]);

/******** 1) Define Gradients ********/
const defs = svg.append("defs");

// BACKBONE gradient
const bbGrad = defs.append("linearGradient")
  .attr("id","backboneGradient")
  .attr("x1","0%").attr("y1","0%")
  .attr("x2","100%").attr("y2","0%");
bbGrad.append("stop").attr("offset","0%").attr("stop-color","#b3e5fc");
bbGrad.append("stop").attr("offset","100%").attr("stop-color","#81d4fa");

// HYPER gradient
const hpGrad = defs.append("linearGradient")
  .attr("id","hyperGradient")
  .attr("x1","0%").attr("y1","0%")
  .attr("x2","100%").attr("y2","0%");
hpGrad.append("stop").attr("offset","0%").attr("stop-color","#c8e6c9");
hpGrad.append("stop").attr("offset","100%").attr("stop-color","#a5d6a7");

// HEAD gradient
const thGrad = defs.append("linearGradient")
  .attr("id","headGradient")
  .attr("x1","0%").attr("y1","0%")
  .attr("x2","100%").attr("y2","0%");
thGrad.append("stop").attr("offset","0%").attr("stop-color","#e1bee7");
thGrad.append("stop").attr("offset","100%").attr("stop-color","#ce93d8");

// ARROW markers
defs.append("marker")
  .attr("id","markerFwd")
  .attr("markerWidth",10).attr("markerHeight",10)
  .attr("refX",10).attr("refY",0)
  .attr("orient","auto")
  .append("path")
    .attr("d","M0,-5L10,0L0,5")
    .attr("fill","#444");
defs.append("marker")
  .attr("id","markerGreen")
  .attr("markerWidth",10).attr("markerHeight",10)
  .attr("refX",10).attr("refY",0)
  .attr("orient","auto")
  .append("path")
    .attr("d","M0,-5L10,0L0,5")
    .attr("fill","#4caf50");
defs.append("marker")
  .attr("id","markerRed")
  .attr("markerWidth",10).attr("markerHeight",10)
  .attr("refX",10).attr("refY",0)
  .attr("orient","auto")
  .append("path")
    .attr("d","M0,-5L10,0L0,5")
    .attr("fill","#f44336");

/******** 2) Layout Positions ********/
const backbone = { x: 420, y: 360, w: 200, h: 100 };
const hyper = {    x: 470, y: 190, w: 130, h: 60 };
const head = {     x: 830, y: 320, w: 130, h: 80 };
const embed = {    x: 180, y: 140, w: 110, h: 50 };

let prototypes = [];
let currentTask = 0;

const edgesG = svg.append("g");
const protoG = svg.append("g");
const lossG = svg.append("g");

/******** 3) Draw main boxes ********/
function drawBox(box, className, label) {
  svg.append("rect")
    .attr("class", `compBox ${className}`)
    .attr("x", box.x).attr("y", box.y)
    .attr("width", box.w).attr("height", box.h);

  svg.append("text")
    .attr("class","compLabel")
    .attr("x", box.x + box.w*0.5)
    .attr("y", box.y + box.h*0.5 + 5)
    .attr("text-anchor","middle")
    .text(label);
}
drawBox(embed,   "",            "Task Emb\n e");
drawBox(hyper,   "hyperGrad",   "HyperNet");
drawBox(backbone,"backboneGrad","Backbone");
drawBox(head,    "headGrad",    "Task Head");

/******** 4) Task data (CIFAR) ********/
const tasksData = [
  [
    { label:"T1-Dog",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/dog4.png" },
    { label:"T1-Cat",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/cat1.png" }
  ],
  [
    { label:"T2-Deer", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/deer4.png" },
    { label:"T2-Bird", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/bird4.png" }
  ],
  [
    { label:"T3-Frog", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/frog2.png" },
    { label:"T3-Car",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/automobile1.png" }
  ],
  [
    { label:"T4-Plane",img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/airplane4.png" },
    { label:"T4-Ship", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/ship2.png" }
  ]
];

/******** 5) random positions & augment ********/
function randomPos(tIndex) {
  const baseX = 60 + tIndex*50;
  const x = baseX + (Math.random()-0.5)*20;
  const y = 40 + Math.random()*60;
  return [x,y];
}
function augment(proto) {
  proto.x += (Math.random()-0.5)*12;
  proto.y += (Math.random()-0.5)*12;
  const br = (0.8 + 0.4*Math.random()).toFixed(2);
  const hr = Math.floor(Math.random()*40);
  proto.filterStr = `brightness(${br}) hue-rotate(${hr}deg)`;
}

/******** 6) render function ********/
function render() {
  // PROTOTYPES
  const sel = protoG.selectAll("image.protoImage").data(prototypes, d=> d.id);

  const ent = sel.enter().append("svg:image")
    .attr("class","protoImage")
    .attr("xlink:href", d => d.img)
    .attr("width", 45).attr("height",45)
    .attr("opacity",0)
    .on("click",(evt,d)=>{
      d3.select("#infoBox").text(`Prototype: ${d.label} → Flatten → HyperNet → Task Head. `);
    });
  ent.attr("x", d=> d.x).attr("y", d=> d.y)
    .transition().duration(800)
      .attr("opacity",1);

  sel.transition().duration(800)
    .attr("x", d=> d.x)
    .attr("y", d=> d.y)
    .style("filter", d=> d.filterStr);

  sel.exit().transition().duration(600)
    .attr("opacity",0)
    .remove();

  // EDGES
  const edges = [];
  // Forward pass: each proto -> embed
  prototypes.forEach(p=>{
    edges.push({
      id:p.id+"_fwdPE",
      cls:"fwdArrow",
      x1:p.x+22, y1:p.y+22,
      x2:embed.x, y2:embed.y+embed.h/2
    });
  });
  // embed->backbone
  edges.push({
    id:"emb2bb",
    cls:"fwdArrow",
    x1: embed.x+embed.w,   y1: embed.y+embed.h/2,
    x2: backbone.x,        y2: backbone.y+backbone.h/2
  });
  // backbone->head
  edges.push({
    id:"bb2head",
    cls:"fwdArrow",
    x1: backbone.x+backbone.w, 
    y1: backbone.y+backbone.h/2,
    x2: head.x, 
    y2: head.y+head.h/2
  });
  // Weight generation: embed->hyper, hyper->head
  edges.push({
    id:"emb2hyper",
    cls:"weightArrow",
    x1: embed.x+embed.w/2,
    y1: embed.y,
    x2: hyper.x+hyper.w/2,
    y2: hyper.y+hyper.h
  });
  edges.push({
    id:"hyper2head",
    cls:"weightArrow",
    x1: hyper.x+hyper.w, 
    y1: hyper.y+hyper.h/2,
    x2: head.x+(head.w*0.1), 
    y2: head.y
  });
  // Grad arrows: Lhm, Lsm, Lsp
  edges.push({
    id:"LhmLine",
    cls:"gradArrow solidGrad",
    x1: backbone.x + backbone.w*0.5, y1: backbone.y+backbone.h+12,
    x2: head.x + head.w*0.3,         y2: head.y + head.h+20
  });
  edges.push({
    id:"LsmLine",
    cls:"gradArrow solidGrad",
    x1: head.x+head.w+60, y1: head.y+head.h*0.5,
    x2: head.x+head.w+110,y2: head.y+head.h*0.5
  });
  edges.push({
    id:"LspLine",
    cls:"gradArrow dashedGrad",
    x1: embed.x-20, y1: embed.y-10,
    x2: prototypes.length? prototypes[0].x : embed.x,
    y2: prototypes.length? prototypes[0].y : embed.y
  });

  const eSel = edgesG.selectAll("line.archEdge").data(edges, d=> d.id);
  const eEnt = eSel.enter().append("line")
    .attr("class","archEdge")
    .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
    .attr("x2", d=> d.x1).attr("y2", d=> d.y1)
    .attr("opacity",0);
  eEnt.transition().duration(1000)
    .attr("opacity",1)
    .attr("class", d=> `archEdge ${d.cls}`)
    .attr("x2", d=> d.x2).attr("y2", d=> d.y2);

  eSel.transition().duration(1000)
    .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
    .attr("x2", d=> d.x2).attr("y2", d=> d.y2)
    .attr("class", d=> `archEdge ${d.cls}`)
    .attr("opacity",1);

  eSel.exit().remove();

  // LOSS CIRCLES
  const losses = [
    { id:"Lhm", x: backbone.x+backbone.w*0.5, y: backbone.y+backbone.h+25, text:"Lhm" },
    { id:"Lsm", x: head.x+head.w+90,          y: head.y+head.h*0.5,        text:"Lsm" },
    { id:"Lsp", x: embed.x-20,                y: embed.y-10,              text:"Lsp" },
  ];
  const lSel = lossG.selectAll("g.lossGroup").data(losses, d=> d.id);
  const lEnt = lSel.enter().append("g")
    .attr("class","lossGroup")
    .on("click",(evt,d)=>{
      let msg="";
      switch(d.id){
        case "Lhm": msg="Hard Loss (cross-entropy) on current task data."; break;
        case "Lsm": msg="Soft Loss (distillation) from old model outputs (reduce forgetting)."; break;
        case "Lsp": msg="Prototype distillation: keep prototypes consistent over tasks."; break;
      }
      d3.select("#infoBox").text(`${d.id}: ${msg}`);
    });
  lEnt.append("circle")
    .attr("class","lossCircle")
    .attr("cx", d=> d.x)
    .attr("cy", d=> d.y)
    .attr("r", 15)
    .attr("opacity", 0)
    .transition().duration(900)
      .attr("opacity",1);
  lEnt.append("text")
    .attr("class","lossLabel")
    .attr("x", d=> d.x)
    .attr("y", d=> d.y+5)
    .attr("text-anchor","middle")
    .text(d=> d.text);

  lSel.select("circle.lossCircle")
    .transition().duration(900)
      .attr("cx", d=> d.x)
      .attr("cy", d=> d.y);
  lSel.select("text.lossLabel")
    .transition().duration(900)
      .attr("x", d=> d.x)
      .attr("y", d=> d.y+5);

  lSel.exit().remove();
}

/******** 7) On "Train Next Task" ********/
function trainNextTask() {
  if(currentTask >= tasksData.length) {
    d3.select("#infoBox").text("All tasks completed. No more prototypes to add!");
    return;
  }
  // add new prototypes
  const newPros = tasksData[currentTask].map((p,i)=>{
    const [rx, ry] = randomPos(currentTask);
    return {
      id:`task${currentTask}_p${i}`,
      label:p.label,
      img:p.img,
      x:rx, y:ry,
      filterStr:""
    };
  });
  prototypes = prototypes.concat(newPros);

  // augment all
  prototypes.forEach(augment);

  render();
  currentTask++;
  d3.select("#infoBox")
    .text(`Trained Task #${currentTask} → added new prototypes, augmented old ones.`);
}

/******** 8) Setup button and initial call ********/
d3.select("#trainBtn").on("click", trainNextTask);
render();
