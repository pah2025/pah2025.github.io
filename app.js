/******************************************************
 * PAH Architecture Interactive Demo
 * 
 * - Displays the following:
 *   1) Prototypes (CIFAR images) on the top-left
 *   2) Flattening into a "Task Embedding" (visual placeholder)
 *   3) HyperNet (green box) generating weights => Task Head
 *   4) Backbone (blue box) for feature extraction
 *   5) Color-coded lines for forward pass (black),
 *      weight generation (green),
 *      gradient flows for Lhm, Lsm, Lsp (red).
 *   6) Each new task adds new prototypes
 *      plus random augmentations on all prototypes.
 ******************************************************/

const width = 1100, height = 700;
const svg = d3.select("#pahViz")
  .attr("viewBox", [0, 0, width, height]);

/********* 1) Define Gradients for Boxes **********/
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

// Markers for forward arrow & weight arrow
defs.append("marker")
  .attr("id","markerFwd")
  .attr("markerWidth",10)
  .attr("markerHeight",10)
  .attr("refX",10)
  .attr("refY",0)
  .attr("orient","auto")
  .append("path")
    .attr("d","M0,-5L10,0L0,5")
    .attr("fill","#444");

defs.append("marker")
  .attr("id","markerGreen")
  .attr("markerWidth",10)
  .attr("markerHeight",10)
  .attr("refX",10)
  .attr("refY",0)
  .attr("orient","auto")
  .append("path")
    .attr("d","M0,-5L10,0L0,5")
    .attr("fill","#4caf50");

// Markers for red arrows (loss grad)
defs.append("marker")
  .attr("id","markerRed")
  .attr("markerWidth",10)
  .attr("markerHeight",10)
  .attr("refX",10)
  .attr("refY",0)
  .attr("orient","auto")
  .append("path")
    .attr("d","M0,-5L10,0L0,5")
    .attr("fill","#f44336");


/********* 2) Layout for the boxes **********/
const backbone = { x: 400, y: 340, w: 200, h: 100 };
const hypernet = { x: 450, y: 180, w: 120, h: 60 };
const taskHead = { x: 800, y: 320, w: 120, h: 80 };

// We'll place prototypes near top-left
// We'll also place a small 'embedding' box that
// prototypes feed into, to show "flatten + concat"
const embedBox = { x: 180, y: 140, w: 130, h: 60 };

/********* 3) Draw the main boxes + labels *********/
function drawBox(g, box, styleClass, label) {
  g.append("rect")
    .attr("class", `compBox ${styleClass}`)
    .attr("x", box.x)
    .attr("y", box.y)
    .attr("width", box.w)
    .attr("height", box.h);
  g.append("text")
    .attr("class","compLabel")
    .attr("x", box.x + box.w/2)
    .attr("y", box.y + box.h/2 + 5)
    .attr("text-anchor","middle")
    .text(label);
}

const archG = svg.append("g");
drawBox(archG, embedBox, "", "Task Emb\ne");
drawBox(archG, hypernet, "hyperGrad", "HyperNet");
drawBox(archG, backbone, "backboneGrad", "Backbone");
drawBox(archG, taskHead, "headGrad", "Task Head");

/********* 4) Data: CIFAR tasks ***********/
const tasksData = [
  [
    { label: 'T1-Dog',  img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/dog4.png' },
    { label: 'T1-Cat',  img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/cat1.png' }
  ],
  [
    { label: 'T2-Bird', img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/bird4.png' },
    { label: 'T2-Deer', img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/deer4.png' }
  ],
  [
    { label: 'T3-Frog', img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/frog2.png' },
    { label: 'T3-Car',  img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/automobile1.png' }
  ],
  [
    { label: 'T4-Plane', img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/airplane4.png' },
    { label: 'T4-Ship',  img:'https://www.cs.toronto.edu/~kriz/cifar-10-sample/ship2.png' }
  ]
];

let currentTask = 0;
let prototypes = [];

/********* 5) D3 groups for edges, prototypes, losses *********/
const edgesG = svg.append("g");
const protoG = svg.append("g");
const lossG  = svg.append("g");

/********* 6) random positions for prototypes + augment *********/
function randomProtoPos(taskIndex) {
  const x = 40 + taskIndex*50 + (Math.random()-0.5)*30;
  const y = 60 + (Math.random()*60);
  return [x,y];
}
function augment(proto) {
  // shift coords
  proto.x += (Math.random()-0.5)*10;
  proto.y += (Math.random()-0.5)*10;
  // random filter
  const bright = (0.8 + 0.4*Math.random()).toFixed(2);
  const hue = Math.floor(Math.random()*60);
  proto.filterStr = `brightness(${bright}) hue-rotate(${hue}deg)`;
}

/********* 7) RENDER function *********/
function render() {
  // 1) PROTOTYPES join
  const sel = protoG.selectAll("image.protoImage").data(prototypes, d => d.id);

  // ENTER
  const ent = sel.enter().append("svg:image")
    .attr("class","protoImage")
    .attr("xlink:href", d => d.img)
    .attr("width", 42)
    .attr("height",42)
    .attr("opacity",0)
    .on("click",(evt,d) => {
      d3.select("#infoBox")
        .text(`Clicked prototype: ${d.label}. It's part of the task embedding 'e'.`);
    });

  ent.attr("x", d => d.x)
     .attr("y", d => d.y)
     .transition().duration(800)
       .attr("opacity",1);

  // UPDATE
  sel.transition().duration(800)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .style("filter", d => d.filterStr||null);

  // EXIT
  sel.exit().transition().duration(600)
    .attr("opacity",0)
    .remove();

  // 2) EDGES: We'll have:
  //    - forward pass: (proto->emb, emb->backbone, backbone->head?), 
  //    - weight generation: (emb->hyper->head),
  //    - gradient arrows for Lhm, Lsm, Lsp, etc
  // For simplicity, we'll create a set of lines:

  const edges = [];
  // FORWARD pass: proto -> e
  prototypes.forEach(p => {
    edges.push({
      id: p.id+"_fwdPe",
      class: "fwdArrow",
      x1: p.x+20, y1: p.y+20, 
      x2: embedBox.x, y2: embedBox.y+embedBox.h/2
    });
  });
  // e -> backbone
  edges.push({
    id:"emb2bb_fwd",
    class: "fwdArrow",
    x1: embedBox.x+embedBox.w, y1: embedBox.y+embedBox.h/2,
    x2: backbone.x, y2: backbone.y+backbone.h/2
  });
  // backbone -> head (just black arrow)
  edges.push({
    id:"bb2head_fwd",
    class: "fwdArrow",
    x1: backbone.x+backbone.w, y1: backbone.y+backbone.h/2,
    x2: taskHead.x, y2: taskHead.y+taskHead.h/2
  });
  // WEIGHT generation: e -> hyper -> head (green lines)
  edges.push({
    id:"emb2hyper_wg",
    class:"weightArrow",
    x1: embedBox.x+embedBox.w/2,
    y1: embedBox.y,
    x2: hypernet.x+hypernet.w/2,
    y2: hypernet.y+hypernet.h
  });
  edges.push({
    id:"hyper2head_wg",
    class:"weightArrow",
    x1: hypernet.x+hypernet.w,
    y1: hypernet.y+hypernet.h/2,
    x2: taskHead.x, 
    y2: taskHead.y
  });

  // GRAD arrows (Lhm, Lsm, Lsp)
  // We'll place circles for Lhm, Lsm, Lsp
  // Lhm: near the backbone/head boundary
  // Lsm: near the old model area (to the right)
  // Lsp: near the prototypes / embedding
  // We'll connect them with red lines to show gradient flow
  edges.push({
    id:"grad_hm",
    class: "gradArrow solidGrad",
    x1: taskHead.x+taskHead.w*0.5, y1: taskHead.y+taskHead.h,
    x2: backbone.x+backbone.w*0.5, y2: backbone.y+backbone.h+10
  });
  edges.push({
    id:"grad_sm",
    class: "gradArrow solidGrad",
    x1: taskHead.x+taskHead.w+40, y1: taskHead.y+taskHead.h*0.5,
    x2: taskHead.x+taskHead.w+90, y2: taskHead.y+taskHead.h*0.5
  });
  edges.push({
    id:"grad_sp",
    class: "gradArrow dashedGrad",
    x1: embedBox.x, y1: embedBox.y-20,
    x2: prototypes.length ? prototypes[0].x : embedBox.x,
    y2: prototypes.length ? prototypes[0].y : embedBox.y-20
  });

  // JOIN edges
  const eSel = edgesG.selectAll("line.archLine").data(edges, d=> d.id);
  // ENTER
  const eEnt = eSel.enter().append("line")
    .attr("class","archLine")
    .attr("x1", d=>d.x1).attr("y1", d=> d.y1)
    .attr("x2", d=> d.x1).attr("y2", d=> d.y1)
    .attr("stroke","#555")
    .attr("opacity",0);

  eEnt.transition().duration(900)
    .attr("opacity",1)
    .attr("class", d=> `archLine ${d.class}`)
    .attr("x2", d=> d.x2).attr("y2", d=> d.y2);

  // UPDATE
  eSel.transition().duration(900)
    .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
    .attr("x2", d=> d.x2).attr("y2", d=> d.y2)
    .attr("class", d=> `archLine ${d.class}`)
    .attr("opacity",1);

  // EXIT
  eSel.exit().remove();

  // Next, place the 3 loss circles for Lhm, Lsm, Lsp
  const losses = [
    { id:"Lhm", x: backbone.x+backbone.w*0.5, y: backbone.y+backbone.h+30, text:"Lhm" },
    { id:"Lsm", x: taskHead.x+taskHead.w+70,  y: taskHead.y+taskHead.h*0.5, text:"Lsm" },
    { id:"Lsp", x: embedBox.x-25,            y: embedBox.y-20,            text:"Lsp" }
  ];
  const lSel = lossG.selectAll("g.lossGroup").data(losses, d=> d.id);
  // ENTER
  const lEnt = lSel.enter().append("g")
    .attr("class","lossGroup")
    .on("click", (evt,d) => {
      let msg = "";
      if(d.id==="Lhm") msg="Hard Loss Main: cross-entropy on Task t's real labels.";
      else if(d.id==="Lsm") msg="Soft Loss Main: knowledge distillation from old model outputs.";
      else if(d.id==="Lsp") msg="Soft Loss Prototypes: keeps prototypes consistent across tasks.";
      d3.select("#infoBox").text(`Clicked ${d.text}: ${msg}`);
    });
  lEnt.append("circle")
    .attr("class","lossCircle")
    .attr("r", 15)
    .attr("cx", d=>d.x)
    .attr("cy", d=>d.y)
    .attr("opacity",0)
    .transition().duration(900)
      .attr("opacity",1);
  lEnt.append("text")
    .attr("class","lossLabel")
    .attr("x", d=>d.x)
    .attr("y", d=>d.y+5)
    .attr("text-anchor","middle")
    .text(d=> d.text);

  // UPDATE
  lSel.select("circle.lossCircle")
    .transition().duration(900)
      .attr("cx", d=>d.x)
      .attr("cy", d=>d.y);
  lSel.select("text.lossLabel")
    .transition().duration(900)
      .attr("x", d=>d.x)
      .attr("y", d=>d.y+5);

  // EXIT
  lSel.exit().remove();
}

/********* 8) On “Train Next Task” *********/
function trainNextTask() {
  if(currentTask >= tasksData.length) {
    d3.select("#infoBox")
      .text("All tasks completed. No more prototypes to add!");
    return;
  }
  // Add new prototypes
  const newPs = tasksData[currentTask].map((p,i)=>{
    const [rx, ry] = randomProtoPos(currentTask);
    return {
      id:`task${currentTask}_p${i}`,
      label:p.label,
      img:p.img,
      x:rx, y:ry,
      filterStr:""
    };
  });
  prototypes = prototypes.concat(newPs);

  // Apply augment to all prototypes
  prototypes.forEach(augment);

  render();
  currentTask++;
  d3.select("#infoBox").text(`Trained Task #${currentTask}. 
   Added new prototypes, applied random augmentations to old ones.`);
}

/********* 9) Hook up button & initial *********/
d3.select("#trainBtn").on("click", trainNextTask);
render();
