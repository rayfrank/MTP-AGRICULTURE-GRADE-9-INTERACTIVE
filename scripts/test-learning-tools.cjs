/* Run with node scripts/test-learning-tools.cjs. No third-party dependencies. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const app = fs.readFileSync(require("node:path").join(__dirname,"app.js"),"utf8");
const moduleSource = app.slice(app.indexOf("const MODULES ="),app.indexOf("const STORAGE_KEY ="));
const sandbox = {
  window:{addEventListener(){}}, document:{addEventListener(){}}, Date, crypto:require("node:crypto").webcrypto,
  escapeHTML:s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),
  URL, console,
};
vm.createContext(sandbox);
vm.runInContext(moduleSource,sandbox);
vm.runInContext(fs.readFileSync(require("node:path").join(__dirname,"learning-tools.js"),"utf8"),sandbox);
vm.runInContext("function ml(m,f){return m[f]} function mlq(m,i){return {q:m.quiz[i].q,o:m.quiz[i].o}}",sandbox);
const tools=sandbox.window.AgriTools;
let checks=0;
function test(name,fn){fn();checks++;console.log("PASS",name);}
test("new learner receives empty records",()=>{const d=tools.normalize({});for(const name of ["portfolio","experiments","budgets"])assert.equal(d[name].length,0);});
test("difficult cards cross a month boundary",()=>{const r=tools.schedule(null,"difficult","2026-10-31");assert.equal(r.due,"2026-11-01");assert.equal(r.interval,1);});
test("easy recall expands its review interval",()=>{const r=tools.schedule({interval:3},"easy","2026-10-14");assert.equal(r.interval,6);assert.equal(r.due,"2026-10-20");});
test("review interval is capped at 60 days",()=>assert.equal(tools.schedule({interval:50},"easy","2026-10-14").interval,60));
test("invalid review dates and keys are discarded",()=>{const d=tools.normalize({reviews:{"hay:goal:0":{due:"2026-02-31"},"__proto__":{due:"2026-10-14"},"hay:idea:1":{due:"2026-10-15",interval:3}}});assert.equal(Object.keys(d.reviews).length,1);});
test("budget totals and break-even sales use all costs",()=>{const r=tools.calculateBudget({budget:5000,seeds:800,feed:0,equipment:1000,water:500,other:200,yield:100,price:40});assert.equal(r.costs,2500);assert.equal(r.revenue,4000);assert.equal(r.profit,1500);assert.equal(r.breakEven,62.5);assert.equal(r.withinBudget,true);});
test("overspending and losses are reported",()=>{const r=tools.calculateBudget({budget:100,seeds:200,feed:0,equipment:0,water:0,other:0,yield:1,price:10});assert.equal(r.profit,-190);assert.equal(r.withinBudget,false);});
test("zero selling price does not divide by zero",()=>assert.equal(tools.calculateBudget({budget:1,seeds:0,feed:0,equipment:0,water:0,other:0,yield:2,price:0}).breakEven,null));
test("negative and nonnumeric costs are rejected",()=>{for(const seeds of [-1,"bad",Infinity])assert.throws(()=>tools.calculateBudget({budget:1,seeds,feed:0,equipment:0,water:0,other:0,yield:0,price:1}));});
test("malformed records are filtered and user text is bounded",()=>{const d=tools.normalize({portfolio:[{id:"p",moduleId:"hay",title:"x".repeat(200),date:"bad",photos:["a",{},"b"]},{id:"q",moduleId:"unknown"}],experiments:[{id:"e",records:[{date:"2026-10-14",height:-1,water:1,harvest:0},{date:"2026-10-14",height:3,water:1,harvest:0}]}]});assert.equal(d.portfolio.length,1);assert.equal(d.portfolio[0].title.length,100);assert.equal(d.portfolio[0].photos.length,2);assert.equal(d.experiments[0].records.length,1);});
test("invalid rubric scores cannot become an assessment",()=>{const d=tools.normalize({portfolio:[{id:"p",moduleId:"hay",assessment:{scores:{planning:5,safety:3,method:3,evidence:3,reflection:3}}}]});assert.equal(d.portfolio[0].assessment,null);});
test("worksheet escapes user-controlled lesson content",()=>{const m={id:"test",code:"1",title:'<script>alert(1)</script>',summary:"Test",prompts:[],journal:"Task",quiz:[]};const html=tools.sheetHTML(m,"activity",false);assert(!html.includes("<script>"));assert(html.includes("&lt;script&gt;"));});
test("all 30 questions have a specific explanation",()=>vm.runInContext("for (const m of MODULES) for(let i=0;i<m.quiz.length;i++) if(AgriTools.explanation(m,i).startsWith('The correct answer is')) throw Error('Missing explanation')",Object.assign(sandbox,{AgriTools:tools})));
console.log(`${checks} checks passed.`);
