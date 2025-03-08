/**********************************************
 * Polished Interactive PAH Demo - app.js
 *
 * - Refined layout and styling (see style.css)
 * - Animates prototypes, forward pass lines,
 *   hypernetwork weight lines, and red gradient lines
 * - Interactive Lhm, Lsm, Lsp circles with info on hover/click
 * - Clearer comments and code organization
 **********************************************/

const width = 1100, height = 700;
const svg = d3.select("#pahViz")
    .attr("viewBox", [0, 0, width, height]);

/* -------- 1) Define Gradients (for component boxes) -------- */
const defs = svg.append("defs");

// BACKBONE gradient
const bbGrad = defs.append("linearGradient")
    .attr("id","backboneGradient")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
bbGrad.append("stop").attr("offset","0%").attr("stop-color","#b3e5fc"); // Light blue
bbGrad.append("stop").attr("offset","100%").attr("stop-color","#81d4fa"); // Medium blue

// HYPER gradient
const hpGrad = defs.append("linearGradient")
    .attr("id","hyperGradient")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
hpGrad.append("stop").attr("offset","0%").attr("stop-color","#c8e6c9"); // Light green
hpGrad.append("stop").attr("offset","100%").attr("stop-color","#a5d6a7"); // Medium green

// HEAD gradient
const thGrad = defs.append("linearGradient")
    .attr("id","headGradient")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
thGrad.append("stop").attr("offset","0%").attr("stop-color","#e1bee7"); // Light purple
thGrad.append("stop").attr("offset","100%").attr("stop-color","#ce93d8"); // Medium purple


/* -------- 2) Arrow Markers (for visual flow indication) -------- */
defs.append("marker") // Forward pass arrow marker
    .attr("id","markerFwd")
    .attr("markerWidth",10).attr("markerHeight",10)
    .attr("refX",10).attr("refY",0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-5L10,0L0,5")
        .attr("fill","#666"); // Dark grey

defs.append("marker") // Weight generation arrow marker (Green)
    .attr("id","markerGreen")
    .attr("markerWidth",10).attr("markerHeight",10)
    .attr("refX",10).attr("refY",0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-5L10,0L0,5")
        .attr("fill","#4caf50"); // Green

defs.append("marker") // Gradient arrow marker (Red)
    .attr("id","markerRed")
    .attr("markerWidth",10).attr("markerHeight",10)
    .attr("refX",10).attr("refY",0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-5L10,0L0,5")
        .attr("fill","#f44336"); // Red


/* -------- 3) Layout Positions for Architecture Components -------- */
const backbone = { x: 420, y: 360, w: 200, h: 100 };
const hyper = {    x: 470, y: 190, w: 130, h: 60 };
const head = {     x: 830, y: 320, w: 130, h: 80 };
const embed = {    x: 180, y: 140, w: 110, h: 50 };

let prototypes = []; // Array to hold prototype data
let currentTask = 0; // Task counter

const edgesG = svg.append("g");   // Group for edges (arrows/lines)
const protoG = svg.append("g");   // Group for prototypes (images)
const lossG = svg.append("g");    // Group for loss circles


/* -------- 4) Function to Draw Component Boxes -------- */
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
// Draw the main component boxes
drawBox(embed,   "",            "Task Emb\n e");
drawBox(hyper,   "hyperGrad",   "HyperNet");
drawBox(backbone,"backboneGrad","Backbone");
drawBox(head,    "headGrad",    "Task Head");


/* -------- 5) Task Data (CIFAR-10 Examples) -------- */
const tasksData = [
    [ // Task 1: Dogs and Cats
        { label:"T1-Dog",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/dog4.png" },
        { label:"T1-Cat",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/cat1.png" }
    ],
    [ // Task 2: Deer and Birds
        { label:"T2-Deer", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/deer4.png" },
        { label:"T2-Bird", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/bird4.png" }
    ],
    [ // Task 3: Frogs and Cars
        { label:"T3-Frog", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/frog2.png" },
        { label:"T3-Car",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/automobile1.png" }
    ],
    [ // Task 4: Planes and Ships
        { label:"T4-Plane",img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/airplane4.png" },
        { label:"T4-Ship", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/ship2.png" }
    ]
];


/* -------- 6) Helper Functions for Prototype Positioning & Augmentation -------- */
function randomPos(tIndex) {
    const baseX = 60 + tIndex*50; // Base X position shifts with task index
    const x = baseX + (Math.random()-0.5)*20; // Add some horizontal randomness
    const y = 40 + Math.random()*60;          // Vertical randomness
    return [x,y];
}

function augment(proto) {
    proto.x += (Math.random()-0.5)*8;  // Less horizontal jitter
    proto.y += (Math.random()-0.5)*8;  // Less vertical jitter
    const br = (0.85 + 0.3*Math.random()).toFixed(2); // Brightness closer to 1
    const hr = Math.floor(Math.random()*30);         // Hue rotation less extreme
    proto.filterStr = `brightness(${br}) hue-rotate(${hr}deg)`;
}


/* -------- 7) Main Render Function - Updates Visualization -------- */
function render() {
    /* --- PROTOTYPES --- */
    const sel = protoG.selectAll("image.protoImage").data(prototypes, d=> d.id);

    // --- Prototype Enter ---
    const ent = sel.enter().append("svg:image")
        .attr("class","protoImage")
        .attr("xlink:href", d => d.img)
        .attr("width", 45).attr("height",45)
        .attr("opacity",0)
        .on("click",(evt,d)=>{ // Info on prototype click
            d3.select("#infoBox").text(`Prototype: ${d.label} → Flatten → HyperNet → Task Head. Represents class-specific features.`);
        });
    ent.attr("x", d=> d.x).attr("y", d=> d.y)
        .transition().duration(800)
            .attr("opacity",1); // Fade in new prototypes

    // --- Prototype Update ---
    sel.transition().duration(800)
        .attr("x", d=> d.x)
        .attr("y", d=> d.y)
        .style("filter", d=> d.filterStr); // Apply augmentation

    // --- Prototype Exit ---
    sel.exit().transition().duration(600)
        .attr("opacity",0)
        .remove(); // Fade out and remove old prototypes

    /* --- EDGES (Arrows and Lines) --- */
    const edges = [];

    // --- Forward Pass Arrows (Prototypes -> Embed, Embed -> Backbone, Backbone -> Head) ---
    prototypes.forEach(p=>{ // Prototypes to Task Embedding
        edges.push({
            id:p.id+"_fwdPE",
            cls:"fwdArrow archEdge",
            x1:p.x+22, y1:p.y+22,
            x2:embed.x, y2:embed.y+embed.h/2
        });
    });
    edges.push({ // Task Embedding to Backbone
        id:"emb2bb",
        cls:"fwdArrow archEdge",
        x1: embed.x+embed.w,   y1: embed.y+embed.h/2,
        x2: backbone.x,        y2: backbone.y+backbone.h/2
    });
    edges.push({ // Backbone to Task Head
        id:"bb2head",
        cls:"fwdArrow archEdge",
        x1: backbone.x+backbone.w,
        y1: backbone.y+backbone.h/2,
        x2: head.x,
        y2: head.y+head.h/2
    });

    // --- Weight Generation Arrows (Embed -> HyperNet, HyperNet -> Task Head) ---
    edges.push({ // Task Embedding to HyperNet (Weight Generation Start)
        id:"emb2hyper",
        cls:"weightArrow archEdge",
        x1: embed.x+embed.w/2,
        y1: embed.y,
        x2: hyper.x+hyper.w/2,
        y2: hyper.y+hyper.h
    });
    edges.push({ // HyperNet to Task Head (Weights Applied)
        id:"hyper2head",
        cls:"weightArrow archEdge",
        x1: hyper.x+hyper.w,
        y1: hyper.y+hyper.h/2,
        x2: head.x+(head.w*0.1),
        y2: head.y
    });

    // --- Gradient Arrows (Loss Backpropagation) ---
    edges.push({ // Lhm Gradient (Backbone to Task Head)
        id:"LhmLine",
        cls:"gradArrow solidGrad archEdge",
        x1: backbone.x + backbone.w*0.5, y1: backbone.y+backbone.h+12,
        x2: head.x + head.w*0.3,         y2: head.y + head.h+20
    });
    edges.push({ // Lsm Gradient (Task Head - Knowledge Distillation)
        id:"LsmLine",
        cls:"gradArrow solidGrad archEdge",
        x1: head.x+head.w+60, y1: head.y+head.h*0.5,
        x2: head.x+head.w+110,y2: head.y+head.h*0.5
    });
    edges.push({ // Lsp Gradient (Prototype Distillation)
        id:"LspLine",
        cls:"gradArrow dashedGrad archEdge",
        x1: embed.x-20, y1: embed.y-10,
        x2: prototypes.length? prototypes[0].x : embed.x, // Target prototype if exists
        y2: prototypes.length? prototypes[0].y : embed.y
    });


    const eSel = edgesG.selectAll("line.archEdge").data(edges, d=> d.id);

    // --- Edge Enter ---
    const eEnt = eSel.enter().append("line")
        .attr("class","archEdge")
        .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
        .attr("x2", d=> d.x1).attr("y2", d=> d.y1) // Start at source point
        .attr("opacity",0);

    eEnt.transition().duration(1000)
        .attr("opacity",1)
        .attr("class", d=> `archEdge ${d.cls}`)
        .attr("x2", d=> d.x2).attr("y2", d=> d.y2); // Animate to target point, apply class

    // --- Edge Update ---
    eSel.transition().duration(1000)
        .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
        .attr("x2", d=> d.x2).attr("y2", d=> d.y2)
        .attr("class", d=> `archEdge ${d.cls}`)
        .attr("opacity",1);

    // --- Edge Exit ---
    eSel.exit().remove();


    /* --- LOSS CIRCLES (Interactive with Info) --- */
    const losses = [
        { id:"Lhm", x: backbone.x+backbone.w*0.5, y: backbone.y+backbone.h+25, text:"Lhm" },
        { id:"Lsm", x: head.x+head.w+90,          y: head.y+head.h*0.5,        text:"Lsm" },
        { id:"Lsp", x: embed.x-20,                y: embed.y-10,              text:"Lsp" },
    ];
    const lSel = lossG.selectAll("g.lossGroup").data(losses, d=> d.id);

    // --- Loss Circle Enter ---
    const lEnt = lSel.enter().append("g")
        .attr("class","lossGroup")
        .on("click",(evt,d)=>{ // Info on loss circle click
            let msg="";
            switch(d.id){
                case "Lhm": msg="Hard Loss: Cross-entropy for current task classification accuracy."; break;
                case "Lsm": msg="Soft Loss: Knowledge Distillation to preserve old task knowledge & reduce forgetting."; break;
                case "Lsp": msg="Prototype Distillation: Ensures prototypes remain discriminative and consistent across tasks."; break;
            }
            d3.select("#infoBox").text(`${d.text}: ${msg}`);
        });
    lEnt.append("circle")
        .attr("class","lossCircle")
        .attr("cx", d=> d.x)
        .attr("cy", d=> d.y)
        .attr("r", 15)
        .attr("opacity", 0)
        .transition().duration(900)
            .attr("opacity",1); // Fade in loss circles
    lEnt.append("text")
        .attr("class","lossLabel")
        .attr("x", d=> d.x)
        .attr("y", d=> d.y+5)
        .attr("text-anchor","middle")
        .text(d=> d.text);

    // --- Loss Circle Update ---
    lSel.select("circle.lossCircle")
        .transition().duration(900)
            .attr("cx", d=> d.x)
            .attr("cy", d=> d.y);
    lSel.select("text.lossLabel")
        .transition().duration(900)
            .attr("x", d=> d.x)
            .attr("y", d=> d.y+5);

    // --- Loss Circle Exit ---
    lSel.exit().remove();
}


/* -------- 8) Function to Handle "Train Next Task" Button Click -------- */
function trainNextTask() {
    if(currentTask >= tasksData.length) {
        d3.select("#infoBox").text("All tasks completed. No more prototypes to add!");
        return;
    }

    // Add new prototypes for the current task
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
    prototypes = prototypes.concat(newPros); // Append new prototypes to existing array

    // Augment all prototypes (new and old) for visual variation
    prototypes.forEach(augment);

    render(); // Re-render the visualization to reflect changes
    currentTask++; // Increment task counter
    d3.select("#infoBox")
        .text(`Trained Task #${currentTask} → Added new prototypes, augmented existing ones, visualized data & gradient flow.`);
}


/* -------- 9) Setup Button Event Listener and Initial Render -------- */
d3.select("#trainBtn").on("click", trainNextTask); // Button click handler
render(); // Initial render on page load
