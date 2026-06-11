import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";


// ─── STRIVER A2Z SHEET DATA (NEW NESTED STRUCTURE) ─────────────────────────
const STRIVER_STEPS = [
{ step:1, title:"Learn the Basics", week:1, subtopics:[
  { name:"Things to Know in C++, Java, Python or any language", problems:[
      { title:"User Input / Output", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/user-input-output-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"Data Types", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/data-types-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"If Else statements", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/if-else-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"Switch Statement", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/switch-statement-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"arrays, strings", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/arrays-and-strings-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"For loops, while loops", yt:"https://youtu.be/FPvPEA0Bkoo", article:"https://takeuforward.org/c/loops-in-c/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Build-up Logical Thinking", problems:[
      { title:"Pattern 1", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-1/", practice:"https://takeuforward.org/plus" },
      { title:"Pattern 2", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-2/", practice:"https://takeuforward.org/plus" },
      { title:"Pattern 3", yt:"https://youtu.be/tNm_NNSB3_w", article:"https://takeuforward.org/pattern/pattern-3/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Learn STL", problems:[
      { title:"Pairs, Vectors, Maps, Sets", yt:"https://youtu.be/RRVYpIET_RU", article:"https://takeuforward.org/c/c-stl-tutorial-for-beginners/", practice:"https://takeuforward.org/plus" }
  ]},
  { name:"Know Basic Maths", problems:[
      { title:"Count Digits", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/count-digits-in-a-number/", practice:"https://leetcode.com/problems/count-primes/" },
      { title:"Reverse a Number", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/reverse-a-number/", practice:"https://leetcode.com/problems/reverse-integer/" },
      { title:"Check Palindrome", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-palindrome-or-not/", practice:"https://leetcode.com/problems/palindrome-number/" },
      { title:"GCD Or HCF", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/find-gcd-of-two-numbers/", practice:"https://leetcode.com/problems/find-greatest-common-divisor-of-array/" },
      { title:"Armstrong Numbers", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-armstrong-number-or-not/", practice:"https://leetcode.com/problems/armstrong-number/" },
      { title:"Print all Divisors", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/print-all-divisors-of-a-given-number/", practice:"https://takeuforward.org/plus" },
      { title:"Check for Prime", yt:"https://youtu.be/1xNbjMdbjug", article:"https://takeuforward.org/maths/check-if-a-number-is-prime-or-not/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Learn Basic Recursion", problems:[
      { title:"Understand recursion by print something N times", yt:"https://youtu.be/yVdKa8dnKiE", article:"https://takeuforward.org/recursion/print-name-n-times-using-recursion/", practice:"https://takeuforward.org/plus" },
      { title:"Print 1 to N using recursion", yt:"https://youtu.be/un6PLygfXrA", article:"https://takeuforward.org/recursion/print-1-to-n-using-recursion/", practice:"https://takeuforward.org/plus" },
      { title:"Print N to 1 using recursion", yt:"https://youtu.be/un6PLygfXrA", article:"https://takeuforward.org/recursion/print-n-to-1-using-recursion/", practice:"https://takeuforward.org/plus" },
      { title:"Sum of first N numbers", yt:"https://youtu.be/69ZCDFy-OUo", article:"https://takeuforward.org/recursion/sum-of-first-n-natural-numbers/", practice:"https://takeuforward.org/plus" },
      { title:"Factorial of N numbers", yt:"https://youtu.be/69ZCDFy-OUo", article:"https://takeuforward.org/recursion/factorial-of-a-number-iterative-and-recursive/", practice:"https://takeuforward.org/plus" },
      { title:"Reverse an array", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/data-structure/reverse-a-given-array/", practice:"https://leetcode.com/problems/reverse-string/" },
      { title:"Check if a string is palindrome or not", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/data-structure/check-if-the-given-string-is-palindrome-or-not/", practice:"https://leetcode.com/problems/valid-palindrome/" },
      { title:"Fibonacci Number", yt:"https://youtu.be/twuC1F6gLI8", article:"https://takeuforward.org/arrays/print-fibonacci-series-up-to-n-th-term/", practice:"https://leetcode.com/problems/fibonacci-number/" },
  ]},
  { name:"Learn Basic Hashing", problems:[
      { title:"Counting frequencies of array elements", yt:"https://youtu.be/KEs5UyBJ39g", article:"https://takeuforward.org/data-structure/count-frequency-of-each-element-in-the-array/", practice:"https://takeuforward.org/plus" },
      { title:"Find the highest/lowest frequency element", yt:"https://youtu.be/KEs5UyBJ39g", article:"https://takeuforward.org/arrays/find-the-highest-lowest-frequency-element/", practice:"https://takeuforward.org/plus" }
  ]}
]},
{ step:2, title:"Learn Important Sorting Techniques", week:1, subtopics:[
  { name:"Sorting-I", problems:[
      { title:"Selection Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/selection-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Bubble Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/bubble-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Insertion Sort", yt:"https://youtu.be/HGk_ypEuS24", article:"https://takeuforward.org/sorting/insertion-sort-algorithm/", practice:"https://takeuforward.org/plus" },
  ]},
  { name:"Sorting-II", problems:[
      { title:"Merge Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/data-structure/merge-sort-algorithm/", practice:"https://leetcode.com/problems/sort-an-array/" },
      { title:"Recursive Bubble Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/arrays/recursive-bubble-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Recursive Insertion Sort", yt:"https://youtu.be/ogjf7ORKfd8", article:"https://takeuforward.org/arrays/recursive-insertion-sort-algorithm/", practice:"https://takeuforward.org/plus" },
      { title:"Quick Sort", yt:"https://youtu.be/WIrA4YexLRQ", article:"https://takeuforward.org/data-structure/quick-sort-algorithm/", practice:"https://leetcode.com/problems/sort-an-array/" },
  ]}
]},
{ step:3, title:"Solve Problems on Arrays", week:2, subtopics:[
  { name:"Easy", problems:[
      { title:"Largest Element in Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/find-the-largest-element-in-an-array/", practice:"https://takeuforward.org/plus" },
      { title:"Second Largest Element in Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/find-second-smallest-and-second-largest-element-in-an-array/", practice:"https://takeuforward.org/plus" },
      { title:"Check if array is sorted", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/check-if-an-array-is-sorted/", practice:"https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/" },
      { title:"Remove Duplicates from Sorted Array", yt:"https://youtu.be/37E9ckMDdTk", article:"https://takeuforward.org/data-structure/remove-duplicates-in-place-from-sorted-array/", practice:"https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
      { title:"Left Rotate the Array by One", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/left-rotate-the-array-by-one/", practice:"https://takeuforward.org/plus" },
      { title:"Rotate array by K elements", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/rotate-array-by-k-elements/", practice:"https://leetcode.com/problems/rotate-array/" },
      { title:"Move Zeroes to End", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/move-all-zeros-to-the-end-of-the-array/", practice:"https://leetcode.com/problems/move-zeroes/" },
      { title:"Linear Search", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/linear-search-in-c/", practice:"https://takeuforward.org/plus" },
      { title:"Union of Two Sorted Arrays", yt:"https://youtu.be/wvcQg43_V8U", article:"https://takeuforward.org/data-structure/union-of-two-sorted-arrays/", practice:"https://takeuforward.org/plus" },
      { title:"Find missing number in an array", yt:"https://youtu.be/581L8kC8A_E", article:"https://takeuforward.org/arrays/find-the-missing-number-in-an-array/", practice:"https://leetcode.com/problems/missing-number/" },
      { title:"Maximum Consecutive Ones", yt:"https://youtu.be/bYWLJb3vCWY", article:"https://takeuforward.org/data-structure/count-maximum-consecutive-ones-in-the-array/", practice:"https://leetcode.com/problems/max-consecutive-ones/" },
      { title:"Find the number that appears once", yt:"https://youtu.be/bYWLJb3vCWY", article:"https://takeuforward.org/arrays/find-the-number-that-appears-once-and-the-other-numbers-twice/", practice:"https://leetcode.com/problems/single-number/" },
  ]},
  { name:"Medium", problems:[
      { title:"Two Sum", yt:"https://youtu.be/UXDSeD9mN-k", article:"https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/", practice:"https://leetcode.com/problems/two-sum/" },
      { title:"Sort Colors (Dutch Flag)", yt:"https://youtu.be/tp8JIuCXBaU", article:"https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/", practice:"https://leetcode.com/problems/sort-colors/" },
      { title:"Majority Element (>N/2 times)", yt:"https://youtu.be/nP_ns3uSh80", article:"https://takeuforward.org/data-structure/find-the-majority-element-that-occurs-more-than-n-2-times/", practice:"https://leetcode.com/problems/majority-element/" },
      { title:"Kadane's Algorithm", yt:"https://youtu.be/AHZpyENo7kM", article:"https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/", practice:"https://leetcode.com/problems/maximum-subarray/" },
  ]},
  { name:"Hard", problems:[
      { title:"Pascal's Triangle", yt:"https://youtu.be/bR7mQgwQ_o8", article:"https://takeuforward.org/data-structure/program-to-generate-pascals-triangle/", practice:"https://leetcode.com/problems/pascals-triangle/" },
      { title:"Majority Element (>N/3 times)", yt:"https://youtu.be/vwZj1K0e9U8", article:"https://takeuforward.org/data-structure/majority-elements-n-3-times-find-the-elements-that-appears-more-than-n-3-times-in-the-array/", practice:"https://leetcode.com/problems/majority-element-ii/" },
  ]}
]}
];

// Provide placeholders for Step 4 to 17 so we don't drop them
for(let i=4; i<=17; i++) {
  STRIVER_STEPS.push({
    step: i, title: `Step ${i} Placeholder`, week: Math.floor(i/2), subtopics: [
      { name: "Placeholder Topic", problems: [
        { title: `Problem ${i}.1`, yt: "https://youtu.be/...", article: "https://takeuforward.org/", practice: "https://leetcode.com/" },
        { title: `Problem ${i}.2`, yt: "https://youtu.be/...", article: "https://takeuforward.org/", practice: "https://leetcode.com/" },
      ]}
    ]
  });
}


const STEP_LEETCODE = {};
STRIVER_STEPS.forEach(step => { STEP_LEETCODE[step.step] = step.subtopics.flatMap(sub => sub.problems.map(p => ({ title: p.title, url: p.practice }))); });
const DSA_TABLE = STRIVER_STEPS.flatMap(step =>
step.subtopics.map((sub, si) => ({
id: `s${step.step}_${si}`,
step: step.step,
stepTitle: step.title,
topic: sub.name,
problems: sub.problems.length,
solved: 0,
confidence: 0,
revisionRequired: false,
status: "pending",
week: step.week,
}))
);

// ─── COA DATA (Nesa Academy – Computer Organization & Architecture) ──────────
const COA_TABLE = [
  { id:"coa_01", topic:"Introduction to Computer Organization", week:1, subtopics:"Overview, Von Neumann architecture, basic components", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_02", topic:"Number Systems & Data Representation", week:1, subtopics:"Binary, Octal, Hex, BCD, IEEE 754 floating point", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_03", topic:"Boolean Algebra & Logic Gates", week:1, subtopics:"AND, OR, NOT, NAND, NOR, XOR, truth tables, simplification", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_04", topic:"Combinational Circuits", week:2, subtopics:"Adders, subtractors, multiplexers, demultiplexers, encoders, decoders", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_05", topic:"Sequential Circuits", week:2, subtopics:"Flip-flops (SR, JK, D, T), registers, counters", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_06", topic:"CPU Organisation & Instruction Set", week:3, subtopics:"ALU, control unit, registers, instruction formats, addressing modes", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_07", topic:"Instruction Cycle & Microprogramming", week:3, subtopics:"Fetch-decode-execute, micro-operations, hardwired vs microprogrammed control", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_08", topic:"Pipelining", week:4, subtopics:"Pipeline stages, hazards (structural, data, control), solutions", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_09", topic:"Memory Organisation", week:4, subtopics:"Hierarchy, cache (direct, associative, set-associative), virtual memory, paging", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_10", topic:"Input / Output Organisation", week:5, subtopics:"I/O interfaces, programmed I/O, interrupt-driven I/O, DMA", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_11", topic:"Buses & Interconnects", week:5, subtopics:"Bus structure, synchronous vs asynchronous, arbitration, PCI/PCIe basics", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_12", topic:"Arithmetic Operations in Hardware", week:6, subtopics:"Integer addition/subtraction, multiplication (Booth's), division, floating-point ops", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_13", topic:"RISC vs CISC", week:6, subtopics:"Design philosophy, pipeline friendliness, examples (x86 vs ARM)", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_14", topic:"Parallel Processing", week:7, subtopics:"Flynn's taxonomy, SIMD/MIMD, multiprocessors, cache coherence", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_15", topic:"Performance Metrics & Optimisation", week:7, subtopics:"CPI, MIPS, Amdahl's law, branch prediction, out-of-order execution", practiceTarget:2, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_16", topic:"Assembly Language Basics", week:8, subtopics:"Registers, MOV/ADD/SUB/JMP, stack operations, calling conventions", practiceTarget:3, confidence:0, revisionRequired:false, status:"pending" },
  { id:"coa_17", topic:"Revision & Past Papers", week:8, subtopics:"Previous year questions, formula sheet, Nesa model papers", practiceTarget:4, confidence:0, revisionRequired:false, status:"pending" },
];

// ─── WEEK PLAN (8-week roadmap mapping DSA steps to COA weeks) ───────────────
const WEEK_PLAN = [
  { week:1, title:"Basics, Sorting & Arrays (Easy)", dsaSteps:[1,2], coaWeek:1 },
  { week:2, title:"Arrays (Medium/Hard) & Strings", dsaSteps:[3], coaWeek:2 },
  { week:3, title:"Searching, Recursion & Backtracking", dsaSteps:[4,5], coaWeek:3 },
  { week:4, title:"Binary Trees & BST", dsaSteps:[6,7], coaWeek:4 },
  { week:5, title:"Linked Lists & Stacks/Queues", dsaSteps:[8,9], coaWeek:5 },
  { week:6, title:"Greedy, Binary Search & Heaps", dsaSteps:[10,11], coaWeek:6 },
  { week:7, title:"Graphs & Dynamic Programming", dsaSteps:[12,13,14], coaWeek:7 },
  { week:8, title:"Advanced DP, Tries & Revision", dsaSteps:[15,16,17], coaWeek:8 },
];

const ALL_REV_TOPICS = [
...STRIVER_STEPS.map(s => ({ id:`rev_dsa_s${s.step}`, topic:`Step ${s.step}: ${s.title}`, type:"DSA", week:s.week,
day:false, week1:false, month:false })),
...COA_TABLE.map(c => ({ id:`rev_${c.id}`, topic:c.topic, type:"COA", week:c.week, day:false, week1:false, month:false
})),
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function useLocalStorage(key, init) {
const [val, setVal] = useState(() => {
try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (typeof init==="function" ? init() : init); }
catch { return typeof init==="function" ? init() : init; }
});
useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
return [val, setVal];
}

const WEEK_COLORS = ["#818cf8","#34d399","#f472b6","#fb923c","#60a5fa","#a78bfa","#facc15","#4ade80"];
const STEP_COLORS =
{1:"#818cf8",2:"#a78bfa",3:"#34d399",4:"#4ade80",5:"#f472b6",6:"#fb7185",7:"#fb923c",8:"#fbbf24",9:"#60a5fa",10:"#38bdf8",11:"#22d3ee",12:"#34d399",13:"#86efac",14:"#6ee7b7",15:"#f472b6",16:"#e879f9",17:"#c084fc"};

const S = {
app: { display:"flex", height:"100vh", background:"#0a0b0d", color:"#e2e8f0", fontFamily:"'DM Sans','Inter',sans-serif",
overflow:"hidden" },
sidebar: { width:220, background:"#0f1117", borderRight:"1px solid #1e2030", display:"flex", flexDirection:"column",
flexShrink:0 },
sidebarTop: { padding:"20px 16px 12px", borderBottom:"1px solid #1e2030" },
logo: { fontSize:14, fontWeight:700, color:"#e2e8f0", letterSpacing:"0.05em", textTransform:"uppercase" },
logoSub: { fontSize:11, color:"#4a5568", marginTop:2 },
nav: { padding:"8px 8px", flex:1, overflowY:"auto" },
navItem: (active) => ({ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8,
cursor:"pointer", marginBottom:2, background: active?"#1a1d2e":"transparent", color: active?"#818cf8":"#64748b",
fontSize:13, fontWeight: active?600:400, transition:"all 0.15s", border: active?"1px solid #2d3154":"1px solid transparent" }),
main: { flex:1, overflowY:"auto", padding:"24px 28px", background:"#0a0b0d" },
pageTitle: { fontSize:22, fontWeight:700, color:"#f1f5f9", marginBottom:4 },
pageSub: { fontSize:13, color:"#475569", marginBottom:24 },
grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 },
grid3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:20 },
grid4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 },
statCard: { background:"#0f1117", border:"1px solid #1e2030", borderRadius:12, padding:"16px 18px" },
statLabel: { fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 },
statValue: { fontSize:28, fontWeight:700, color:"#f1f5f9", lineHeight:1 },
statSub: { fontSize:12, color:"#64748b", marginTop:6 },
card: { background:"#0f1117", border:"1px solid #1e2030", borderRadius:12, padding:"18px 20px", marginBottom:16 },
sectionTitle: { fontSize:13, fontWeight:600, color:"#94a3b8", marginBottom:14, textTransform:"uppercase",
letterSpacing:"0.06em" },
badge: (color) => ({ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:20, fontSize:11,
fontWeight:600, background: color==="green"?"#0d2a1a":color==="blue"?"#0d1a2a":color==="amber"?"#2a1a0d":"#1a1a2a",
color: color==="green"?"#34d399":color==="blue"?"#60a5fa":color==="amber"?"#fbbf24":"#a78bfa" }),
table: { width:"100%", borderCollapse:"collapse", fontSize:12 },
th: { padding:"10px 12px", textAlign:"left", color:"#475569", fontWeight:600, fontSize:10, textTransform:"uppercase",
letterSpacing:"0.06em", borderBottom:"1px solid #1e2030" },
td: { padding:"9px 12px", borderBottom:"1px solid #0f1117", color:"#94a3b8", verticalAlign:"middle" },
input: { background:"#1a1d2e", border:"1px solid #2d3154", borderRadius:6, color:"#e2e8f0", padding:"3px 7px",
fontSize:12, width:55, outline:"none" },
select: { background:"#1a1d2e", border:"1px solid #2d3154", borderRadius:6, color:"#e2e8f0", padding:"4px 8px",
fontSize:12, outline:"none", cursor:"pointer" },
btn: (variant="default") => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8,
fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.15s", background:
variant==="primary"?"#4f46e5":variant==="success"?"#14532d":"#1e2030", color:
variant==="primary"?"#fff":variant==="success"?"#86efac":"#94a3b8" }),
filterBar: { display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" },
searchInput: { background:"#0f1117", border:"1px solid #1e2030", borderRadius:8, color:"#e2e8f0", padding:"8px 14px",
fontSize:13, outline:"none", flex:1, minWidth:200 },
check: { width:15, height:15, cursor:"pointer", accentColor:"#818cf8" },
streakBox: { background:"linear-gradient(135deg,#1a1d2e,#13162a)", border:"1px solid #2d3154", borderRadius:12,
padding:"16px 18px", display:"flex", alignItems:"center", gap:12, marginBottom:20 },
confetti: { position:"fixed", inset:0, pointerEvents:"none", zIndex:9999 },
lcLink: { display:"inline-flex", alignItems:"center", gap:4, color:"#f97316", fontSize:11, fontWeight:600,
textDecoration:"none", background:"#1c1108", border:"1px solid #431407", borderRadius:5, padding:"2px 7px",
marginRight:4, marginBottom:3, transition:"background 0.15s", whiteSpace:"nowrap" },
lcPanel: { background:"#0d0e12", border:"1px solid #1e2030", borderRadius:"0 0 10px 10px", padding:"12px 16px" },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Confetti({ active, onDone }) {
const ref = useRef(null);
useEffect(() => {
if (!active) return;
const canvas = ref.current; if (!canvas) return;
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const pieces = Array.from({length:120}, () => ({ x:Math.random()*canvas.width, y:-10, r:Math.random()*5+3,
d:Math.random()*80+80, color:`hsl(${Math.random()*360},70%,60%)`, tilt:Math.random()*10-5, tiltAngle:0,
tiltAngleIncrementor:Math.random()*0.07+0.05 }));
let frame; let count=0;
function animate() {
ctx.clearRect(0,0,canvas.width,canvas.height);
pieces.forEach(p => { p.tiltAngle+=p.tiltAngleIncrementor; p.y+=Math.cos(p.d)+1; p.x+=Math.sin(p.tiltAngle)*2;
p.tilt=Math.sin(p.tiltAngle)*12; ctx.beginPath(); ctx.lineWidth=p.r; ctx.strokeStyle=p.color;
ctx.moveTo(p.x+p.tilt+p.r/3,p.y); ctx.lineTo(p.x+p.tilt,p.y+p.r/2); ctx.stroke(); });
count++; if(count<150) frame=requestAnimationFrame(animate); else { ctx.clearRect(0,0,canvas.width,canvas.height);
    onDone(); } } animate(); return ()=>cancelAnimationFrame(frame);
    }, [active]);
    if (!active) return null;
    return <canvas ref={ref} style={S.confetti} />;
    }

    function PBar({ pct, color="#818cf8", height=4 }) {
    return <div style={{height, background:"#1e2030", borderRadius:4, overflow:"hidden"}}>
        <div style={{height:"100%", width:`${Math.min(100,Math.max(0,pct))}%`, background:color, borderRadius:4,
            transition:"width 0.5s ease"}} />
    </div>;
    }

    function StatCard({ label, value, sub, pct, color="#818cf8", icon }) {
    return <div style={S.statCard}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={S.statLabel}>{label}</div>
            {icon && <span style={{fontSize:18,opacity:0.5}}>{icon}</span>}
        </div>
        <div style={S.statValue}>{value}</div>
        {sub && <div style={S.statSub}>{sub}</div>}
        {pct !== undefined &&
        <PBar pct={pct} color={color} />}
    </div>;
    }

    // LeetCode links panel
    function LCLinks({ step }) {
    const links = STEP_LEETCODE[step] || [];
    if (!links.length) return null;
    return (
    <div style={S.lcPanel}>
        <div
            style={{fontSize:10,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
            <span>🔗</span> LeetCode Problems for Step {step}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {links.map((l,i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={S.lcLink}
                onMouseEnter={e=>e.currentTarget.style.background="#2c1a08"}
                onMouseLeave={e=>e.currentTarget.style.background="#1c1108"}>
                ↗ {l.title}
            </a>
            ))}
        </div>
    </div>
    );
    }

    // ─── DASHBOARD ────────────────────────────────────────────────────────────────
    function Dashboard({ dsaData, coaData, weekStatus, streak, dailyLog, setDailyLog }) {
    const [logNote, setLogNote] = useState("");
    const today = new Date().toISOString().slice(0,10);

    const dsaDone = dsaData.filter(d=>d.status==="done").length;
    const coaDone = coaData.filter(d=>d.status==="done").length;
    const totalProblems = dsaData.reduce((a,d)=>a+d.problems,0);
    const solvedProblems = dsaData.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);
    const overallPct = Math.round((dsaDone+coaDone)/(dsaData.length+coaData.length)*100);
    const weeksDone = weekStatus.filter(Boolean).length;

    function addLog() {
    if (!logNote.trim()) return;
    setDailyLog(prev => [{date:today,note:logNote.trim(),ts:Date.now()},...prev.slice(0,19)]);
    setLogNote("");
    }

    const weekChartData = WEEK_PLAN.map((w,i) => {
    const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
    const cs = coaData.filter(d=>d.week===w.coaWeek);
    const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
    const tot = ds.length + cs.length;
    return { name:`W${w.week}`, pct: tot?Math.round(done/tot*100):0, color: WEEK_COLORS[i] };
    });

    const stepProgress = STRIVER_STEPS.map(s => ({
    name:`S${s.step}`, title:s.title,
    done: dsaData.filter(d=>d.step===s.step&&d.status==="done").length,
    total: s.subtopics.length,
    color: STEP_COLORS[s.step]
    }));

    return <div>
        <div style={S.pageTitle}>Good morning, Engineer 👋</div>
        <div style={{...S.pageSub, marginBottom:16}}>SRM KTR · Semester Break · Striver A2Z Sheet (474 problems) + Nesa
            COA</div>

        <div style={S.streakBox}>
            <span style={{fontSize:28}}>🔥</span>
            <div>
                <div style={{fontSize:20,fontWeight:700,color:"#fb923c"}}>{streak} day streak</div>
                <div style={{fontSize:12,color:"#64748b"}}>Consistency beats intensity. Keep coding daily!</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <input value={logNote} onChange={e=>setLogNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLog()}
                placeholder="Log today's session…" style={{...S.searchInput,width:260,marginBottom:0}}/>
                <button onClick={addLog} style={S.btn("primary")}>Log</button>
            </div>
        </div>

        <div style={S.grid4}>
            <StatCard label="DSA Subtopics" value={`${dsaDone}/${dsaData.length}`}
                pct={Math.round(dsaDone/dsaData.length*100)} color="#818cf8" icon="◈" />
            <StatCard label="Problems Solved" value={`${solvedProblems}/${totalProblems}`}
                pct={Math.round(solvedProblems/totalProblems*100)} color="#60a5fa" icon="✦" />
            <StatCard label="COA Topics" value={`${coaDone}/${coaData.length}`}
                pct={Math.round(coaDone/coaData.length*100)} color="#34d399" icon="◉" />
            <StatCard label="Overall Progress" value={`${overallPct}%`} sub={`${weeksDone}/8 weeks done`}
                pct={overallPct} color="#fb923c" icon="★" />
        </div>

        <div style={S.grid2}>
            <div style={S.card}>
                <div style={S.sectionTitle}>Weekly Progress</div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekChartData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="name" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} formatter={v=>[`${v}%`,"Progress"]}/>
                            {weekChartData.map((w,i)=>
                            <Bar key={i} dataKey="pct" fill={w.color} radius={[4,4,0,0]} />)}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Striver A2Z – Step Progress</div>
                <div style={{maxHeight:180,overflowY:"auto"}}>
                    {stepProgress.map((s,i) => <div key={i} style={{marginBottom:7}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                            <span style={{fontSize:11,color:"#94a3b8"}}>S{i+1}: {s.title}</span>
                            <span style={{fontSize:11,fontWeight:600,color:s.color}}>{s.done}/{s.total}</span>
                        </div>
                        <PBar pct={s.total?Math.round(s.done/s.total*100):0} color={s.color} height={3} />
                    </div>)}
                </div>
            </div>
        </div>

        <div style={{...S.grid2, gridTemplateColumns:"2fr 1fr"}}>
            <div style={S.card}>
                <div style={S.sectionTitle}>8-Week Roadmap</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                    {WEEK_PLAN.map((w,i) => {
                    const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
                    const cs = coaData.filter(d=>d.week===w.coaWeek);
                    const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
                    const tot = ds.length + cs.length;
                    const pct = tot ? Math.round(done/tot*100) : 0;
                    return <div key={i} style={{background:weekStatus[i]?"#0d2a1a":"#0a0b0d",border:`1px solid
                        ${weekStatus[i]?"#1a3a3a":"#1e2030"}`,borderRadius:8,padding:"10px 12px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <span style={{fontSize:12,fontWeight:700,color:WEEK_COLORS[i]}}>Week {w.week}</span>
                            {weekStatus[i] && <span>✓</span>}
                        </div>
                        <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{w.title}</div>
                        <PBar pct={pct} color={WEEK_COLORS[i]} height={3} />
                        <div style={{fontSize:10,color:"#475569",marginTop:3}}>{pct}%</div>
                    </div>;
                    })}
                </div>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Daily Log</div>
                {dailyLog.length===0 && <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"16px 0"}}>
                    No entries yet.</div>}
                <div style={{maxHeight:170,overflowY:"auto"}}>
                    {dailyLog.map((l,i) => <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px                         solid #1e2030"}}>
                        <span style={{fontSize:10,color:"#475569",whiteSpace:"nowrap",marginTop:2}}>{l.date}</span>
                        <span style={{fontSize:12,color:"#94a3b8"}}>{l.note}</span>
                    </div>)}
                </div>
            </div>
        </div>
    </div>;
    }

    // ─── DSA TRACKER ─────────────────────────────────────────────────────────────
    function DSATracker({ dsaData, setDsaData }) {
    const [search, setSearch] = useState("");
    const [expandedStep, setExpandedStep] = useState(null);
    const [expandedSub, setExpandedSub] = useState(null);
    const [solvedQuestions, setSolvedQuestions] = useLocalStorage("a2z_solved", {});

    function toggleSolved(stepNum, subIdx, probIdx) {
        const key = `s${stepNum}_${subIdx}_${probIdx}`;
        setSolvedQuestions(prev => {
            const isSolved = !prev[key];
            const next = { ...prev, [key]: isSolved };
            // Update dsaData count
            const subId = `s${stepNum}_${subIdx}`;
            const totalSolved = Object.keys(next).filter(k => k.startsWith(`s${stepNum}_${subIdx}_`) && next[k]).length;
            
            setDsaData(curr => curr.map(d => {
                if (d.id !== subId) return d;
                return { 
                    ...d, 
                    solved: totalSolved,
                    status: totalSolved >= d.problems ? "done" : totalSolved > 0 ? "inprogress" : "pending"
                };
            }));
            
            return next;
        });
    }

    const totalProblems = dsaData.reduce((a,d)=>a+d.problems,0);
    const solvedProbs = dsaData.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);
    const doneSubs = dsaData.filter(d=>d.status==="done").length;

    const filteredSteps = STRIVER_STEPS.map(s => {
        return {
            ...s,
            subtopics: s.subtopics.map((sub, si) => {
                const subId = `s${s.step}_${si}`;
                const match = !search || sub.name.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase());
                return match ? sub : null;
            }).filter(Boolean)
        };
    }).filter(s => s.subtopics.length > 0);

    return <div>
        <div style={S.pageTitle}>DSA Tracker</div>
        <div style={{...S.pageSub,marginBottom:12}}>Striver A2Z · 17 Steps · 474 Problems · {doneSubs}/{dsaData.length} subtopics · {solvedProbs}/{totalProblems} problems solved</div>
        <PBar pct={totalProblems ? Math.round(solvedProbs/totalProblems*100) : 0} color="#818cf8" height={5} />
        <div style={{marginBottom:16}} />

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
            {[{l:"Total Problems",v:totalProblems,c:"#818cf8"},{l:"Subtopics Solved",v:solvedProbs,c:"#34d399"},{l:"Subtopics Done",v:doneSubs,c:"#60a5fa"},{l:"Completion",v:`${totalProblems ? Math.round(solvedProbs/totalProblems*100) : 0}%`,c:"#fb923c"}].map((s,i)=>
            <div key={i} style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:10,padding:"12px 14px"}}>
                <div style={S.statLabel}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
            )}
        </div>

        <div style={S.filterBar}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subtopics or steps…" style={S.searchInput}/>
        </div>

        {filteredSteps.map(sg => {
            const exp = expandedStep === sg.step;
            const stepProbs = sg.subtopics.reduce((a,sub)=>a+sub.problems.length,0);
            const stepSolved = sg.subtopics.reduce((a,sub,si)=>{
                return a + sub.problems.filter((_,pi)=>solvedQuestions[`s${sg.step}_${si}_${pi}`]).length;
            },0);

            return <div key={sg.step} style={{marginBottom:10}}>
                <div onClick={()=>setExpandedStep(exp?null:sg.step)} style={{background:"#0f1117",border:`1px solid ${exp?"#2d3154":"#1e2030"}`,borderRadius: exp?"10px 10px 0 0":10,padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:30,height:30,borderRadius:7,background:(STEP_COLORS[sg.step]||"#fff")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:STEP_COLORS[sg.step]||"#fff"}}>S{sg.step}</div>
                        <div>
                            <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{sg.title}</div>
                            <div style={{fontSize:11,color:"#475569"}}>{stepSolved}/{stepProbs} problems · Week {sg.week||1}</div>
                        </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:80}}>
                            <PBar pct={stepProbs ? Math.round(stepSolved/stepProbs*100) : 0} color={STEP_COLORS[sg.step]||"#fff"} />
                        </div>
                        <span style={{fontSize:13,fontWeight:700,color:STEP_COLORS[sg.step]||"#fff"}}>{stepProbs ? Math.round(stepSolved/stepProbs*100) : 0}%</span>
                        <span style={{color:"#475569"}}>{exp?"▲":"▼"}</span>
                    </div>
                </div>
                
                {exp && <div style={{background:"#0a0b0d",border:"1px solid #1e2030",borderTop:"none",padding:"12px",borderRadius:"0 0 10px 10px"}}>
                    {sg.subtopics.map((sub, si) => {
                        const subId = `s${sg.step}_${si}`;
                        const subExp = expandedSub === subId;
                        const subSolved = sub.problems.filter((_,pi)=>solvedQuestions[`s${sg.step}_${si}_${pi}`]).length;
                        
                        return <div key={si} style={{marginBottom:8, border:"1px solid #1e2030", borderRadius:6, overflow:"hidden"}}>
                            <div onClick={()=>setExpandedSub(subExp?null:subId)} style={{background:"#11131a", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer"}}>
                                <div style={{fontSize:13, fontWeight:600, color:"#cbd5e1"}}>Step {sg.step}.{si+1}: {sub.name}</div>
                                <div style={{display:"flex", alignItems:"center", gap:10}}>
                                    <div style={{fontSize:11, color:"#64748b"}}>{subSolved}/{sub.problems.length} Solved</div>
                                    <span style={{color:"#475569", fontSize:12}}>{subExp?"▲":"▼"}</span>
                                </div>
                            </div>
                            
                            {subExp && <div style={{background:"#0a0b0d"}}>
                                <table style={{width:"100%", borderCollapse:"collapse", fontSize:12, textAlign:"left"}}>
                                    <thead>
                                        <tr style={{borderBottom:"1px solid #1e2030", color:"#64748b"}}>
                                            <th style={{padding:"8px 12px", width:40}}>Status</th>
                                            <th style={{padding:"8px 12px"}}>Problem</th>
                                            <th style={{padding:"8px 12px", width:60}}>Article</th>
                                            <th style={{padding:"8px 12px", width:60}}>YouTube</th>
                                            <th style={{padding:"8px 12px", width:60}}>Practice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sub.problems.map((p, pi) => {
                                            const isDone = !!solvedQuestions[`s${sg.step}_${si}_${pi}`];
                                            return <tr key={pi} style={{borderBottom:"1px solid #1e2030", background:isDone?"#052e1620":"transparent", transition:"0.2s"}}>
                                                <td style={{padding:"8px 12px"}}>
                                                    <input type="checkbox" checked={isDone} onChange={()=>toggleSolved(sg.step, si, pi)} style={{accentColor:"#34d399", cursor:"pointer"}} />
                                                </td>
                                                <td style={{padding:"8px 12px", color:isDone?"#34d399":"#e2e8f0", textDecoration:isDone?"line-through":"none"}}>{p.title}</td>
                                                <td style={{padding:"8px 12px"}}>
                                                    {p.article && <a href={p.article} target="_blank" rel="noreferrer" style={{color:"#60a5fa", textDecoration:"none"}}>📝</a>}
                                                </td>
                                                <td style={{padding:"8px 12px"}}>
                                                    {p.yt && <a href={p.yt} target="_blank" rel="noreferrer" style={{color:"#ef4444", textDecoration:"none"}}>▶️</a>}
                                                </td>
                                                <td style={{padding:"8px 12px"}}>
                                                    {p.practice && <a href={p.practice} target="_blank" rel="noreferrer" style={{color:"#f97316", textDecoration:"none"}}>💻</a>}
                                                </td>
                                            </tr>
                                        })}
                                    </tbody>
                                </table>
                            </div>}
                        </div>
                    })}
                </div>}
            </div>
        })}
    </div>;
}

    // ─── COA TRACKER ─────────────────────────────────────────────────────────────
    function COATracker({ coaData, setCoaData }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [weekFilter, setWeekFilter] = useState("all");

    function update(id, field, val) { setCoaData(prev=>prev.map(d=>d.id===id?{...d,[field]:val}:d)); }

    const filtered = coaData.filter(d => {
    const q = search.toLowerCase();
    return (!q||d.topic.toLowerCase().includes(q)||d.subtopics.toLowerCase().includes(q))
    && (filter==="all"||d.status===filter)
    && (weekFilter==="all"||String(d.week)===weekFilter);
    });
    const done = coaData.filter(d=>d.status==="done").length;

    return <div>
        <div style={S.pageTitle}>COA Tracker</div>
        <div style={{...S.pageSub,marginBottom:12}}>Nesa Academy · Computer Organization & Architecture ·
            {done}/{coaData.length} topics done</div>
        <PBar pct={Math.round(done/coaData.length*100)} color="#34d399" height={5} />
        <div style={{marginBottom:16}} />

        <div style={S.filterBar}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search COA topics…"
            style={S.searchInput}/>
            <select value={filter} onChange={e=>setFilter(e.target.value)} style={S.select}>
                <option value="all">All Status</option>
                <option value="done">Done ✓</option>
                <option value="inprogress">In Progress</option>
                <option value="pending">Pending</option>
            </select>
            <select value={weekFilter} onChange={e=>setWeekFilter(e.target.value)} style={S.select}>
                <option value="all">All Weeks</option>
                {[1,2,3,4,5,6,7,8].map(w=><option key={w} value={w}>Week {w}</option>)}
            </select>
        </div>

        <div style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:12,overflow:"hidden"}}>
            <table style={S.table}>
                <thead>
                    <tr>
                        {["Topic","Week","Subtopics Covered","Practice                         Target","Confidence","Revision?","Status"].map(h=>
                        <th key={h} style={S.th}>{h}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(d => <tr key={d.id} style={{background:d.status==="done"
                        ?"#0d1a0d":d.status==="inprogress" ?"#0d0d1a":"transparent"}}>
                        <td style={{...S.td,color:"#e2e8f0",fontWeight:600}}>{d.topic}</td>
                        <td style={S.td}><span style={S.badge("green")}>W{d.week}</span></td>
                        <td style={{...S.td,fontSize:11,maxWidth:240}}>{d.subtopics}</td>
                        <td style={S.td}>{d.practiceTarget} sessions</td>
                        <td style={S.td}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                                <input type="range" min={0} max={10} value={d.confidence}
                                    onChange={e=>update(d.id,"confidence",Number(e.target.value))}
                                style={{width:65,accentColor:"#34d399"}}/>
                                <span
                                    style={{fontSize:11,color:"#34d399",fontWeight:700,minWidth:14}}>{d.confidence}</span>
                            </div>
                        </td>
                        <td style={S.td}><input type="checkbox" checked={d.revisionRequired}
                                onChange={e=>update(d.id,"revisionRequired",e.target.checked)} style={S.check}/></td>
                        <td style={S.td}>
                            <select value={d.status} onChange={e=>update(d.id,"status",e.target.value)}
                                style={{...S.select,background:d.status==="done"?"#14532d":d.status==="inprogress"?"#1e1b4b":"#1a1d2e",color:d.status==="done"?"#86efac":d.status==="inprogress"?"#a5b4fc":"#94a3b8"}}>
                                <option value="pending">Pending</option>
                                <option value="inprogress">In Progress</option>
                                <option value="done">Done ✓</option>
                            </select>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            {filtered.length===0 && <div style={{padding:"32px",textAlign:"center",color:"#475569"}}>No topics found.
            </div>}
        </div>
    </div>;
    }

    // ─── WEEKLY PLANNER ───────────────────────────────────────────────────────────
    function WeeklyPlanner({ dsaData, coaData, weekStatus, setWeekStatus, onCelebrate }) {
    const [expanded, setExpanded] = useState(null);
    const [lcExpanded, setLcExpanded] = useState(null);

    function toggleWeek(i) {
    const next = [...weekStatus]; next[i]=!next[i];
    if (next[i] && !weekStatus[i]) onCelebrate();
    setWeekStatus(next);
    }

    return <div>
        <div style={S.pageTitle}>Weekly Planner</div>
        <div style={S.pageSub}>8-Week Study Roadmap · Striver A2Z (17 Steps) + Nesa COA · Click to expand</div>
        {WEEK_PLAN.map((w,i) => {
        const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
        const cs = coaData.filter(d=>d.week===w.coaWeek);
        const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
        const tot = ds.length + cs.length;
        const pct = tot ? Math.round(done/tot*100) : 0;
        const exp = expanded === i;
        const lcExp = lcExpanded === i;
        const stepsInWeek = STRIVER_STEPS.filter(s=>w.dsaSteps.includes(s.step));
        // Gather all LC links for this week's steps
        const weekLCLinks = w.dsaSteps.flatMap(step => (STEP_LEETCODE[step]||[]).map(l=>({...l,step})));

        return <div key={i} style={{marginBottom:10}}>
            <div style={{background:weekStatus[i]?"#0d1a0d":"#0f1117",border:`1px solid
                ${weekStatus[i]?"#1a3a3a":exp?"#2d3154":"#1e2030"}`,borderRadius: (exp||lcExp)?"10px 10px 0                 0":10,padding:"14px                 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>
                setExpanded(exp?null:i)}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div
                        style={{width:34,height:34,borderRadius:8,background:WEEK_COLORS[i]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:WEEK_COLORS[i]}}>
                        W{w.week}</div>
                    <div>
                        <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{w.title}</div>
                        <div style={{fontSize:11,color:"#475569"}}>Steps {w.dsaSteps.join(", ")} · {ds.length} subtopics
                            · {cs.length} COA topics</div>
                    </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button onClick={e=>{e.stopPropagation();setLcExpanded(lcExp?null:i);}}
                        style={{...S.btn("default"),padding:"3px                         9px",fontSize:11,background:lcExp?"#2c1a08":"#1e2030",color:lcExp?"#f97316":"#64748b",border:lcExp?"1px                         solid #431407":"none"}}>
                        🔗 LeetCode ({weekLCLinks.length})
                    </button>
                    <div style={{width:100}}>
                        <PBar pct={pct} color={WEEK_COLORS[i]} />
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:WEEK_COLORS[i]}}>{pct}%</span>
                    <button onClick={e=>{e.stopPropagation();toggleWeek(i);}}
                        style={{...S.btn(weekStatus[i]?"success":"default"),padding:"4px 10px",fontSize:12}}>
                        {weekStatus[i]?"✓ Done":"Mark Done"}
                    </button>
                    <span style={{color:"#475569"}}
                        onClick={e=>{e.stopPropagation();setExpanded(exp?null:i);}}>{exp?"▲":"▼"}</span>
                </div>
            </div>

            {lcExp && <div style={{background:"#0d0e12",border:"1px solid #1e2030",borderTop:"1px solid                 #2c1a08",padding:"14px 16px"}}>
                <div
                    style={{fontSize:10,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>
                    🔗 LeetCode Problems for Week {w.week} — {w.title}
                </div>
                {w.dsaSteps.map(step => {
                const links = STEP_LEETCODE[step]||[];
                if (!links.length) return null;
                const stepInfo = STRIVER_STEPS.find(s=>s.step===step);
                return <div key={step} style={{marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:600,color:STEP_COLORS[step],marginBottom:5}}>Step {step}:
                        {stepInfo?.title}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {links.map((l,li)=>(
                        <a key={li} href={l.url} target="_blank" rel="noopener noreferrer" style={S.lcLink}
                            onMouseEnter={e=>e.currentTarget.style.background="#2c1a08"}
                            onMouseLeave={e=>e.currentTarget.style.background="#1c1108"}>
                            ↗ {l.title}
                        </a>
                        ))}
                    </div>
                </div>;
                })}
            </div>}

            {exp && <div style={{background:"#090a0f",border:"1px solid #1e2030",borderTop:"none",borderRadius:"0 0 10px                 10px",padding:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                    <div
                        style={{fontSize:11,fontWeight:700,color:"#818cf8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
                        DSA – Striver A2Z</div>
                    {stepsInWeek.map(s => {
                    const items = dsaData.filter(d=>d.step===s.step);
                    const sDone = items.filter(d=>d.status==="done").length;
                    return <div key={s.step} style={{marginBottom:10}}>
                        <div style={{fontSize:12,fontWeight:600,color:STEP_COLORS[s.step],marginBottom:4}}>Step
                            {s.step}: {s.title} ({sDone}/{items.length})</div>
                        {items.map(d => <div key={d.id}
                            style={{display:"flex",alignItems:"flex-start",gap:6,padding:"2px 0"}}>
                            <span style={{fontSize:11,color:d.status==="done" ?"#34d399":d.status==="inprogress"
                                ?"#818cf8":"#475569",marginTop:1,flexShrink:0}}>{d.status==="done"?"✓":d.status==="inprogress"?"◑":"○"}</span>
                            <span style={{fontSize:11,color:d.status==="done"
                                ?"#64748b":"#475569",textDecoration:d.status==="done"
                                ?"line-through":"none",lineHeight:1.4}}>{d.topic} <span
                                    style={{color:"#374151"}}>({d.problems}p)</span></span>
                        </div>)}
                    </div>;
                    })}
                </div>
                <div>
                    <div
                        style={{fontSize:11,fontWeight:700,color:"#34d399",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
                        COA – Nesa Academy (Week {w.coaWeek})</div>
                    {cs.map(d => <div key={d.id} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"4px                         0",borderBottom:"1px solid #1e2030"}}>
                        <span style={{fontSize:11,color:d.status==="done"
                            ?"#34d399":"#475569",marginTop:1,flexShrink:0}}>{d.status==="done"?"✓":"○"}</span>
                        <div>
                            <div style={{fontSize:12,color:d.status==="done"
                                ?"#64748b":"#94a3b8",fontWeight:500,textDecoration:d.status==="done"
                                ?"line-through":"none"}}>{d.topic}</div>
                            <div style={{fontSize:10,color:"#374151"}}>{d.subtopics}</div>
                        </div>
                    </div>)}
                </div>
            </div>}
        </div>;
        })}
    </div>;
    }

    // ─── REVISION TRACKER ────────────────────────────────────────────────────────
    function RevisionTracker({ revData, setRevData }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    function toggle(id, field) { setRevData(prev=>prev.map(d=>d.id===id?{...d,[field]:!d[field]}:d)); }

    const filtered = revData.filter(d => {
    const q = search.toLowerCase();
    return (!q||d.topic.toLowerCase().includes(q)) && (typeFilter==="all"||d.type===typeFilter);
    });

    const dayDone = revData.filter(d=>d.day).length;
    const weekDone = revData.filter(d=>d.week1).length;
    const monthDone = revData.filter(d=>d.month).length;

    return <div>
        <div style={S.pageTitle}>Revision Tracker</div>
        <div style={S.pageSub}>Spaced Repetition System · 1-day → 1-week → 1-month reviews</div>
        <div style={S.grid3}>
            <StatCard label="1-Day Done" value={`${dayDone}/${revData.length}`}
                pct={Math.round(dayDone/revData.length*100)} color="#818cf8" />
            <StatCard label="1-Week Done" value={`${weekDone}/${revData.length}`}
                pct={Math.round(weekDone/revData.length*100)} color="#34d399" />
            <StatCard label="1-Month Done" value={`${monthDone}/${revData.length}`}
                pct={Math.round(monthDone/revData.length*100)} color="#f472b6" />
        </div>

        <div style={S.filterBar}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics…"
            style={S.searchInput}/>
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={S.select}>
                <option value="all">All Types</option>
                <option value="DSA">DSA Only</option>
                <option value="COA">COA Only</option>
            </select>
        </div>

        <div style={{background:"#0f1117",border:"1px solid #1e2030",borderRadius:12,overflow:"hidden"}}>
            <table style={S.table}>
                <thead>
                    <tr>
                        {["Topic","Type","Week",{t:"1 Day ✓",c:true},{t:"1 Week ✓",c:true},{t:"1 Month                         ✓",c:true},"Status"].map((h,i)=>
                        <th key={i} style={{...S.th,textAlign:h.c?"center":"left"}}>{h.t||h}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(d => {
                    const all = d.day&&d.week1&&d.month;
                    return <tr key={d.id} style={{background:all?"#0d1a0d":"transparent"}}>
                        <td style={{...S.td,color:"#e2e8f0",fontWeight:500}}>{d.topic}</td>
                        <td style={S.td}><span style={S.badge(d.type==="DSA" ?"blue":"green")}>{d.type}</span></td>
                        <td style={S.td}><span style={{fontSize:12,color:"#475569"}}>W{d.week}</span></td>
                        <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={d.day}
                                onChange={()=>toggle(d.id,"day")} style={S.check}/></td>
                        <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={d.week1}
                                onChange={()=>toggle(d.id,"week1")} style={S.check}/></td>
                        <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={d.month}
                                onChange={()=>toggle(d.id,"month")} style={S.check}/></td>
                        <td style={S.td}><span
                                style={{fontSize:12,color:all?"#34d399":d.day?"#818cf8":"#475569"}}>{all?"Mastered                                 ✓":d.day?"In Progress":"Not Started"}</span></td>
                    </tr>;
                    })}
                </tbody>
            </table>
        </div>
    </div>;
    }

    // ─── ANALYTICS ────────────────────────────────────────────────────────────────
    function Analytics({ dsaData, coaData, revData, weekStatus }) {
    const dsaDone = dsaData.filter(d=>d.status==="done").length;
    const coaDone = coaData.filter(d=>d.status==="done").length;
    const totalP = dsaData.reduce((a,d)=>a+d.problems,0);
    const solvedP = dsaData.reduce((a,d)=>a+Math.min(d.solved,d.problems),0);

    const stepData = STRIVER_STEPS.map(s => ({
    name:`S${s.step}`, done: dsaData.filter(d=>d.step===s.step&&d.status==="done").length,
    total: s.subtopics.length, color: STEP_COLORS[s.step]
    }));

    const weekData = WEEK_PLAN.map((w,i) => {
    const ds = dsaData.filter(d=>w.dsaSteps.includes(d.step));
    const cs = coaData.filter(d=>d.week===w.coaWeek);
    const done = ds.filter(d=>d.status==="done").length + cs.filter(d=>d.status==="done").length;
    const tot = ds.length + cs.length;
    return { name:`W${w.week}`, dsa:ds.length?Math.round(ds.filter(d=>d.status==="done").length/ds.length*100):0,
    coa:cs.length?Math.round(cs.filter(d=>d.status==="done").length/cs.length*100):0,
    overall:tot?Math.round(done/tot*100):0 };
    });

    const confDist = Array.from({length:11},(_,i) => ({ conf:i, dsa:dsaData.filter(d=>d.confidence===i).length,
    coa:coaData.filter(d=>d.confidence===i).length }));

    const pieData = [
    { name:"DSA Done", value:dsaDone, fill:"#818cf8" },
    { name:"DSA Left", value:dsaData.length-dsaDone, fill:"#1e2030" },
    { name:"COA Done", value:coaDone, fill:"#34d399" },
    { name:"COA Left", value:coaData.length-coaDone, fill:"#112211" },
    ];

    const revStats = [
    { name:"1-Day", done:revData.filter(d=>d.day).length, total:revData.length },
    { name:"1-Week", done:revData.filter(d=>d.week1).length, total:revData.length },
    { name:"1-Month", done:revData.filter(d=>d.month).length, total:revData.length },
    ];

    // LC stats
    const totalLC = Object.values(STEP_LEETCODE).reduce((a,v)=>a+v.length,0);

    return <div>
        <div style={S.pageTitle}>Analytics</div>
        <div style={S.pageSub}>Visual breakdown of your progress across all tracks</div>

        <div style={S.grid4}>
            <StatCard label="DSA Subtopics" value={`${Math.round(dsaDone/dsaData.length*100)}%`}
                pct={Math.round(dsaDone/dsaData.length*100)} color="#818cf8" />
            <StatCard label="Problems Solved" value={`${Math.round(solvedP/totalP*100)}%`} sub={`${solvedP}/${totalP}`}
                pct={Math.round(solvedP/totalP*100)} color="#60a5fa" />
            <StatCard label="COA Topics" value={`${Math.round(coaDone/coaData.length*100)}%`}
                pct={Math.round(coaDone/coaData.length*100)} color="#34d399" />
            <StatCard label="LeetCode Links" value={totalLC} sub="across 17 steps" color="#f97316" icon="🔗" />
        </div>

        <div style={S.grid2}>
            <div style={S.card}>
                <div style={S.sectionTitle}>Striver Step-by-Step Progress</div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stepData} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="name" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} formatter={(v,n,p)=>
                            [`${v}/${p.payload.total}`,"Done"]}/>
                            {stepData.map((s,i)=>
                            <Bar key={i} dataKey="done" fill={s.color} radius={[3,3,0,0]} />)}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Weekly DSA vs COA Progress</div>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="name" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} />
                        <Line type="monotone" dataKey="dsa" stroke="#818cf8" strokeWidth={2} dot={{fill:"#818cf8",r:3}}
                            name="DSA" />
                        <Line type="monotone" dataKey="coa" stroke="#34d399" strokeWidth={2} dot={{fill:"#34d399",r:3}}
                            name="COA" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div style={S.grid2}>
            <div style={S.card}>
                <div style={S.sectionTitle}>Confidence Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={confDist.filter(d=>d.dsa+d.coa>0||d.conf===0)} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" />
                        <XAxis dataKey="conf" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                             #1e2030",borderRadius:8,color:"#e2e8f0"}} />
                        <Bar dataKey="dsa" fill="#818cf8" name="DSA" radius={[3,3,0,0]} />
                        <Bar dataKey="coa" fill="#34d399" name="COA" radius={[3,3,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={S.card}>
                <div style={S.sectionTitle}>Revision Progress</div>
                {revStats.map((r,i) => <div key={i} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:13,color:"#94a3b8"}}>{r.name} Review</span>
                        <span
                            style={{fontSize:13,fontWeight:600,color:["#818cf8","#34d399","#f472b6"][i]}}>{r.done}/{r.total}</span>
                    </div>
                    <PBar pct={Math.round(r.done/r.total*100)} color={["#818cf8","#34d399","#f472b6"][i]} height={6} />
                </div>)}
                <div style={{marginTop:16}}>
                    <div style={S.sectionTitle}>Completion Breakdown</div>
                    <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={55} dataKey="value">
                                {pieData.map((e,i)=>
                                <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={{background:"#0f1117",border:"1px solid                                 #1e2030",borderRadius:8,color:"#e2e8f0"}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>;
    }

    // ─── MAIN APP ─────────────────────────────────────────────────────────────────
    const NAV = [
    { id:"dashboard", label:"Dashboard", icon:"⊞" },
    { id:"dsa", label:"DSA Tracker", icon:"◈" },
    { id:"coa", label:"COA Tracker", icon:"◉" },
    { id:"weekly", label:"Weekly Planner", icon:"▦" },
    { id:"revision", label:"Revision Tracker", icon:"↺" },
    { id:"analytics", label:"Analytics", icon:"⋯" },
    ];

    export default function App() {
    const [page, setPage] = useState("dashboard");
    const [dsaData, setDsaData] = useLocalStorage("srm_dsa_v3", DSA_TABLE);
    const [coaData, setCoaData] = useLocalStorage("srm_coa_v3", COA_TABLE);
    const [revData, setRevData] = useLocalStorage("srm_rev_v3", ALL_REV_TOPICS);
    const [weekStatus, setWeekStatus] = useLocalStorage("srm_weeks_v3", Array(8).fill(false));
    const [streak, setStreak] = useLocalStorage("srm_streak_v3", 0);
    const [dailyLog, setDailyLog] = useLocalStorage("srm_log_v3", []);
    const [lastLogDate, setLastLogDate] = useLocalStorage("srm_lastlog_v3", "");
    const [confetti, setConfetti] = useState(false);

    useEffect(() => {
    const today = new Date().toISOString().slice(0,10);
    if (dailyLog.length>0 && dailyLog[0].date===today && lastLogDate!==today) {
    setLastLogDate(today); setStreak(s=>s+1);
    }
    }, [dailyLog]);

    function handleExport() {
    const blob = new
    Blob([JSON.stringify({dsaData,coaData,revData,weekStatus,streak,dailyLog},null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="srm_studyos_progress.json";
    a.click();
    }
    function handleReset() {
    if(window.confirm("Reset ALL progress? This cannot be undone.")) {
    setDsaData(DSA_TABLE); setCoaData(COA_TABLE); setRevData(ALL_REV_TOPICS);
    setWeekStatus(Array(8).fill(false)); setStreak(0); setDailyLog([]);
    }
    }

    return (
    <div style={S.app}>
        <style>
            {
                ` @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

                ::-webkit-scrollbar {
                    width: 4px;
                    height: 4px
                }

                ::-webkit-scrollbar-track {
                    background: #0a0b0d
                }

                ::-webkit-scrollbar-thumb {
                    background: #1e2030;
                    border-radius: 4px
                }

                select option {
                    background: #1a1d2e;
                    color: #e2e8f0
                }

                input[type=number]::-webkit-inner-spin-button {
                    opacity: 0.4
                }

                tr:hover td {
                    background: rgba(255, 255, 255, 0.01)
                }

                `
            }
        </style>
        <Confetti active={confetti} onDone={()=>setConfetti(false)}/>
            <div style={S.sidebar}>
                <div style={S.sidebarTop}>
                    <div style={S.logo}>StudyOS</div>
                    <div style={S.logoSub}>SRM KTR · Sem Break</div>
                </div>
                <nav style={S.nav}>
                    {NAV.map(n=><div key={n.id} onClick={()=>setPage(n.id)} style={S.navItem(page===n.id)}>
                        <span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span>
                    </div>)}
                </nav>
                <div style={{padding:"12px 8px",borderTop:"1px solid #1e2030"}}>
                    <div onClick={handleExport} style={{...S.navItem(false),marginBottom:4}}>
                        <span style={{fontSize:13}}>↓</span><span style={{fontSize:12}}>Export JSON</span>
                    </div>
                    <div onClick={handleReset} style={{...S.navItem(false),color:"#7f1d1d"}}>
                        <span style={{fontSize:13}}>⟲</span><span style={{fontSize:12}}>Reset Progress</span>
                    </div>
                </div>
            </div>
            <main style={S.main}>
                {page==="dashboard" &&
                <Dashboard dsaData={dsaData} coaData={coaData} weekStatus={weekStatus} streak={streak}
                    dailyLog={dailyLog} setDailyLog={setDailyLog} />}
                {page==="dsa" &&
                <DSATracker dsaData={dsaData} setDsaData={setDsaData} />}
                {page==="coa" &&
                <COATracker coaData={coaData} setCoaData={setCoaData} />}
                {page==="weekly" && <WeeklyPlanner dsaData={dsaData} coaData={coaData} weekStatus={weekStatus}
                    setWeekStatus={setWeekStatus} onCelebrate={()=>setConfetti(true)}/>}
                    {page==="revision" &&
                    <RevisionTracker revData={revData} setRevData={setRevData} />}
                    {page==="analytics" &&
                    <Analytics dsaData={dsaData} coaData={coaData} revData={revData} weekStatus={weekStatus} />}
            </main>
    </div>
    );
    }