/**********************************************
 * app.js - PAH Architecture Demo v2.0
 *
 * - Complete rewrite for improved aesthetics & layout
 * - Addresses image size, overlapping, dynamism issues
 * - Grid-based prototype layout, larger images
 * - Cleaner code structure and comments
 * - Uses "v2" class names from style.css (style-v2.css)
 **********************************************/

const width_v2 = 1200, height_v2 = 650;
const svg_v2 = d3.select("#pahViz-v2")
    .attr("viewBox", [0, 0, width_v2, height_v2]);

/* -------- 1) Define Gradients (v2 - Refined Colors) -------- */
const defs_v2 = svg_v2.append("defs");

// BACKBONE gradient v2
const bbGrad_v2 = defs_v2.append("linearGradient")
    .attr("id","backboneGradient-v2")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
bbGrad_v2.append("stop").attr("offset","0%").attr("stop-color","#aed6f1"); // Lighter blue
bbGrad_v2.append("stop").attr("offset","100%").attr("stop-color","#85c1e9"); // Medium blue

// HYPER gradient v2
const hpGrad_v2 = defs_v2.append("linearGradient")
    .attr("id","hyperGradient-v2")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
hpGrad_v2.append("stop").attr("offset","0%").attr("stop-color","#a9dfbf"); // Lighter green
hpGrad_v2.append("stop").attr("offset","100%").attr("stop-color","#82e0aa"); // Medium green

// HEAD gradient v2
const thGrad_v2 = defs_v2.append("linearGradient")
    .attr("id","headGradient-v2")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
thGrad_v2.append("stop").attr("offset","0%").attr("stop-color","#d2b4de"); // Lighter purple
thGrad_v2.append("stop").attr("offset","100%").attr("stop-color","#c39bd3"); // Medium purple


/* -------- 2) Arrow Markers (v2 - Refined Style) -------- */
defs_v2.append("marker") // Forward pass arrow marker v2
    .attr("id","markerFwd-v2")
    .attr("markerWidth",10).attr("markerHeight",10)
    .attr("refX",10).attr("refY",0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-4L9,0L0,4") // Slightly smaller arrowhead
        .attr("fill","#777"); // Medium grey

defs_v2.append("marker") // Weight generation arrow marker (Green) v2
    .attr("id","markerGreen-v2")
    .attr("markerWidth",10).attr("markerHeight",10)
    .attr("refX",10).attr("refY",0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-4L9,0L0,4") // Slightly smaller arrowhead
        .attr("fill","#55a868"); // Green

defs_v2.append("marker") // Gradient arrow marker (Red) v2
    .attr("id","markerRed-v2")
    .attr("markerWidth",10).attr("markerHeight",10)
    .attr("refX",10).attr("refY",0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-4L9,0L0,4") // Slightly smaller arrowhead
        .attr("fill","#e74c3c"); // Red


/* -------- 3) Layout Positions for Architecture Components (v2 - Structured) -------- */
const backbone_v2 = { x: 200, y: 280, w: 220, h: 120 }; // Shifted more left
const hyper_v2 = {    x: 250, y: 100, w: 150, h: 70 };  // Above Backbone
const head_v2 = {     x: 800, y: 280, w: 200, h: 120 }; // Shifted more right
const embed_v2 = {    x: 500, y: 100, w: 200, h: 70 };  // Between Hyper & Head

let prototypes_v2 = []; // Array for prototypes
let currentTask_v2 = 0; // Task counter

const edgesG_v2 = svg_v2.append("g");   // Group for edges
const protoG_v2 = svg_v2.append("g");   // Group for prototypes
const lossG_v2 = svg_v2.append("g");    // Group for loss circles


/* -------- 4) Function to Draw Component Boxes (v2 - Class names) -------- */
function drawBox_v2(box, className, label) {
    svg_v2.append("rect")
        .attr("class", `compBox-v2 ${className}`)
        .attr("x", box.x).attr("y", box.y)
        .attr("width", box.w).attr("height", box.h);

    svg_v2.append("text")
        .attr("class","compLabel-v2")
        .attr("x", box.x + box.w*0.5)
        .attr("y", box.y + box.h*0.5 + 6) // Adjusted vertical centering
        .attr("text-anchor","middle")
        .text(label);
}
// Draw component boxes v2
drawBox_v2(embed_v2,    "",               "Task Embedding\n e");
drawBox_v2(hyper_v2,    "hyperGrad-v2",    "HyperNet");
drawBox_v2(backbone_v2, "backboneGrad-v2", "Backbone");
drawBox_v2(head_v2,     "headGrad-v2",     "Task Head");


/* -------- 5) Task Data (CIFAR-10 Examples) - Same Data -------- */
const tasksData_v2 = [
    [   { label:"T1-Dog",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/dog4.png" },
        { label:"T1-Cat",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/cat1.png" } ],
    [   { label:"T2-Deer", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/deer4.png" },
        { label:"T2-Bird", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/bird4.png" } ],
    [   { label:"T3-Frog", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/frog2.png" },
        { label:"T3-Car",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/automobile1.png" } ],
    [   { label:"T4-Plane",img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/airplane4.png" },
        { label:"T4-Ship", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/ship2.png" } ]
];


/* -------- 6) Prototype Positioning & Augmentation (v2 - Grid Layout) -------- */
function protoGridPos_v2(protoIndex, taskIndex, numProtosInTask) {
    const startX = 80;           // Left margin for prototypes
    const startY = 480;          // Top margin for prototype grid
    const protoSpacingX = 100;   // Horizontal spacing between prototypes
    const protoSpacingY = 100;   // Vertical spacing between rows
    const protosPerRow = 4;      // Number of prototypes per row

    const colIndex = protoIndex % protosPerRow;
    const rowIndex = Math.floor(protoIndex / protosPerRow);

    const x = startX + colIndex * protoSpacingX + (Math.random()-0.5)*15; // Horizontal position with slight jitter
    const y = startY + rowIndex * protoSpacingY + (Math.random()-0.5)*15; // Vertical position with slight jitter

    return [x, y];
}

function augment_v2(proto) {
    proto.x += (Math.random()-0.5)*10; // Reduced jitter
    proto.y += (Math.random()-0.5)*10; // Reduced jitter
    const br = (0.9 + 0.2*Math.random()).toFixed(2); // Brighter, less extreme
    const hr = Math.floor(Math.random()*20);         // Less hue rotation
    proto.filterStr = `brightness(${br}) hue-rotate(${hr}deg)`;
}


/* -------- 7) Render Function (v2 - Updated for New Layout & Styles) -------- */
function render_v2() {
    /* --- PROTOTYPES (v2 - Grid Layout) --- */
    const sel_v2 = protoG_v2.selectAll("image.protoImage-v2").data(prototypes_v2, d=> d.id);

    // --- Prototype Enter (v2) ---
    const ent_v2 = sel_v2.enter().append("svg:image")
        .attr("class","protoImage-v2")
        .attr("xlink:href", d => d.img)
        .attr("width", 60).attr("height",60) // Larger size
        .attr("opacity",0)
        .on("click",(evt,d)=>{
            d3.select("#infoBox-v2").text(`Prototype: ${d.label}. Represents learned class features. Feeds into Task Embedding.`);
        });
    ent_v2.attr("x", d=> d.x).attr("y", d=> d.y)
        .transition().duration(800)
            .attr("opacity",1); // Fade in

    // --- Prototype Update (v2) ---
    sel_v2.transition().duration(800)
        .attr("x", d=> d.x)
        .attr("y", d=> d.y)
        .style("filter", d=> d.filterStr); // Apply augment

    // --- Prototype Exit (v2) ---
    sel_v2.exit().transition().duration(600)
        .attr("opacity",0)
        .remove(); // Fade out

    /* --- EDGES (Arrows & Lines) (v2 - Adjusted Positions) --- */
    const edges_v2 = [];

    // --- Forward Pass Arrows (v2 - Adjusted Coordinates) ---
    prototypes_v2.forEach(p=>{
        edges_v2.push({
            id:p.id+"_fwdPE",
            cls:"fwdArrow-v2 archEdge-v2",
            x1:p.x+30, y1:p.y+30, // Center of proto image
            x2:embed_v2.x, y2:embed_v2.y+embed_v2.h/2 // Embed box center-left
        });
    });
    edges_v2.push({ // Embed -> Backbone v2
        id:"emb2bb",
        cls:"fwdArrow-v2 archEdge-v2",
        x1: embed_v2.x+embed_v2.w,   y1: embed_v2.y+embed_v2.h/2, // Embed box center-right
        x2: backbone_v2.x,        y2: backbone_v2.y+backbone_v2.h/2 // Backbone box center-left
    });
    edges_v2.push({ // Backbone -> Head v2
        id:"bb2head",
        cls:"fwdArrow-v2 archEdge-v2",
        x1: backbone_v2.x+backbone_v2.w,
        y1: backbone_v2.y+backbone_v2.h/2,
        x2: head_v2.x,
        y2: head_v2.y+head_v2.h/2
    });

    // --- Weight Generation Arrows (v2 - Adjusted) ---
    edges_v2.push({ // Embed -> HyperNet v2
        id:"emb2hyper",
        cls:"weightArrow-v2 archEdge-v2",
        x1: embed_v2.x+embed_v2.w/2,
        y1: embed_v2.y+embed_v2.h, // Embed box bottom-center
        x2: hyper_v2.x+hyper_v2.w/2,
        y2: hyper_v2.y+hyper_v2.h // Hyper box bottom-center
    });
    edges_v2.push({ // HyperNet -> Head v2
        id:"hyper2head",
        cls:"weightArrow-v2 archEdge-v2",
        x1: hyper_v2.x+hyper_v2.w,
        y1: hyper_v2.y+hyper_v2.h/2, // Hyper box center-right
        x2: head_v2.x,
        y2: head_v2.y // Head box top-center
    });

    // --- Gradient Arrows (v2 - Adjusted) ---
    edges_v2.push({ // Lhm Gradient v2
        id:"LhmLine",
        cls:"gradArrow-v2 solidGrad-v2 archEdge-v2",
        x1: backbone_v2.x + backbone_v2.w*0.5, y1: backbone_v2.y+backbone_v2.h+15, // Below Backbone
        x2: head_v2.x + head_v2.w*0.3,         y2: head_v2.y + head_v2.h+25  // Below Head
    });
    edges_v2.push({ // Lsm Gradient v2
        id:"LsmLine",
        cls:"gradArrow-v2 solidGrad-v2 archEdge-v2",
        x1: head_v2.x+head_v2.w+50, y1: head_v2.y+head_v2.h*0.5, // Right of Head
        x2: head_v2.x+head_v2.w+120,y2: head_v2.y+head_v2.h*0.5 // Further right
    });
    edges_v2.push({ // Lsp Gradient v2
        id:"LspLine",
        cls:"gradArrow-v2 dashedGrad-v2 archEdge-v2",
        x1: embed_v2.x-30, y1: embed_v2.y-15, // Left of Embed
        x2: prototypes_v2.length? prototypes_v2[0].x+15 : embed_v2.x-30, // Target proto or Embed left
        y2: prototypes_v2.length? prototypes_v2[0].y-15 : embed_v2.y-15
    });


    const eSel_v2 = edgesG_v2.selectAll("line.archEdge-v2").data(edges_v2, d=> d.id);

    // --- Edge Enter (v2) ---
    const eEnt_v2 = eSel_v2.enter().append("line")
        .attr("class","archEdge-v2")
        .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
        .attr("x2", d=> d.x1).attr("y2", d=> d.y1) // Start at source
        .attr("opacity",0);

    eEnt_v2.transition().duration(1000)
        .attr("opacity",1)
        .attr("class", d=> `archEdge-v2 ${d.cls}`)
        .attr("x2", d=> d.x2).attr("y2", d=> d.y2); // Animate to target

    // --- Edge Update (v2) ---
    eSel_v2.transition().duration(1000)
        .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
        .attr("x2", d=> d.x2).attr("y2", d=> d.y2)
        .attr("class", d=> `archEdge-v2 ${d.cls}`)
        .attr("opacity",1);

    // --- Edge Exit (v2) ---
    eSel_v2.exit().remove();


    /* --- LOSS CIRCLES (v2 - Positions & Interaction) --- */
    const losses_v2 = [
        { id:"Lhm", x: backbone_v2.x+backbone_v2.w*0.5, y: backbone_v2.y+backbone_v2.h+30, text:"Lhm" }, // Below Backbone
        { id:"Lsm", x: head_v2.x+head_v2.w+100,        y: head_v2.y+head_v2.h*0.5,        text:"Lsm" }, // Right of Head
        { id:"Lsp", x: embed_v2.x-30,                  y: embed_v2.y-15,                  text:"Lsp" }  // Left of Embed
    ];
    const lSel_v2 = lossG_v2.selectAll("g.lossGroup-v2").data(losses_v2, d=> d.id);

    // --- Loss Circle Enter (v2) ---
    const lEnt_v2 = lSel_v2.enter().append("g")
        .attr("class","lossGroup-v2")
        .on("click",(evt,d)=>{
            let msg="";
            switch(d.id){
                case "Lhm": msg="Hard Loss: Cross-entropy. Measures current task accuracy."; break;
                case "Lsm": msg="Soft Loss: Knowledge Distillation. Preserves prior knowledge."; break;
                case "Lsp": msg="Prototype Loss: Ensures consistent prototype learning."; break;
            }
            d3.select("#infoBox-v2").text(`${d.text}: ${msg}`);
        });
    lEnt_v2.append("circle")
        .attr("class","lossCircle-v2")
        .attr("cx", d=> d.x)
        .attr("cy", d=> d.y)
        .attr("r", 18) // Slightly larger loss circles
        .attr("opacity", 0)
        .transition().duration(900)
            .attr("opacity",1); // Fade in
    lEnt_v2.append("text")
        .attr("class","lossLabel-v2")
        .attr("x", d=> d.x)
        .attr("y", d=> d.y+5)
        .attr("text-anchor","middle")
        .text(d=> d.text);

    // --- Loss Circle Update (v2) ---
    lSel_v2.select("circle.lossCircle-v2")
        .transition().duration(900)
            .attr("cx", d=> d.x)
            .attr("cy", d=> d.y);
    lSel_v2.select("text.lossLabel-v2")
        .transition().duration(900)
            .attr("x", d=> d.x)
            .attr("y", d=> d.y+5);

    // --- Loss Circle Exit (v2) ---
    lSel_v2.exit().remove();
}


/* -------- 8) Train Next Task Function (v2 - Prototype Grid) -------- */
function trainNextTask_v2() {
    if(currentTask_v2 >= tasksData_v2.length) {
        d3.select("#infoBox-v2").text("All tasks completed. No more prototypes to add.");
        return;
    }

    const newProtos_v2 = tasksData_v2[currentTask_v2].map((p,i)=>{
        const [rx, ry] = protoGridPos_v2(prototypes_v2.length + i, currentTask_v2, tasksData_v2[currentTask_v2].length); // Grid position
        return {
            id:`task${currentTask_v2}_p${i}`,
            label:p.label,
            img:p.img,
            x:rx, y:ry,
            filterStr:""
        };
    });
    prototypes_v2 = prototypes_v2.concat(newProtos_v2); // Add new prototypes

    prototypes_v2.forEach(augment_v2); // Augment prototypes

    render_v2(); // Re-render
    currentTask_v2++; // Inc task count
    d3.select("#infoBox-v2")
        .text(`Task #${currentTask_v2} trained. New prototypes added and visualized in a grid layout. Data and gradient flow are animated.`);
}


/* -------- 9) Button Event & Initial Render (v2) -------- */
d3.select("#trainBtn-v2").on("click", trainNextTask_v2); // Button event
render_v2(); // Initial render
