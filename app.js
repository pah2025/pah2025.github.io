/**********************************************
 * app.js - PAH Architecture Demo v3.0
 *
 * - Complete rewrite for stunning modern aesthetics
 * - Dynamic layout, larger prototypes, enhanced visuals
 * - Improved interactivity and information display
 * - Uses "v3" class names from style.css (style-v3.css)
 **********************************************/

const width_v3 = 1200, height_v3 = 700;
const svg_v3 = d3.select("#pah-svg-v3")
    .attr("viewBox", [0, 0, width_v3, height_v3]);

/* -------- 1) Define Gradients (v3 - Elegant Color Palette) -------- */
const defs_v3 = svg_v3.append("defs");

// BACKBONE gradient v3
const bbGrad_v3 = defs_v3.append("linearGradient")
    .attr("id","backboneGradient-v3")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
bbGrad_v3.append("stop").attr("offset","0%").attr("stop-color","#c7ecee"); // Soft light blue
bbGrad_v3.append("stop").attr("offset","100%").attr("stop-color","#b2dfdb"); // Muted blue-green

// HYPER gradient v3
const hpGrad_v3 = defs_v3.append("linearGradient")
    .attr("id","hyperGradient-v3")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
hpGrad_v3.append("stop").attr("offset","0%").attr("stop-color","#dff9fb"); // Very light cyan
hpGrad_v3.append("stop").attr("offset","100%").attr("stop-color","#ccf2f4"); // Light cyan

// HEAD gradient v3
const thGrad_v3 = defs_v3.append("linearGradient")
    .attr("id","headGradient-v3")
    .attr("x1","0%").attr("y1","0%")
    .attr("x2","100%").attr("y2","0%");
thGrad_v3.append("stop").attr("offset","0%").attr("stop-color","#f1e6df"); // Light beige
thGrad_v3.append("stop").attr("offset","100%").attr("stop-color","#f0d9d1"); // Soft beige


/* -------- 2) Arrow Markers (v3 - Modern Style) -------- */
defs_v3.append("marker") // Forward pass arrow marker v3
    .attr("id","markerFwd-v3")
    .attr("markerWidth", 12).attr("markerHeight", 12)
    .attr("refX", 12).attr("refY", 0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-5L11,0L0,5") // Slightly larger arrowhead
        .attr("fill","#666"); // Dark grey

defs_v3.append("marker") // Weight generation arrow marker (Green) v3
    .attr("id","markerGreen-v3")
    .attr("markerWidth", 12).attr("markerHeight", 12)
    .attr("refX", 12).attr("refY", 0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-5L11,0L0,5") // Slightly larger arrowhead
        .attr("fill","#4caf50"); // Green

defs_v3.append("marker") // Gradient arrow marker (Red) v3
    .attr("id","markerRed-v3")
    .attr("markerWidth", 12).attr("markerHeight", 12)
    .attr("refX", 12).attr("refY", 0)
    .attr("orient","auto")
    .append("path")
        .attr("d","M0,-5L11,0L0,5") // Slightly larger arrowhead
        .attr("fill","#e74c3c"); // Red


/* -------- 3) Layout Positions for Architecture Components (v3 - Elegant) -------- */
const backbone_v3 = { x: 150, y: 320, w: 240, h: 140 }; // More left
const hyper_v3 = {    x: 180, y: 120, w: 160, h: 80 };  // Above Backbone
const head_v3 = {     x: 800, y: 320, w: 240, h: 140 }; // More right
const embed_v3 = {    x: 480, y: 120, w: 240, h: 80 };  // Centered Embed

let prototypes_v3 = []; // Prototypes array
let currentTask_v3 = 0; // Task counter

const edgesG_v3 = svg_v3.append("g");   // Edges group
const protoG_v3 = svg_v3.append("g");   // Prototypes group
const lossG_v3 = svg_v3.append("g");    // Loss circles group
const compG_v3 = svg_v3.append("g");    // Component boxes group (drawn first)


/* -------- 4) Function to Draw Component Boxes (v3 - Interactivity) -------- */
function drawBox_v3(box, className, label, compId) {
    const boxElem = compG_v3.append("rect")
        .attr("class", `comp-box-v3 ${className}`)
        .attr("x", box.x).attr("y", box.y)
        .attr("width", box.w).attr("height", box.h)
        .on("mouseover", () => {
            d3.select("#component-info-v3").text(getComponentDetails(compId));
            boxElem.classed("comp-box-v3-hovered", true); // Example hover class (can define in CSS)
        })
        .on("mouseout", () => {
            d3.select("#component-info-v3").text("Hover or click on components for details.");
            boxElem.classed("comp-box-v3-hovered", false);
        });


    compG_v3.append("text")
        .attr("class","comp-label-v3")
        .attr("x", box.x + box.w*0.5)
        .attr("y", box.y + box.h*0.5 + 7) // Adjusted vertical center
        .attr("text-anchor","middle")
        .text(label);
}

function getComponentDetails(compId) {
    switch (compId) {
        case "embed":    return "Task Embedding (e): Encodes task-specific information derived from prototypes.";
        case "hypernet": return "HyperNet: Generates task-specific weights for the Task Head, conditioned on the Task Embedding.";
        case "backbone": return "Backbone Network: Shared feature extractor, processes input images.";
        case "head":     return "Task Head: Classification layer with weights dynamically generated by HyperNet.";
        default:         return "Component details.";
    }
}


// Draw component boxes v3 - draw boxes first so prototypes are on top
drawBox_v3(embed_v3,    "",                  "Task Embedding\n e", "embed");
drawBox_v3(hyper_v3,    "hyper-grad-v3",     "HyperNet", "hypernet");
drawBox_v3(backbone_v3, "backbone-grad-v3",  "Backbone", "backbone");
drawBox_v3(head_v3,     "head-grad-v3",      "Task Head", "head");


/* -------- 5) Task Data (CIFAR-10 Examples) - Data remains the same -------- */
const tasksData_v3 = [
    [   { label:"T1-Dog",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/dog4.png" },
        { label:"T1-Cat",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/cat1.png" } ],
    [   { label:"T2-Deer", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/deer4.png" },
        { label:"T2-Bird", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/bird4.png" } ],
    [   { label:"T3-Frog", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/frog2.png" },
        { label:"T3-Car",  img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/automobile1.png" } ],
    [   { label:"T4-Plane",img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/airplane4.png" },
        { label:"T4-Ship", img:"https://www.cs.toronto.edu/~kriz/cifar-10-sample/ship2.png" } ]
];


/* -------- 6) Prototype Positioning (v3 - Dynamic Arc Layout) -------- */
function protoArcPos_v3(protoIndex, totalProtos) {
    const centerX = 300;           // Center of the arc (adjust as needed)
    const centerY = 550;           // Vertical center of the arc
    const radius = 200;            // Radius of the arc
    const startAngle = -Math.PI / 2; // Starting angle (-90 degrees = top)
    const endAngle = Math.PI / 2;   // Ending angle (90 degrees = bottom)
    const angleRange = endAngle - startAngle;

    const angleStep = totalProtos > 1 ? angleRange / (totalProtos - 1) : 0; // Angle increment
    const currentAngle = startAngle + protoIndex * angleStep;

    const x = centerX + radius * Math.cos(currentAngle) + (Math.random() - 0.5) * 15; // X position on arc + jitter
    const y = centerY + radius * Math.sin(currentAngle) + (Math.random() - 0.5) * 15; // Y position on arc + jitter

    return [x, y];
}


function augment_v3(proto) {
    proto.x += (Math.random()-0.5)*8;
    proto.y += (Math.random()-0.5)*8;
    const br = (0.92 + 0.18*Math.random()).toFixed(2); // Slightly brighter
    const hr = Math.floor(Math.random()*15);         // Even less hue rotation
    proto.filterStr = `brightness(${br}) hue-rotate(${hr}deg)`;
}


/* -------- 7) Render Function (v3 - Arc Layout & Enhanced Styling) -------- */
function render_v3() {
    /* --- PROTOTYPES (v3 - Dynamic Arc Layout) --- */
    const sel_v3 = protoG_v3.selectAll("image.proto-image-v3").data(prototypes_v3, d=> d.id);

    // --- Prototype Enter (v3) ---
    const ent_v3 = sel_v3.enter().append("svg:image")
        .attr("class","proto-image-v3")
        .attr("xlink:href", d => d.img)
        .attr("width", 70).attr("height",70) // Larger prototypes v3
        .attr("opacity",0)
        .on("mouseover", (event, d) => {
            d3.select("#component-info-v3").text(`Prototype: ${d.label}. Visual representation of learned class features.`);
            d3.select(event.currentTarget).classed("proto-image-v3-hovered", true); // Example hover class
        })
        .on("mouseout", (event, d) => {
            d3.select("#component-info-v3").text("Hover or click on components for details.");
            d3.select(event.currentTarget).classed("proto-image-v3-hovered", false);
        });


    ent_v3.attr("x", d=> d.x).attr("y", d=> d.y)
        .transition().duration(800)
            .attr("opacity",1); // Fade in

    // --- Prototype Update (v3) ---
    sel_v3.transition().duration(800)
        .attr("x", d=> d.x)
        .attr("y", d=> d.y)
        .style("filter", d=> d.filterStr); // Apply augmentation

    // --- Prototype Exit (v3) ---
    sel_v3.exit().transition().duration(600)
        .attr("opacity",0)
        .remove(); // Fade out


    /* --- EDGES (Arrows & Lines) (v3 - Adjusted for Arc & New Layout) --- */
    const edges_v3 = [];

    // --- Forward Pass Arrows (v3 - Arc Prototypes -> Embed, etc.) ---
    prototypes_v3.forEach(p=>{
        edges_v3.push({
            id:p.id+"_fwdPE",
            cls:"fwd-arrow-v3 arch-edge-v3",
            x1:p.x+35, y1:p.y+35, // Center of proto image
            x2:embed_v3.x + embed_v3.w/2, y2:embed_v3.y // Embed box top-center
        });
    });
    edges_v3.push({ // Embed -> Backbone v3
        id:"emb2bb",
        cls:"fwd-arrow-v3 arch-edge-v3",
        x1: embed_v3.x+embed_v3.w/2,   y1: embed_v3.y+embed_v3.h, // Embed box bottom-center
        x2: backbone_v3.x + backbone_v3.w/2,        y2: backbone_v3.y // Backbone box top-center
    });
    edges_v3.push({ // Backbone -> Head v3
        id:"bb2head",
        cls:"fwd-arrow-v3 arch-edge-v3",
        x1: backbone_v3.x+backbone_v3.w/2,
        y1: backbone_v3.y+backbone_v3.h,
        x2: head_v3.x + head_v3.w/2,
        y2: head_v3.y // Head box top-center
    });

    // --- Weight Generation Arrows (v3 - Adjusted) ---
    edges_v3.push({ // Embed -> HyperNet v3
        id:"emb2hyper",
        cls:"weight-arrow-v3 arch-edge-v3",
        x1: embed_v3.x+embed_v3.w,
        y1: embed_v3.y+embed_v3.h/2, // Embed box center-right
        x2: hyper_v3.x+hyper_v3.w,
        y2: hyper_v3.y+hyper_v3.h/2 // Hyper box center-right
    });
    edges_v3.push({ // HyperNet -> Head v3
        id:"hyper2head",
        cls:"weight-arrow-v3 arch-edge-v3",
        x1: hyper_v3.x+hyper_v3.w/2,
        y1: hyper_v3.y, // Hyper box top-center
        x2: head_v3.x,
        y2: head_v3.y // Head box top-center
    });

    // --- Gradient Arrows (v3 - Adjusted) ---
    edges_v3.push({ // Lhm Gradient v3
        id:"LhmLine",
        cls:"grad-arrow-v3 solid-grad-v3 arch-edge-v3",
        x1: backbone_v3.x + backbone_v3.w*0.5, y1: backbone_v3.y+backbone_v3.h+18, // Below Backbone
        x2: backbone_v3.x + backbone_v3.w*0.5, y2: backbone_v3.y+backbone_v3.h + 70  // Lhm below backbone
    });
    edges_v3.push({ // Lsm Gradient v3
        id:"LsmLine",
        cls:"grad-arrow-v3 solid-grad-v3 arch-edge-v3",
        x1: head_v3.x+head_v3.w+50, y1: head_v3.y+head_v3.h/2, // Right of Head
        x2: head_v3.x+head_v3.w+130,y2: head_v3.y+head_v3.h/2 // Lsm further right
    });
    edges_v3.push({ // Lsp Gradient v3
        id:"LspLine",
        cls:"grad-arrow-v3 dashed-grad-v3 arch-edge-v3",
        x1: embed_v3.x-40, y1: embed_v3.y+embed_v3.h/2, // Left of Embed
        x2: embed_v3.x-100, y2: embed_v3.y+embed_v3.h/2 // Lsp further left
    });


    const eSel_v3 = edgesG_v3.selectAll("line.arch-edge-v3").data(edges_v3, d=> d.id);

    // --- Edge Enter (v3) ---
    const eEnt_v3 = eSel_v3.enter().append("line")
        .attr("class","arch-edge-v3")
        .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
        .attr("x2", d=> d.x1).attr("y2", d=> d.y1)
        .attr("opacity",0);

    eEnt_v3.transition().duration(1200) // Slightly longer animation
        .attr("opacity",1)
        .attr("class", d=> `arch-edge-v3 ${d.cls}`)
        .attr("x2", d=> d.x2).attr("y2", d=> d.y2);

    // --- Edge Update (v3) ---
    eSel_v3.transition().duration(1200)
        .attr("x1", d=> d.x1).attr("y1", d=> d.y1)
        .attr("x2", d=> d.x2).attr("y2", d=> d.y2)
        .attr("class", d=> `arch-edge-v3 ${d.cls}`)
        .attr("opacity",1);

    // --- Edge Exit (v3) ---
    eSel_v3.exit().remove();


    /* --- LOSS CIRCLES (v3 - Improved Positions & Info) --- */
    const losses_v3 = [
        { id:"Lhm", x: backbone_v3.x+backbone_v3.w*0.5, y: backbone_v3.y+backbone_v3.h + 90, text:"Lhm", compId: "LhmLoss" }, // Below Backbone
        { id:"Lsm", x: head_v3.x+head_v3.w+150,        y: head_v3.y+head_v3.h*0.5,         text:"Lsm", compId: "LsmLoss" }, // Right of Head
        { id:"Lsp", x: embed_v3.x-100,                  y: embed_v3.y+embed_v3.h/2,         text:"Lsp", compId: "LspLoss" }  // Left of Embed
    ];
    const lSel_v3 = lossG_v3.selectAll("g.lossGroup-v3").data(losses_v3, d=> d.id);

    // --- Loss Circle Enter (v3) ---
    const lEnt_v3 = lSel_v3.enter().append("g")
        .attr("class","lossGroup-v3")
        .on("mouseover", (event, d) => {
            d3.select("#component-info-v3").text(getLossDetails(d.compId));
            d3.select(event.currentTarget).select("circle").classed("loss-circle-v3-hovered", true); // Example hover class
        })
        .on("mouseout", (event, d) => {
            d3.select("#component-info-v3").text("Hover or click on components for details.");
            d3.select(event.currentTarget).select("circle").classed("loss-circle-v3-hovered", false);
        })
        .on("click",(event,d)=>{ // Click info for loss circles
            d3.select("#instruction-box-v3").text(getLossDetailsLong(d.compId)); // More detailed info on click
        });


    lEnt_v3.append("circle")
        .attr("class","loss-circle-v3")
        .attr("cx", d=> d.x)
        .attr("cy", d=> d.y)
        .attr("r", 20) // Larger loss circles v3
        .attr("opacity", 0)
        .transition().duration(900)
            .attr("opacity",1); // Fade in
    lEnt_v3.append("text")
        .attr("class","loss-label-v3")
        .attr("x", d=> d.x)
        .attr("y", d=> d.y+6)
        .attr("text-anchor","middle")
        .text(d=> d.text);

    // --- Loss Circle Update (v3) ---
    lSel_v3.select("circle.loss-circle-v3")
        .transition().duration(900)
            .attr("cx", d=> d.x)
            .attr("cy", d=> d.y);
    lSel_v3.select("text.loss-label-v3")
        .transition().duration(900)
            .attr("x", d=> d.x)
            .attr("y", d=> d.y+6);

    // --- Loss Circle Exit (v3) ---
    lSel_v3.exit().remove();
}


function getLossDetails(lossId) {
    switch (lossId) {
        case "LhmLoss": return "Hard Loss Main (Lhm): Cross-entropy loss for current task accuracy.";
        case "LsmLoss": return "Soft Loss Main (Lsm): Knowledge Distillation loss to reduce forgetting.";
        case "LspLoss": return "Soft Loss Prototypes (Lsp): Distillation loss to maintain prototype consistency.";
        default:        return "Loss details.";
    }
}

function getLossDetailsLong(lossId) {
    switch (lossId) {
        case "LhmLoss": return "Hard Loss Main (Lhm): Standard cross-entropy loss, ensuring accurate classification on the current task data. Drives learning for new tasks.";
        case "LsmLoss": return "Soft Loss Main (Lsm): Knowledge Distillation loss, preserving knowledge from previous tasks by aligning current model's outputs with the previous model's outputs on old data. Mitigates catastrophic forgetting.";
        case "LspLoss": return "Soft Loss Prototypes (Lsp): Prototype Distillation loss, ensuring that the learned prototypes remain consistent and discriminative across different tasks. Stabilizes prototype representations over time.";
        default:        return "Detailed loss information.";
    }
}


/* -------- 8) Train Next Task Function (v3 - Dynamic Arc Positioning) -------- */
function trainNextTask_v3() {
    if(currentTask_v3 >= tasksData_v3.length) {
        d3.select("#instruction-box-v3").text("All tasks completed. Visualization complete.");
        return;
    }

    const newProtos_v3 = tasksData_v3[currentTask_v3].map((p,i)=>{
        const [rx, ry] = protoArcPos_v3(prototypes_v3.length + i, tasksData_v3[currentTask_v3].length + prototypes_v3.length); // Arc position
        return {
            id:`task${currentTask_v3}_p${i}`,
            label:p.label,
            img:p.img,
            x:rx, y:ry,
            filterStr:""
        };
    });
    prototypes_v3 = prototypes_v3.concat(newProtos_v3); // Add new prototypes

    prototypes_v3.forEach(augment_v3); // Augment

    render_v3(); // Render updated viz
    currentTask_v3++; // Inc task count
    d3.select("#instruction-box-v3")
        .text(`Task #${currentTask_v3} trained. New prototypes added and positioned dynamically. Explore the architecture!`);
    d3.select("#component-info-v3").text("Hover or click on components for details."); // Reset component info
}


/* -------- 9) Button Event & Initial Render (v3) -------- */
d3.select("#train-task-btn-v3").on("click", trainNextTask_v3); // Button event handler
render_v3(); // Initial render on load
