/* Practical learning tools. Loaded before app.js; app state is read only on use. */
window.AgriTools = (() => {
  "use strict";
  const SECTIONS = [
    ["portfolio", "Practical portfolio", "Save project evidence and photographs."],
    ["revision", "Practise my mistakes", "Revisit questions you missed."],
    ["review", "Scheduled flashcards", "Review cards when they are due."],
    ["rubrics", "Practical marking", "Check practical skills and read feedback."],
    ["garden", "Garden experiments", "Track growth, watering and harvests."],
    ["downloads", "Offline downloads", "Check and save lessons, videos and AI files."],
    ["budget", "Farm budgeting", "Plan spending and calculate your return."],
    ["worksheets", "Activity sheets", "Print worksheets and practical checklists."],
  ];
  const RUBRIC = [
    ["planning", "Planning", "Lists materials, steps and the purpose of the activity."],
    ["safety", "Safety and care", "Uses tools carefully and follows the activity's safety instructions."],
    ["method", "Practical method", "Carries out and records the steps in a sensible order."],
    ["evidence", "Evidence", "Records observations and results clearly."],
    ["reflection", "Reflection", "Explains what worked and what to improve next time."],
  ];
  const EXPLANATIONS = {
    hay: ["At flowering, forage balances feeding quality with useful yield. Waiting too long makes it more fibrous.", "Raised, ventilated storage keeps hay away from damp ground and helps prevent mould and nutrient loss.", "Standing hay stays growing in the field for animals to graze later. Baled hay is cut, dried and stored."],
    leftovers: ["An unusual smell is a sign that food may have spoiled. Reusing it is unsafe.", "A clean, covered container protects food from dirt, insects and other sources of contamination.", "Reusing safe leftovers means less edible food is discarded."],
    integrated: ["Integrated farming connects activities: an output from one activity becomes an input for another.", "Manure contributes nutrients and organic matter to soil when prepared and used appropriately.", "Reusing resources reduces discarded materials and the need to buy some inputs."],
    organic: ["Mulch covers the soil, reducing water evaporation and blocking light that weeds need.", "Related crops can host the same pests and diseases. Rotation interrupts their build-up.", "Hot pepper is one of the natural pesticide ingredients described in the lesson. Follow the textbook activity and teacher guidance."],
    storage: ["Damp conditions encourage mould and rotting. Dry storage helps preserve crop quality.", "A tightly fitting lid creates a barrier against pests entering the container.", "Separating rotten grains helps prevent spoilage spreading to sound grains."],
    flour: ["Batter contains enough liquid to flow. Dough is firmer and can hold its shape.", "Thin batter spreads readily in a pan, making it suitable for pancakes.", "Dough is firm enough to knead and roll. Thin batter flows and cannot be handled that way."],
    waste: ["Gloves create a barrier between hands and contaminated surfaces; handwashing remains necessary.", "A blockage prevents water draining freely, allowing dirty water and waste to collect.", "Liners hold waste separately from the bin surface, making removal and cleaning easier."],
    disinfecting: ["Boiling uses high water temperature. Only use it on items that can tolerate the heat.", "Sunlight includes ultraviolet radiation; its effect depends on exposure and conditions.", "Labels explain dilution, contact time and precautions needed for safe, effective use."],
    grafting: ["The scion is the upper plant part joined to the rootstock. It supplies the desired shoot.", "Sealing protects the union from water entry and decay as it heals.", "Buds below the union belong to the rootstock and compete with growth from the scion."],
    sunDryer: ["A transparent cover admits sunlight so the dryer warms up while shielding the produce.", "A single layer lets air move around the leaves and helps them dry evenly.", "Moving the dryer indoors at night protects it from cold, damp conditions."],
  };
  let section = "portfolio";
  let viewToken = 0;
  let photoURLs = [];
  let photoDB;
  let downloadBusy = false;
  let downloadAbort;
  const h = value => escapeHTML(String(value ?? ""));
  const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const day = () => new Date().toLocaleDateString("en-CA");
  const validDay = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
  const number = (value, max = 1000000) => {
    const result = Number(value);
    if (!Number.isFinite(result) || result < 0 || result > max) throw new Error(`Enter a number between 0 and ${max.toLocaleString()}.`);
    return result;
  };
  const text = (value, max = 3000) => String(value ?? "").trim().slice(0, max);
  const obj = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const list = value => Array.isArray(value) ? value : [];
  const moduleExists = id => MODULES.some(m => m.id === id);
  function normalize(saved) {
    const data = obj(saved);
    const reviews = {};
    for (const [key, item] of Object.entries(obj(data.reviews)).slice(0, 1000)) {
      if (!/^[\w-]+:(goal|idea|glossary):\d+$/.test(key)) continue;
      const v = obj(item);
      if (!validDay(v.due)) continue;
      reviews[key] = { due: v.due, interval: Math.max(1, Math.min(60, Number(v.interval) || 1)), last: text(v.last, 10) };
    }
    const portfolio = list(data.portfolio).slice(0, 500).filter(e => e && moduleExists(e.moduleId) && text(e.id, 100)).map(e => ({
      id: text(e.id, 100), moduleId: e.moduleId, title: text(e.title, 100), date: validDay(e.date) ? e.date : day(),
      observations: text(e.observations), results: text(e.results), photos: list(e.photos).filter(p => typeof p === "string").slice(0, 3).map(p => text(p, 160)),
      assessment: normalizeAssessment(e.assessment),
    }));
    const experiments = list(data.experiments).slice(0, 100).filter(e => e && text(e.id, 100)).map(e => ({
      id: text(e.id, 100), title: text(e.title, 100), crop: text(e.crop, 100), treatment: text(e.treatment, 300),
      start: validDay(e.start) ? e.start : day(),
      records: list(e.records).slice(0, 1000).filter(r => r && validDay(r.date) && [r.height, r.water, r.harvest].every(n => Number.isFinite(Number(n)) && Number(n) >= 0 && Number(n) <= 1000000))
        .map(r => ({ id: text(r.id, 100) || uid(), date: r.date, height: Number(r.height), water: Number(r.water), harvest: Number(r.harvest), notes: text(r.notes, 1000) })),
    }));
    const mastered = {};
    for (const [key, value] of Object.entries(obj(data.mastered)).slice(0, 1000)) if (/^\w+:\d+$/.test(key) && value === true) mastered[key] = true;
    const budgets = list(data.budgets).slice(0, 100).filter(b => b && moduleExists(b.moduleId) && Number.isFinite(b.profit)).map(b => ({
      id: text(b.id, 100) || uid(), moduleId: b.moduleId, date: validDay(b.date) ? b.date : day(),
      title: text(b.title, 100), costs: Number(b.costs) || 0, revenue: Number(b.revenue) || 0, profit: b.profit,
      withinBudget: Boolean(b.withinBudget), plan: obj(b.plan),
    }));
    return { portfolio, experiments, reviews, mastered, budgets };
  }
  function normalizeAssessment(value) {
    if (!value || typeof value !== "object") return null;
    const scores = {};
    for (const [key] of RUBRIC) {
      const score = Number(value.scores?.[key]);
      if (!Number.isInteger(score) || score < 0 || score > 3) return null;
      scores[key] = score;
    }
    return { scores, feedback: text(value.feedback), teacher: text(value.teacher, 100), date: text(value.date, 10) };
  }
  function data() { return progress.tools || (progress.tools = normalize({})); }
  function save() { saveProgress(); }
  function writable() { return guardProgressWrite("change learning tools"); }
  const field = (label, name, input = "text", extra = "") => `<label class="lt-field">${h(label)}<input name="${name}" type="${input}" ${extra}></label>`;
  const area = (label, name, value = "") => `<label class="lt-field">${h(label)}<textarea name="${name}" maxlength="3000">${h(value)}</textarea></label>`;
  const empty = message => `<p class="lt-empty">${h(message)}</p>`;
  const buttons = html => `<div class="lt-actions">${html}</div>`;
  const btn = (label, action, extra = "", primary = false) => `<button type="button" class="${primary ? "primary" : "secondary"}-button" data-lt-action="${action}" ${extra}>${h(label)}</button>`;
  function releasePhotos() { photoURLs.forEach(URL.revokeObjectURL); photoURLs = []; }
  function cleanup() { viewToken++; releasePhotos(); }
  function open(next = "portfolio") {
    if (SECTIONS.some(([key]) => key === next)) section = next;
    state.view = "tools";
    render();
  }
  function renderTools() {
    cleanup();
    const learner = currentLearnerProfile();
    const isStudent = canEditProgress();
    els.viewHost.innerHTML = `<div class="learning-tools">
      <header class="lt-heading"><div><p class="eyebrow">Learning beyond the lesson</p><h2>Learning tools</h2>
      <p>${h(learner?.name || "Student")} · ${h(ml(currentModule(), "title"))}</p></div>
      ${buttons(btn("Export learning backup", "backup") + (isStudent ? '<label class="lt-file-button secondary-button">Import learning backup<input type="file" data-lt-import="backup" accept="application/json,.json"></label>' : ""))}</header>
      <nav class="lt-nav" aria-label="Learning tools">${SECTIONS.map(([key, label]) => `<button type="button" data-lt-section="${key}" class="${key === section ? "active" : ""}" aria-current="${key === section ? "page" : "false"}">${h(label)}</button>`).join("")}</nav>
      ${!isStudent ? `<p class="lt-notice">Viewing ${h(learner?.name || "learner")}'s work. ${currentProfile.role === "teacher" ? "Use Practical marking to assess projects." : "Learning records are read-only."}</p>` : ""}
      <div id="ltContent"></div><p id="ltStatus" class="lt-status" role="status" aria-live="polite"></p>
    </div>`;
    const root = els.viewHost.querySelector(".learning-tools");
    root.addEventListener("click", onClick);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("change", onChange);
    ({ portfolio: renderPortfolio, revision: renderRevision, review: renderReviews, rubrics: renderRubrics,
      garden: renderGarden, downloads: renderDownloads, budget: renderBudget, worksheets: renderWorksheets })[section]();
  }
  const content = html => { document.getElementById("ltContent").innerHTML = html; };
  const status = message => { const el = document.getElementById("ltStatus"); if (el) el.textContent = message; };
  function refresh() { if (state.view === "tools") renderTools(); }
  function error(err) { status(err.message || "Unable to complete this action."); showToast(err.message || "Unable to complete this action.", "warn"); }

  // Photographs use IndexedDB so they do not fill the small localStorage quota.
  function db() {
    if (!photoDB) photoDB = new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("Photo storage is unavailable in this browser. You can still save written observations."));
      const request = indexedDB.open("mtp-practical-photos", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("photos");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { photoDB = null; reject(new Error("Photo storage is blocked. Save the project without photos or try a regular browser window.")); };
    });
    return photoDB;
  }
  async function photo(method, key, value) {
    const database = await db();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("photos", method === "get" ? "readonly" : "readwrite");
      const request = method === "put" ? tx.objectStore("photos").put(value, key) : tx.objectStore("photos")[method](key);
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(new Error("Could not save the photo. Browser storage may be full."));
    });
  }
  async function compress(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) throw new Error("Choose a JPG, PNG or WebP photo under 10 MB.");
    const source = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = source;
      await img.decode();
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Could not prepare this photo.")), "image/jpeg", 0.8));
    } finally { URL.revokeObjectURL(source); }
  }
  function renderPortfolio() {
    const entries = data().portfolio.filter(e => e.moduleId === state.moduleId);
    content(`<div class="lt-grid"><article class="tool-card"><p class="eyebrow">Practical evidence</p><h3>Document your project</h3>
      <p>${h(ml(currentModule(), "journal"))}</p>
      ${canEditProgress() ? `<form data-lt-form="portfolio">
        ${field("Project title", "title", "text", 'required maxlength="100"')}${field("Activity date", "date", "date", `required value="${day()}" max="${day()}"`)}
        ${area("What did you do and observe?", "observations")}${area("Results and what you would improve", "results")}
        <label class="lt-field">Photographs (up to 3)<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label>
        <p class="small-label">Photos are resized and saved on this device. Export a learning backup to keep a copy.</p>
        <button class="primary-button" type="submit">Save project</button></form>` : empty("Switch to the student's profile to add practical work.")}
      </article><article class="tool-card"><h3>Project collection</h3><p>${entries.length} project${entries.length === 1 ? "" : "s"} in this lesson</p>
      ${buttons(btn("Export projects with photos", "portfolio-export") + (canEditProgress() ? `<label class="lt-file-button secondary-button">Import project file<input type="file" data-lt-import="portfolio" accept="application/json,.json"></label>` : ""))}
      ${entries.length ? entries.slice().reverse().map(e => `<article class="lt-entry"><p class="eyebrow">${h(e.date)}</p><h4>${h(e.title)}</h4><p class="lt-preserve">${h(e.observations)}</p><p class="lt-preserve">${h(e.results)}</p>
        <div class="lt-photos">${e.photos.map(p => `<img data-lt-photo="${h(p)}" alt="Evidence for ${h(e.title)}" loading="lazy">`).join("")}</div>
        ${e.assessment ? assessmentHTML(e.assessment) : '<p class="small-label">Awaiting practical feedback</p>'}
        ${canEditProgress() ? buttons(btn("Delete project", "project-delete", `data-id="${h(e.id)}"`)) : ""}</article>`).join("") : empty("Save your first practical project to start your portfolio.")}
      </article></div>`);
    hydratePhotos();
  }
  async function hydratePhotos() {
    const token = viewToken;
    for (const img of document.querySelectorAll("[data-lt-photo]")) {
      try {
        const blob = await photo("get", img.dataset.ltPhoto);
        if (token !== viewToken || !img.isConnected) return;
        if (blob) { const url = URL.createObjectURL(blob); photoURLs.push(url); img.src = url; }
        else { img.replaceWith(document.createTextNode("Photo unavailable on this device.")); }
      } catch { if (img.isConnected) img.replaceWith(document.createTextNode("Photo storage unavailable.")); }
    }
  }
  function explanation(module, index) { return EXPLANATIONS[module.id]?.[index] || `The correct answer is ${module.quiz[index].a}. Revisit the lesson to check your reasoning.`; }
  function recordQuiz(module, answers) {
    for (let i = 0; i < module.quiz.length; i++) {
      const key = `${module.id}:${i}`;
      if (answers[i] === module.quiz[i].a) data().mastered[key] = true;
      else delete data().mastered[key];
    }
  }
  function mistakes(all = false) {
    return (all ? MODULES : [currentModule()]).flatMap(m => m.quiz.map((q, i) => ({ module: m, index: i, question: q, misses: Number(progress.quizMisses?.[m.id]?.[i]) || 0 }))
      .filter(item => item.misses > 0 && !data().mastered[`${m.id}:${item.index}`])).sort((a, b) => b.misses - a.misses);
  }
  function renderRevision(all = false) {
    const items = mistakes(all);
    content(`<article class="tool-card"><h3>Practise my mistakes</h3><p>Answer again, read the explanation, and return to the lesson if needed. Correct answers leave this revision list.</p>
      <label class="lt-check"><input type="checkbox" data-lt-all-mistakes ${all ? "checked" : ""}> Include all lessons</label>
      <p>${items.length} question${items.length === 1 ? "" : "s"} to revisit</p>
      ${items.length ? items.map(({module: m, index: i, misses}) => {
        const q = mlq(m, i);
        return `<article class="lt-entry" data-lt-question="${m.id}:${i}"><p class="eyebrow">${h(ml(m,"title"))} · missed ${misses} time${misses === 1 ? "" : "s"}</p><h4>${h(q.q)}</h4>
          <div class="lt-answers">${m.quiz[i].o.map((o, j) => btn(q.o[j] || o, "revise", `data-module="${m.id}" data-index="${i}" data-option="${j}" ${canEditProgress() ? "" : "disabled"}`)).join("")}</div>
          <div class="lt-feedback" role="status"></div>${btn("Read this lesson", "lesson", `data-module="${m.id}"`)}</article>`;
      }).join("") : empty("No outstanding mistakes. Complete a quiz to see questions that need practice here.")}</article>`);
  }
  function cards(module) {
    return [...ml(module, "goals").map((g,i) => ({key:`${module.id}:goal:${i}`,front:"Recall this learning goal",back:g})),
      ...ml(module, "ideas").map((g,i) => ({key:`${module.id}:idea:${i}`,front:"Recall this core idea",back:g})),
      ...(ml(module,"glossary") || []).map((g,i) => ({key:`${module.id}:glossary:${i}`,front:g.term,back:g.def}))];
  }
  function schedule(previous, difficulty, now = day()) {
    const interval = difficulty === "difficult" ? 1 : Math.min(60, Math.max(3, Math.round((Number(previous?.interval) || 1) * 2)));
    const date = new Date(`${now}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + interval);
    return { due: date.toISOString().slice(0,10), interval, last: now };
  }
  function rateCard(key, difficulty) {
    if (!writable()) return;
    data().reviews[key] = schedule(data().reviews[key], difficulty);
    save();
    return data().reviews[key];
  }
  function renderReviews(all = false) {
    const collection = (all ? MODULES : [currentModule()]).flatMap(m => cards(m).map(c => ({...c,module:m})));
    const due = collection.filter(c => !data().reviews[c.key] || data().reviews[c.key].due <= day());
    const upcoming = collection.filter(c => data().reviews[c.key]?.due > day()).sort((a,b) => data().reviews[a.key].due.localeCompare(data().reviews[b.key].due));
    content(`<article class="tool-card"><h3>Scheduled flashcards</h3><p>Reveal an answer, then rate your recall. Difficult cards return tomorrow; easy cards return after a longer interval.</p>
      <label class="lt-check"><input type="checkbox" data-lt-all-cards ${all ? "checked" : ""}> Include all lessons</label>
      <p><strong>${due.length}</strong> due or new · <strong>${upcoming.length}</strong> scheduled later</p>
      <div id="ltReviewCards">${due.length ? due.map(c => `<article class="lt-entry" data-lt-card="${h(c.key)}"><p class="eyebrow">${h(ml(c.module,"title"))}</p><h4>${h(c.front)}</h4>
        <details><summary>Reveal answer</summary><p>${h(c.back)}</p>${canEditProgress() ? buttons(btn("Difficult · tomorrow", "rate", `data-key="${h(c.key)}" data-rating="difficult"`) + btn("Easy · later", "rate", `data-key="${h(c.key)}" data-rating="easy"`)) : ""}</details></article>`).join("") : empty("All caught up. Your scheduled cards will appear when they are due.")}</div>
      ${upcoming.length ? `<h4>Next reviews</h4><ul>${upcoming.slice(0,8).map(c => `<li>${h(c.front)} — ${h(data().reviews[c.key].due)}</li>`).join("")}</ul>` : ""}</article>`);
  }
  function assessmentHTML(a) {
    const total = Object.values(a.scores).reduce((sum,n) => sum+n,0);
    return `<div class="lt-assessment"><strong>Practical assessment: ${total}/15</strong><p class="small-label">${h(a.teacher)} · ${h(a.date)}</p><ul>${RUBRIC.map(([key,label]) => `<li>${label}: ${a.scores[key]}/3</li>`).join("")}</ul><p class="lt-preserve">${h(a.feedback)}</p></div>`;
  }
  function renderRubrics() {
    const teacher = currentProfile.role === "teacher";
    const entries = data().portfolio.filter(e => e.moduleId === state.moduleId);
    content(`<article class="tool-card"><h3>Practical marking</h3><p>Assess the learner's actual project evidence. Each criterion is scored from 0 to 3: not yet shown, developing, mostly achieved, or confidently achieved.</p>
      ${teacher ? `<label class="lt-field">Learner<select data-lt-learner>${(getTeacherStudents(currentProfile).length ? getTeacherStudents(currentProfile) : getStudentProfiles()).map(p => `<option value="${h(p.id)}" ${p.id === activeLearnerProfileId() ? "selected" : ""}>${h(p.name)}</option>`).join("")}</select></label>` : ""}
      <div class="lt-table-wrap"><table class="lt-table"><thead><tr><th>Criterion</th><th>Evidence to look for</th></tr></thead><tbody>${RUBRIC.map(([,label,desc]) => `<tr><th>${label}</th><td>${desc}</td></tr>`).join("")}</tbody></table></div>
      ${buttons(btn("View project photos", "to-portfolio") + btn("Export feedback", "feedback-export") + (canEditProgress() ? `<label class="lt-file-button secondary-button">Import teacher feedback<input type="file" data-lt-import="feedback" accept="application/json,.json"></label>` : ""))}
      ${entries.length ? entries.map(e => `<article class="lt-entry"><h4>${h(e.title)}</h4><p>${h(e.date)}</p><p class="lt-preserve">${h(e.observations)}</p><p class="lt-preserve">${h(e.results)}</p>
        ${e.assessment ? assessmentHTML(e.assessment) : empty("No assessment recorded yet.")}
        ${teacher ? `<form data-lt-form="rubric" data-entry="${h(e.id)}"><div class="lt-form-grid">${RUBRIC.map(([key,label]) => `<label class="lt-field">${label}<select name="${key}">${[0,1,2,3].map(n => `<option value="${n}" ${e.assessment?.scores[key] === n ? "selected" : ""}>${n} — ${["Not yet shown","Developing","Mostly achieved","Confidently achieved"][n]}</option>`).join("")}</select></label>`).join("")}</div>${area("Feedback: strengths and a specific next step", "feedback", e.assessment?.feedback || "")}<button class="primary-button" type="submit">Save assessment</button></form>` : ""}</article>`).join("") : empty("Add a practical project in this lesson before it can be assessed.")}
      <p class="small-label">Teacher and learner profiles on this device share project records. For another device, the learner exports a project file; the teacher imports it into a local learner profile, marks it, and exports feedback for the learner to import.</p></article>`);
  }
  function renderGarden(selected = "") {
    const experiments = data().experiments;
    const experiment = experiments.find(e => e.id === selected) || experiments[0];
    content(`<div class="lt-grid"><article class="tool-card"><h3>Garden experiments</h3><p>Use separate experiments to compare crops or treatments, such as mulched and unmulched beds.</p>
      ${canEditProgress() ? `<form data-lt-form="experiment">${field("Experiment name", "title", "text", 'required maxlength="100"')}${field("Crop or variety", "crop", "text", 'required maxlength="100"')}${field("Start date", "start", "date", `required value="${day()}" max="${day()}"`)}${area("Treatment and conditions", "treatment")}<button class="primary-button" type="submit">Create experiment</button></form>` : ""}
      ${experiments.length ? `<label class="lt-field">Choose experiment<select data-lt-experiment>${experiments.map(e => `<option value="${h(e.id)}" ${e === experiment ? "selected" : ""}>${h(e.title)} · ${h(e.crop)}</option>`).join("")}</select></label>` : empty("Create your first experiment to start recording plant growth.")}
      ${experiment ? `<h4>${h(experiment.title)}</h4><p>${h(experiment.crop)} · started ${h(experiment.start)}</p><p class="lt-preserve">${h(experiment.treatment)}</p>${buttons(btn("Export measurements (CSV)", "garden-export", `data-id="${h(experiment.id)}"`) + (canEditProgress() ? btn("Delete experiment", "experiment-delete", `data-id="${h(experiment.id)}"`) : ""))}` : ""}
      </article><article class="tool-card">${experiment ? `<h3>Record an observation</h3>${canEditProgress() ? `<form data-lt-form="observation" data-experiment="${h(experiment.id)}"><div class="lt-form-grid">
        ${field("Date", "date", "date", `required value="${day()}" min="${experiment.start}" max="${day()}"`)}${field("Plant height (cm)", "height", "number", 'required min="0" max="1000000" step="0.1"')}${field("Water applied (litres)", "water", "number", 'required min="0" max="1000000" step="0.1" value="0"')}${field("Harvest collected (kg)", "harvest", "number", 'required min="0" max="1000000" step="0.01" value="0"')}</div>${area("Notes: weather, plant health or changes", "notes")}<button class="primary-button" type="submit">Save observation</button></form>` : ""}
        ${growthChart(experiment.records)}${recordsHTML(experiment)}` : empty("Your measurements and growth chart will appear here.")}</article></div>`);
  }
  function growthChart(records) {
    if (!records.length) return empty("Record plant height to see a growth chart.");
    const sorted = records.slice().sort((a,b) => a.date.localeCompare(b.date));
    const first = Date.parse(sorted[0].date), last = Date.parse(sorted.at(-1).date);
    const max = Math.max(1, ...sorted.map(r => r.height));
    const x = r => 50 + (last === first ? 0.5 : (Date.parse(r.date)-first)/(last-first)) * 500;
    const y = r => 190 - r.height/max * 155;
    return `<figure class="lt-chart"><figcaption>Plant height over time (cm)</figcaption><svg viewBox="0 0 600 240" role="img" aria-label="Plant height from ${h(sorted[0].date)} to ${h(sorted.at(-1).date)}. Measurements are also in the table below.">
      <path d="M50 30V190H560" fill="none" stroke="currentColor" opacity="0.5"/><text x="8" y="40">${max.toFixed(1)}</text><text x="26" y="194">0</text>
      <polyline points="${sorted.map(r => `${x(r)},${y(r)}`).join(" ")}" fill="none" stroke="var(--leaf)" stroke-width="3"/>
      ${sorted.map(r => `<circle cx="${x(r)}" cy="${y(r)}" r="5" fill="var(--leaf)"><title>${h(r.date)}: ${r.height} cm</title></circle>`).join("")}
      <text x="50" y="223">${h(sorted[0].date)}</text><text x="550" y="223" text-anchor="end">${h(sorted.at(-1).date)}</text></svg></figure>`;
  }
  function recordsHTML(experiment) {
    const records = experiment.records.slice().sort((a,b) => b.date.localeCompare(a.date));
    if (!records.length) return "";
    return `<p>Total water: ${records.reduce((s,r)=>s+r.water,0).toFixed(1)} L · Total harvest: ${records.reduce((s,r)=>s+r.harvest,0).toFixed(2)} kg</p><div class="lt-table-wrap"><table class="lt-table"><thead><tr><th>Date</th><th>Height (cm)</th><th>Water (L)</th><th>Harvest (kg)</th><th>Notes</th>${canEditProgress() ? "<th>Action</th>" : ""}</tr></thead><tbody>${records.map(r => `<tr><td>${h(r.date)}</td><td>${r.height}</td><td>${r.water}</td><td>${r.harvest}</td><td>${h(r.notes)}</td>${canEditProgress() ? `<td>${btn("Delete", "record-delete", `data-experiment="${h(experiment.id)}" data-id="${h(r.id)}"`)}</td>` : ""}</tr>`).join("")}</tbody></table></div>`;
  }
  function calculateBudget(plan) {
    const costs = ["seeds","feed","equipment","water","other"].reduce((sum,k) => sum+number(plan[k]),0);
    const revenue = number(plan.yield) * number(plan.price);
    const budget = number(plan.budget);
    return { costs, revenue, profit: revenue-costs, withinBudget: costs<=budget, remaining:budget-costs, breakEven: Number(plan.price)>0 ? costs/Number(plan.price) : null };
  }
  function renderBudget(plan = {}, result = null) {
    const labels = {budget:"Available budget (KSh)",seeds:"Seeds or planting materials (KSh)",feed:"Animal feed (KSh)",equipment:"Equipment (KSh)",water:"Water and transport (KSh)",other:"Other costs (KSh)",yield:"Expected harvest or units sold",price:"Selling price per unit (KSh)"};
    const defaults = {budget:5000,seeds:800,feed:0,equipment:1000,water:500,other:200,yield:100,price:40};
    content(`<div class="lt-grid"><article class="tool-card"><p class="eyebrow">Simulated classroom challenge</p><h3>Farm budgeting</h3><p>Plan a small farm enterprise. Keep spending within your budget and aim to earn a profit. These are example prices; enter your own assumptions.</p>
      <form data-lt-form="budget">${field("Enterprise name", "title", "text", `required maxlength="100" value="${h(plan.title || "School vegetable garden")}"`)}<div class="lt-form-grid">${Object.entries(labels).map(([k,label]) => field(label,k,"number",`required min="0" max="1000000" step="0.01" value="${h(plan[k] ?? defaults[k])}"`)).join("")}</div><button class="primary-button" type="submit">Calculate my plan</button></form></article>
      <article class="tool-card"><h3>Can your enterprise succeed?</h3>${result ? `<dl class="lt-metrics"><dt>Total costs</dt><dd>KSh ${result.costs.toFixed(2)}</dd><dt>Expected sales</dt><dd>KSh ${result.revenue.toFixed(2)}</dd><dt>${result.profit>=0?"Profit":"Loss"}</dt><dd>KSh ${Math.abs(result.profit).toFixed(2)}</dd><dt>Budget remaining</dt><dd>KSh ${result.remaining.toFixed(2)}</dd><dt>Break-even sales</dt><dd>${result.breakEven === null ? "Set a selling price above zero" : `${Math.ceil(result.breakEven)} units`}</dd></dl><p class="lt-notice">${result.withinBudget ? "Your spending fits the budget." : "Your costs exceed the available budget."} ${result.profit>0 ? "Expected sales exceed costs." : "Try changing costs, yield or selling price to improve the result."}</p>${canEditProgress() ? btn("Save this plan", "budget-save", "", true) : ""}` : empty("Calculate a plan to see costs, sales, profit and break-even sales.")}
      <h4>Saved plans</h4>${data().budgets.filter(b=>b.moduleId===state.moduleId).slice().reverse().map(b => `<div class="lt-entry"><strong>${h(b.title)}</strong><p>${h(b.date)} · ${b.profit>=0?"Profit":"Loss"}: KSh ${Math.abs(b.profit).toFixed(2)}</p>${buttons(btn("Open plan", "budget-open", `data-id="${h(b.id)}"`)+(canEditProgress()?btn("Delete plan","budget-delete",`data-id="${h(b.id)}"`):""))}</div>`).join("")}</article></div>`);
    const saveButton = document.querySelector('[data-lt-action="budget-save"]');
    if (saveButton) saveButton._plan = {...plan};
  }
  function renderWorksheets() {
    content(`<article class="tool-card"><h3>Printable activity sheets</h3><p>Choose a lesson and sheet type. Preview it, then use Print / Save PDF for an A4 classroom copy.</p>
      <div class="lt-form-grid"><label class="lt-field">Lesson<select id="ltSheetModule">${MODULES.map(m=>`<option value="${m.id}" ${m.id===state.moduleId?"selected":""}>${h(m.code)} ${h(ml(m,"title"))}</option>`).join("")}</select></label>
      <label class="lt-field">Sheet type<select id="ltSheetType"><option value="activity">Learning worksheet</option><option value="practical">Practical project checklist</option><option value="garden">Garden observation sheet</option></select></label>
      <label class="lt-check"><input id="ltSheetAnswers" type="checkbox"> Include a separate answer key</label></div>
      ${buttons(btn("Preview sheet", "sheet-preview", "", true)+btn("Print / Save PDF", "sheet-print"))}<div id="ltSheetPreview"></div></article>`);
    previewSheet();
  }
  function sheetHTML(module, type, answers) {
    const title = h(ml(module,"title"));
    const top = `<header><p>MTP Digital · Agriculture Grade 9 · ${h(module.code)}</p><h1>${title}</h1><p>Name: ________________________ Class: __________ Date: __________</p></header>`;
    const lines = '<div class="lt-writing-lines"></div>';
    let body;
    if (type === "practical") body = `<h2>Practical project checklist</h2><p>${h(ml(module,"journal"))}</p><h3>Before starting</h3><p>☐ State the purpose. ☐ List materials. ☐ Plan steps. ☐ Discuss safety with your teacher.</p>${lines}<h3>During the activity</h3><p>☐ Follow the agreed steps. ☐ Handle materials carefully. ☐ Record observations. ☐ Label evidence or photographs.</p>${lines}<h3>After the activity</h3><p>☐ Record results. ☐ Clean and store materials. ☐ Explain what worked. ☐ Suggest one improvement.</p>${lines}<h3>Teacher assessment</h3><table><thead><tr><th>Criterion</th><th>Score (0–3)</th><th>Evidence / next step</th></tr></thead><tbody>${RUBRIC.map(([,label])=>`<tr><td>${label}</td><td>____</td><td>________________________</td></tr>`).join("")}</tbody></table>`;
    else if (type === "garden") body = `<h2>Garden observation sheet</h2><p>Crop / variety: ____________________ Treatment: ____________________</p><p>Experiment start date: __________ Question being investigated: ____________________</p><table><thead><tr><th>Date</th><th>Height (cm)</th><th>Water (L)</th><th>Harvest (kg)</th><th>Observations</th></tr></thead><tbody>${Array.from({length:8},()=>'<tr><td>________</td><td>________</td><td>________</td><td>________</td><td>________________</td></tr>').join("")}</tbody></table><h3>What changed? What might explain the results?</h3>${lines}`;
    else body = `<h2>Learning worksheet</h2><p>${h(ml(module,"summary"))}</p><h3>Explain in your own words</h3>${(ml(module,"prompts") || []).map((p,i)=>`<p>${i+1}. ${h(p)}</p>${lines}`).join("")}<h3>Check your understanding</h3>${module.quiz.map((q,i)=>{const translated=mlq(module,i);return `<p>${i+1}. ${h(translated.q)}</p><p>${translated.o.map((o,j)=>`${String.fromCharCode(65+j)}. ${h(o)}`).join(" &nbsp; ")}</p><p>Answer and reason: __________________________________________________</p>`;}).join("")}<h3>Practical task</h3><p>${h(ml(module,"journal"))}</p>${lines}`;
    const key = answers && type === "activity" ? `<section class="lt-answer-key"><h2>Teacher answer key · ${title}</h2>${module.quiz.map((q,i)=>{const j=q.o.indexOf(q.a);return `<p><strong>${i+1}. ${String.fromCharCode(65+j)} — ${h(mlq(module,i).o[j])}</strong><br>${h(explanation(module,i))}</p>`;}).join("")}<p>Open-ended responses: assess the learner's explanation, evidence and reasoning against the lesson goals.</p></section>` : "";
    return `<div class="lt-sheet">${top}${body}${key}</div>`;
  }
  function previewSheet() {
    const module = MODULES.find(m=>m.id===document.getElementById("ltSheetModule").value) || currentModule();
    const html = sheetHTML(module,document.getElementById("ltSheetType").value,document.getElementById("ltSheetAnswers").checked);
    document.getElementById("ltSheetPreview").innerHTML = html;
    return html;
  }
  function printSheet() {
    let printRoot = document.getElementById("ltPrintRoot");
    if (!printRoot) { printRoot=document.createElement("div");printRoot.id="ltPrintRoot";document.body.appendChild(printRoot); }
    printRoot.innerHTML = previewSheet();
    document.body.classList.add("printing-learning-sheet");
    const done = () => { document.body.classList.remove("printing-learning-sheet"); printRoot.replaceChildren(); };
    window.addEventListener("afterprint",done,{once:true});
    try { window.print(); } catch (err) { done(); throw err; }
  }

  // Cache inspection and downloads are independent of learner records.
  async function packs() {
    const core = ["index.html","styles/styles.css","styles/learning-tools.css","scripts/app.js","scripts/learning-tools.js","scripts/book-data.js","scripts/three-scenes.js","scripts/qr.js","assets/three.cjs","media/mtplogo.png","icons/icon.svg","pwa/manifest.json","pwa/book-figures.js"];
    const figures = await fetch("pwa/book-figures.js").then(r=>r.ok?r.text():"").catch(()=>"");
    const imagePaths = [...figures.matchAll(/"(media\/book-figures\/[^"\n]+)"/g)].map(m=>m[1]);
    const ai = [...document.querySelectorAll("script[data-mtp-ai-path]")].filter(el => !el.dataset.mtpAiPath.startsWith("@runtime/")).map(el => `assets/models/${el.dataset.mtpAiPath}`);
    return [{id:"lessons",label:"Lessons, textbook and pictures",urls:[...core,"assets/book.pdf",...imagePaths]},
      {id:"videos",label:"Lesson videos",urls:["hay-rake","leftovers-refrigerate","composting-basics","grain-bins","cleaning-toilet","hand-washing-laundry","plant-grafting","solar-heat"].map(n=>`media/videos/${n}.webm`)},
      {id:"ai",label:"Included CPU AI model and runtimes",urls:["assets/webllm/webllm.js","assets/webllm/SmolLM2-360M-Instruct-q4f16_1_cs1k-webgpu.wasm","assets/transformers/transformers.min.js","assets/transformers/ort-wasm-simd-threaded.jsep.js","assets/transformers/ort-wasm-simd-threaded.jsep.wasm",...ai]}];
  }
  const sizeLabel = n => n >= 1024*1024 ? `${(n/1024/1024).toFixed(1)} MB` : `${Math.ceil(n/1024)} KB`;
  async function cachedResponse(path) {
    const url = new URL(path,document.baseURI).href;
    const keys = (await caches.keys()).filter(k=>k.startsWith("mtp-agriculture-g9-"));
    for (const key of keys.reverse()) { const r = await (await caches.open(key)).match(url,{ignoreVary:true}); if (r) return r; }
    return null;
  }
  async function usableResponse(response) {
    if(!response?.ok || response.status===206)return false;
    const length=Number(response.headers.get("content-length"));
    if(length && length<1024 && (await response.clone().text()).startsWith("version https://git-lfs.github.com/spec/v1"))return false;
    return true;
  }
  async function renderDownloads() {
    const token=viewToken;
    content(`<article class="tool-card"><h3>Offline downloads</h3><p>Check saved files and download missing ones before leaving your internet connection.</p><p class="lt-notice">Offline app launch requires installation or a visit over HTTPS / localhost. AI files need a compatible device; saving them does not change model requirements.</p>
      <div id="ltPacks">Checking saved files…</div><p id="ltDownloadStatus" role="status"></p><progress id="ltDownloadProgress" max="1" value="0" aria-label="Download progress"></progress>
      ${buttons(btn("Refresh status","download-refresh")+btn("Cancel download","download-cancel",downloadBusy?"":"disabled"))}</article>`);
    if (!("caches" in window) || !window.isSecureContext || location.protocol==="file:") { document.getElementById("ltPacks").textContent="Downloads are available when this app is served over HTTPS or localhost."; return; }
    try {
      const groups=await packs();
      const cardsHTML=[];
      for (const group of groups) {
        let count=0,bytes=0;
        for (const url of group.urls) {
          const response=await cachedResponse(url);
          if (await usableResponse(response)) { count++; const header=Number(response.headers.get("content-length")); bytes+=header || (await response.blob()).size; }
        }
        cardsHTML.push(`<div class="lt-entry"><h4>${group.label}</h4><p>${count}/${group.urls.length} files saved · ${sizeLabel(bytes)} saved</p>${btn(count===group.urls.length?"Check and repair":"Download missing files","download",`data-pack="${group.id}" ${downloadBusy?"disabled":""}`)}</div>`);
      }
      if (token!==viewToken || !document.getElementById("ltPacks")) return;
      document.getElementById("ltPacks").innerHTML=cardsHTML.join("");
      if (navigator.storage?.estimate) { const estimate=await navigator.storage.estimate(); if (token===viewToken) status(`Device storage: ${sizeLabel(estimate.usage||0)} used${estimate.quota?` of ${sizeLabel(estimate.quota)}`:""}.`); }
    } catch(err) { if(token===viewToken) error(err); }
  }
  async function downloadPack(id) {
    if(downloadBusy) return;
    downloadBusy=true; downloadAbort=new AbortController();
    const signal=downloadAbort.signal;
    const report=message=>{const el=document.getElementById("ltDownloadStatus");if(el)el.textContent=message;};
    document.querySelectorAll('[data-lt-action="download"]').forEach(b=>b.disabled=true);
    const cancel=document.querySelector('[data-lt-action="download-cancel"]');if(cancel)cancel.disabled=false;
    try {
      const group=(await packs()).find(g=>g.id===id); if(!group)throw new Error("Unknown download group.");
      const keys=(await caches.keys()).filter(k=>k.startsWith("mtp-agriculture-g9-v") && /v\d+$/.test(k));
      const key=keys.sort((a,b)=>Number(a.match(/v(\d+)$/)[1])-Number(b.match(/v(\d+)$/)[1])).at(-1) || "mtp-agriculture-g9-v19";
      const cache=await caches.open(key);let completed=0,bytes=0,failures=0;
      const meter=document.getElementById("ltDownloadProgress");if(meter){meter.max=group.urls.length;meter.value=0;}
      for(const path of group.urls) {
        if(signal.aborted)break;
        try {
          let response=await cachedResponse(path);
          if(!await usableResponse(response)) {
            report(`Saving ${path}…`);
            const embedded=document.querySelector(`script[data-mtp-ai-path="${path.replace("assets/models/","")}"]`);
            if(embedded) {
              const decoded=atob(embedded.textContent.trim()); const buffer=Uint8Array.from(decoded,c=>c.charCodeAt(0));
              response=new Response(buffer,{headers:{"Content-Type":embedded.dataset.mime||"application/octet-stream","Content-Length":String(buffer.byteLength)}});
            } else response=await fetch(new URL(path,document.baseURI),{signal,cache:"no-cache"});
            if(!await usableResponse(response))throw new Error(`Could not download ${path}`);
            bytes+=(await response.clone().blob()).size;
            await cache.put(new URL(path,document.baseURI).href,response);
          }
        } catch(err) { if(signal.aborted)break; failures++; }
        completed++;const progressEl=document.getElementById("ltDownloadProgress");if(progressEl){progressEl.max=group.urls.length;progressEl.value=completed;}
        report(`${completed}/${group.urls.length} files checked · ${sizeLabel(bytes)} downloaded${failures?` · ${failures} failed`:""}`);
      }
      const message=signal.aborted?"Download cancelled. Files already saved are kept.":failures?`${failures} files could not be saved. Check your connection or storage and retry.`:"Download complete. All files in this group are saved.";
      report(message);showToast(message,failures?"warn":"info");
    } finally {
      downloadBusy=false;downloadAbort=null;
      document.querySelectorAll('[data-lt-action="download"]').forEach(b=>b.disabled=false);
      const cancelButton=document.querySelector('[data-lt-action="download-cancel"]');if(cancelButton)cancelButton.disabled=true;
    }
  }
  function downloadFile(value,name,type="application/json") {
    const blob=new Blob([typeof value==="string"?value:JSON.stringify(value,null,2)],{type});
    const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function bundle(kind="portfolio") {
    const learnerId=activeLearnerProfileId();const snapshot=JSON.parse(JSON.stringify(progress));
    const entries=snapshot.tools?.portfolio||[]; const photos={};
    for(const key of [...new Set(entries.flatMap(e=>e.photos))]) {
      const blob=await photo("get",key);if(!blob)throw new Error("A project photo is missing. Remove that project or restore the photo before exporting.");
      photos[key]=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Could not read photo."));reader.readAsDataURL(blob);});
    }
    return {format:"mtp-learning-v1",kind,learner:{id:learnerId,name:getProfile(learnerId)?.name||"Student"},created:day(),
      tools:kind==="backup"?snapshot.tools:{portfolio:entries},progress:kind==="backup"?snapshot:undefined,photos};
  }
  async function importBundle(file,kind) {
    if(!writable())return;
    const profileId=activeLearnerProfileId();const profile= currentProfile;
    const value=JSON.parse(await file.text());
    if(value.format!=="mtp-learning-v1" || !["portfolio","backup","feedback"].includes(value.kind))throw new Error("This is not an MTP learning export.");
    if(profileId!==activeLearnerProfileId() || profile!==currentProfile)throw new Error("The profile changed during import. Please retry.");
    if(kind==="feedback") {
      if(value.kind!=="feedback")throw new Error("Choose a teacher feedback file.");
      const matches=list(value.assessments).filter(a=>data().portfolio.some(e=>e.id===a.entryId));
      if(!matches.length)throw new Error("No matching projects were found in this learner's portfolio.");
      const validated=matches.map(a=>({entryId:a.entryId,assessment:normalizeAssessment(a.assessment)}));
      if(validated.some(a=>!a.assessment))throw new Error("This feedback file contains invalid scores.");
      validated.forEach(a=>{data().portfolio.find(e=>e.id===a.entryId).assessment=a.assessment;});save();refresh();status(`Imported feedback for ${validated.length} project(s).`);return;
    }
    if(value.kind==="feedback")throw new Error("Choose a project or learning backup file.");
    if(kind==="backup" && value.kind!=="backup")throw new Error("Choose a learning backup file, or use Import project file in the portfolio.");
    const incoming=normalize(value.tools);const keys=new Map();const savedPhotoKeys=[];
    try {
      // Generate local photo keys: imported files cannot overwrite another learner's images.
      for(const old of [...new Set(incoming.portfolio.flatMap(e=>e.photos))]) {
        const encoded=obj(value.photos)[old];
        if(typeof encoded!=="string" || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(encoded) || encoded.length>3000000)throw new Error("A project photo is missing or invalid.");
        const blob=await fetch(encoded).then(r=>r.blob());const key=`${profileId}:${uid()}`;await photo("put",key,blob);keys.set(old,key);savedPhotoKeys.push(key);
      }
      if(profileId!==activeLearnerProfileId() || profile!==currentProfile)throw new Error("The profile changed during import. Please retry.");
      incoming.portfolio.forEach(e=>{e.photos=e.photos.map(k=>keys.get(k));});
      const existing=new Set(data().portfolio.map(e=>e.id));
      const additions=incoming.portfolio.filter(e=>!existing.has(e.id));
      if(data().portfolio.length+additions.length>500)throw new Error("The portfolio limit is 500 projects. Export and remove older projects first.");
      const experimentAdditions=value.kind==="backup"?incoming.experiments.filter(e=>!data().experiments.some(existing=>existing.id===e.id)):[];
      const budgetAdditions=value.kind==="backup"?incoming.budgets.filter(b=>!data().budgets.some(existing=>existing.id===b.id)):[];
      if(data().experiments.length+experimentAdditions.length>100 || data().budgets.length+budgetAdditions.length>100)throw new Error("This import would exceed 100 experiments or budget plans. Export and remove older records first.");
      // Remove unused duplicate photo copies before committing any metadata.
      const used=new Set(additions.flatMap(e=>e.photos));for(const key of savedPhotoKeys)if(!used.has(key))await photo("delete",key);
      if(profileId!==activeLearnerProfileId() || profile!==currentProfile)throw new Error("The profile changed during import. Please retry.");
      data().portfolio.push(...additions);
      if(value.kind==="backup") {
        data().experiments.push(...experimentAdditions);
        data().budgets.push(...budgetAdditions);
        Object.assign(data().reviews,incoming.reviews);Object.assign(data().mastered,incoming.mastered);
        if(kind==="backup")mergeProgress(value.progress);
      }
      save();refresh();status(`Imported ${additions.length} project(s)${value.kind==="backup"?" and learning-tool records":""}.`);
    } catch(err) { for(const key of savedPhotoKeys)await photo("delete",key).catch(()=>{});throw err; }
  }
  function mergeProgress(saved) {
    const source=obj(saved);
    // Imports merge only recognized course data. Existing notes and higher scores
    // remain intact, and identity always comes from the selected local profile.
    for(const module of MODULES) {
      const id=module.id;
      if(obj(source.learned)[id]===true)progress.learned[id]=true;
      if(obj(source.games)[id]===true)progress.games[id]=true;
      const score=obj(source.quizScores)[id];
      if(typeof score==="number" && Number.isFinite(score) && score>=0 && score<=100)progress.quizScores[id]=Math.max(progress.quizScores[id]||0,score);
      const note=obj(source.notes)[id];
      if(typeof note==="string" && !progress.notes[id])progress.notes[id]=note.slice(0,100000);
      const history=list(obj(source.quizHistory)[id]).filter(n=>typeof n==="number"&&Number.isFinite(n)&&n>=0&&n<=100).slice(-100);
      if(!progress.quizHistory[id]?.length && history.length)progress.quizHistory[id]=history;
      for(let i=0;i<module.quiz.length;i++) {
        const miss=Number(obj(obj(source.quizMisses)[id])[i]);
        if(Number.isInteger(miss)&&miss>0&&miss<=100000){progress.quizMisses[id]=progress.quizMisses[id]||{};progress.quizMisses[id][i]=Math.max(progress.quizMisses[id][i]||0,miss);}
      }
    }
    for(const key of ["flashcardsDone","visitedModules"])progress[key]=[...new Set([...list(progress[key]),...list(source[key]).filter(moduleExists)])];
    progress.badges=[...new Set([...progress.badges,...list(source.badges).filter(id=>BADGES.some(b=>b.id===id))])];
    if(typeof source.xp==="number"&&Number.isFinite(source.xp)&&source.xp>=0&&source.xp<=10000000)progress.xp=Math.max(progress.xp,source.xp);
  }
  async function removePhotos(entries) {
    for(const key of list(entries).flatMap(e=>list(e.photos)))await photo("delete",key).catch(()=>{});
  }
  const csvCell = value => `"${String(value??"").replace(/^[=+@-]/,"'$&").replace(/"/g,'""')}"`;
  async function onSubmit(event) {
    const form=event.target.closest("[data-lt-form]");if(!form)return;event.preventDefault();
    const kind=form.dataset.ltForm;const values=Object.fromEntries(new FormData(form));
    const profileId=activeLearnerProfileId();const actor=currentProfile;const moduleId=state.moduleId;const token=viewToken;
    const submit=form.querySelector('[type="submit"]');submit.disabled=true;
    try {
      if(kind==="budget") { const result=calculateBudget(values);renderBudget(values,result);return; }
      if(kind==="rubric") {
        if(currentProfile.role!=="teacher")throw new Error("Only a teacher profile can save an assessment.");
        const entry=data().portfolio.find(e=>e.id===form.dataset.entry);if(!entry)throw new Error("Project not found.");
        const scores=Object.fromEntries(RUBRIC.map(([key])=>[key,number(values[key],3)]));
        entry.assessment=normalizeAssessment({scores,feedback:values.feedback,teacher:currentProfile.name,date:day()});
        if(!entry.assessment)throw new Error("Choose a score from 0 to 3 for every criterion.");
        save();refresh();showToast("Practical feedback saved.","success");return;
      }
      if(!writable())return;
      if(kind==="portfolio") {
        if(data().portfolio.length>=500)throw new Error("Export and remove older projects before adding more than 500.");
        if(!text(values.title))throw new Error("Give your project a title.");
        if(!validDay(values.date)||values.date>day())throw new Error("Choose a valid activity date up to today.");
        if(!text(values.observations)&&!text(values.results))throw new Error("Add observations or results before saving.");
        const files=[...form.elements.photos.files];if(files.length>3)throw new Error("Choose up to three photos per project.");
        const blobs=await Promise.all(files.map(compress));const keys=[];
        try {
          for(const blob of blobs){const key=`${profileId}:${uid()}`;await photo("put",key,blob);keys.push(key);}
          if(profileId!==activeLearnerProfileId()||actor!==currentProfile)throw new Error("The profile changed while saving. Please retry.");
          data().portfolio.push({id:uid(),moduleId,title:text(values.title,100),date:values.date,observations:text(values.observations),results:text(values.results),photos:keys,assessment:null});save();
        } catch(err) {for(const key of keys)await photo("delete",key).catch(()=>{});throw err;}
      }
      if(kind==="experiment") {
        if(data().experiments.length>=100)throw new Error("Export and remove an older experiment before creating more than 100.");
        if(!text(values.title)||!text(values.crop)||!validDay(values.start)||values.start>day())throw new Error("Enter a name, crop and valid start date.");
        const experiment={id:uid(),title:text(values.title,100),crop:text(values.crop,100),start:values.start,treatment:text(values.treatment,300),records:[]};data().experiments.unshift(experiment);save();
      }
      if(kind==="observation") {
        const experiment=data().experiments.find(e=>e.id===form.dataset.experiment);if(!experiment)throw new Error("Experiment not found.");
        if(experiment.records.length>=1000)throw new Error("This experiment has reached 1,000 observations.");
        if(!validDay(values.date)||values.date<experiment.start||values.date>day())throw new Error("Choose a date between the experiment start and today.");
        experiment.records.push({id:uid(),date:values.date,height:number(values.height),water:number(values.water),harvest:number(values.harvest),notes:text(values.notes,1000)});save();
        renderGarden(experiment.id);showToast("Observation saved.","success");return;
      }
      if(token===viewToken)refresh();showToast("Saved to this learner's profile.","success");
    } catch(err) {error(err);} finally {if(submit.isConnected)submit.disabled=false;}
  }
  async function onClick(event) {
    const nav=event.target.closest("[data-lt-section]");if(nav){section=nav.dataset.ltSection;refresh();return;}
    const button=event.target.closest("[data-lt-action]");if(!button||button.disabled)return;
    const action=button.dataset.ltAction;
    try {
      if(action==="backup"||action==="portfolio-export") {button.disabled=true;status("Preparing export, including project photographs…");downloadFile(await bundle(action==="backup"?"backup":"portfolio"),`agriculture-${action==="backup"?"learning-backup":"projects"}.json`);status("Export ready. Keep the downloaded file for backup or sharing.");}
      if(action==="to-portfolio"){section="portfolio";refresh();}
      if(action==="project-delete") {if(!writable()||!confirm("Delete this project and its photos from this device?"))return;const entry=data().portfolio.find(e=>e.id===button.dataset.id);if(entry){data().portfolio=data().portfolio.filter(e=>e!==entry);save();for(const key of entry.photos)await photo("delete",key).catch(()=>{});refresh();}}
      if(action==="lesson"){state.moduleId=button.dataset.module;state.view="learn";render();}
      if(action==="revise") {
        if(!writable())return;const module=MODULES.find(m=>m.id===button.dataset.module);const index=Number(button.dataset.index);const q=module.quiz[index];const correct=q.o[Number(button.dataset.option)]===q.a;
        const entry=button.closest("[data-lt-question]");entry.querySelector(".lt-feedback").innerHTML=`<strong>${correct?"Correct — this question is now revised.":"Try again."}</strong><p>${h(explanation(module,index))}</p>`;
        if(correct){data().mastered[`${module.id}:${index}`]=true;entry.querySelectorAll('[data-lt-action="revise"]').forEach(b=>b.disabled=true);}save();
      }
      if(action==="rate") {const review=rateCard(button.dataset.key,button.dataset.rating);if(review){const all=document.querySelector("[data-lt-all-cards]")?.checked;renderReviews(all);status(`Next review: ${review.due}.`);}}
      if(action==="feedback-export") {downloadFile({format:"mtp-learning-v1",kind:"feedback",learner:{id:activeLearnerProfileId(),name:currentLearnerProfile()?.name},assessments:data().portfolio.filter(e=>e.assessment).map(e=>({entryId:e.id,assessment:e.assessment}))},"agriculture-practical-feedback.json");}
      if(action==="garden-export") {const experiment=data().experiments.find(e=>e.id===button.dataset.id);if(experiment){const rows=[["Date","Height (cm)","Water (L)","Harvest (kg)","Notes"],...experiment.records.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(r=>[r.date,r.height,r.water,r.harvest,r.notes])];downloadFile(rows.map(r=>r.map(csvCell).join(",")).join("\r\n"),"agriculture-garden-observations.csv","text/csv;charset=utf-8");}}
      if(action==="experiment-delete") {if(!writable()||!confirm("Delete this experiment and all its measurements?"))return;data().experiments=data().experiments.filter(e=>e.id!==button.dataset.id);save();renderGarden();}
      if(action==="record-delete") {if(!writable()||!confirm("Delete this observation?"))return;const experiment=data().experiments.find(e=>e.id===button.dataset.experiment);if(experiment){experiment.records=experiment.records.filter(r=>r.id!==button.dataset.id);save();renderGarden(experiment.id);}}
      if(action==="budget-save") {if(!writable())return;if(data().budgets.length>=100)throw new Error("Export and remove an older plan before saving more than 100.");const plan=button._plan;if(!plan)throw new Error("Calculate a plan first.");data().budgets.push({id:uid(),moduleId:state.moduleId,date:day(),title:text(plan.title,100),plan,...calculateBudget(plan)});save();renderBudget(plan,calculateBudget(plan));status("Budget plan saved.");}
      if(action==="budget-open") {const budget=data().budgets.find(b=>b.id===button.dataset.id);if(budget)renderBudget(budget.plan,calculateBudget(budget.plan));}
      if(action==="budget-delete") {if(!writable()||!confirm("Delete this saved budget plan?"))return;data().budgets=data().budgets.filter(b=>b.id!==button.dataset.id);save();renderBudget();}
      if(action==="sheet-preview")previewSheet();
      if(action==="sheet-print")printSheet();
      if(action==="download-refresh")renderDownloads();
      if(action==="download")await downloadPack(button.dataset.pack);
      if(action==="download-cancel")downloadAbort?.abort();
    } catch(err){error(err);} finally {if(button.isConnected && action!=="revise")button.disabled=false;}
  }
  async function onChange(event) {
    const el=event.target;
    try {
      if(el.matches("[data-lt-all-mistakes]"))renderRevision(el.checked);
      if(el.matches("[data-lt-all-cards]"))renderReviews(el.checked);
      if(el.matches("[data-lt-experiment]"))renderGarden(el.value);
      if(el.matches("[data-lt-learner]")){selectLearnerForViewer(el.value);section="rubrics";refresh();}
      if(el.matches("[data-lt-import]")){if(el.files[0])await importBundle(el.files[0],el.dataset.ltImport);}
      if(["ltSheetModule","ltSheetType","ltSheetAnswers"].includes(el.id))previewSheet();
    } catch(err){error(err);} finally {if(el.type==="file")el.value="";}
  }
  document.addEventListener("click",event=>{const b=event.target.closest("[data-open-learning-tool]");if(b)open(b.dataset.openLearningTool);});
  window.addEventListener("beforeunload",releasePhotos);
  return {open,render:renderTools,cleanup,normalize,schedule,cards,rateCard,recordQuiz,explanation,calculateBudget,sheetHTML,bundle,removePhotos};
})();
