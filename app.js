/* ── UI Utilities ───────────────────────────────────────────── */

function addRipple(event) {
  const btn = event.currentTarget || event.target;
  if (!btn || !btn.getBoundingClientRect) return;
  const rect = btn.getBoundingClientRect();
  const r = Math.max(rect.width, rect.height) * 1.4;
  const x = event.clientX - rect.left - r / 2;
  const y = event.clientY - rect.top  - r / 2;
  const el = document.createElement("span");
  el.className = "ripple";
  el.style.cssText = `width:${r}px;height:${r}px;left:${x}px;top:${y}px`;
  btn.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-hiding");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3200);
}

function animateValue(el, target, duration = 800, suffix = "") {
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function triggerCelebration(mount) {
  if (!mount) return;
  const banner = document.createElement("div");
  banner.className = "celebration-banner";
  banner.innerHTML = `
    <img src="mtplogo.png" alt="MTP Logo" style="width: 64px; height: 64px; object-fit: contain; margin-bottom: 10px; border-radius: 12px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); padding: 4px; box-shadow: 0 4px 12px rgba(35,208,109,0.3)">
    <h3>Excellent Work!</h3>
    <p>Game completed and saved to your progress.</p>
  `;
  mount.prepend(banner);
  setTimeout(() => {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-20px)';
    setTimeout(() => banner.remove(), 400);
  }, 4000);
}

/* ── End UI Utilities ─────────────────────────────────────────── */

const MODULES = [
  {
    id: "hay",
    strand: "Conservation of Resources",
    title: "Conserving Animal Feed: Hay",
    pages: [1, 8],
    color: "#2f7d4f",
    icon: "H",
    game: "hayLab",
    summary:
      "Conserve forage as baled hay, stacked residues, or standing hay so animals have feed during dry seasons.",
    goals: [
      "Explain forage, pasture, fodder crops, and hay.",
      "Choose suitable forage crops and harvest at the flowering stage.",
      "Dry, bale, stack, and store hay in ways that preserve nutritive value.",
    ],
    ideas: [
      "Good hay is cut forage dried to about 15 to 20 percent moisture.",
      "Hot dry weather, regular turning, and raised dry storage protect quality.",
      "Baled hay usually has higher nutritive value than stovers or standing hay.",
    ],
    activities: ["Pair talk", "Digital search", "Forage conservation project", "Gallery walk"],
    journal:
      "Plan a small hay conservation project for your home or school. Name the forage, tools, drying method, and storage place.",
    quiz: [
      {
        q: "At which stage should forage crops be harvested for high quality hay?",
        a: "Flowering stage",
        o: ["Seedling stage", "Flowering stage", "After rotting", "During rain"],
      },
      {
        q: "Why should hay be stored in a raised, well aerated shed?",
        a: "To keep it dry and reduce nutrient loss",
        o: ["To increase moisture", "To keep it dry and reduce nutrient loss", "To attract pests", "To bleach it quickly"],
      },
      {
        q: "Which method lets animals graze forage left growing in the field during the dry season?",
        a: "Standing hay",
        o: ["Baled hay", "Standing hay", "Deep frying", "Grafting"],
      },
    ],
  },
  {
    id: "leftovers",
    strand: "Conservation of Resources",
    title: "Conserving Leftover Foods",
    pages: [9, 17],
    color: "#a4522b",
    icon: "L",
    game: "leftoverSort",
    summary:
      "Handle leftover food safely by storing, sharing, reheating, recooking, or discarding spoiled food.",
    goals: [
      "Identify safe ways to conserve leftover food.",
      "Explain the benefits of preventing food wastage.",
      "Prepare simple meals from leftover ugali, chapati, arrowroots, githeri, and rice.",
    ],
    ideas: [
      "Leftovers should be kept in clean covered containers in a refrigerator or cool place.",
      "Food with foul smell, unusual colour, or unusual texture should be thrown away.",
      "Conserving leftovers saves food, money, fuel, labour, and time.",
    ],
    activities: ["Food safety scenario", "Recipe collection", "Ugali toast", "Mukimo from githeri"],
    journal:
      "Write a safe leftover recipe from your home. Include the original food, storage method, preparation steps, and safety check.",
    quiz: [
      {
        q: "What should be done with leftover rice that smells unusual?",
        a: "Throw it away",
        o: ["Serve it cold", "Throw it away", "Mix it with spices only", "Store it for another week"],
      },
      {
        q: "Which practice helps prevent contamination of leftover food?",
        a: "Keeping it covered in a clean container",
        o: ["Leaving it uncovered", "Keeping it covered in a clean container", "Putting it on the floor", "Touching it with dirty hands"],
      },
      {
        q: "Turning leftover food into a new meal mainly helps to reduce what?",
        a: "Food wastage",
        o: ["Food wastage", "Cleanliness", "Cooking skill", "Ventilation"],
      },
    ],
  },
  {
    id: "integrated",
    strand: "Conservation of Resources",
    title: "Integrated Farming",
    pages: [18, 22],
    color: "#226b8f",
    icon: "I",
    game: "farmLoop",
    summary:
      "Recycle resources between crops, animals, fish, water, and waste to reduce cost and improve farm output.",
    goals: [
      "Describe integrated farming as a resource recycling system.",
      "Connect crop residues, manure, water, fish ponds, and gardens.",
      "Explain how integration supports income and food security.",
    ],
    ideas: [
      "Waste from one farm activity can become an input for another.",
      "Animal manure can improve soil fertility or feed compost and biogas systems.",
      "Integrated farms reduce waste and make better use of land, water, and labour.",
    ],
    activities: ["Farm resource map", "Group discussion", "Home farm audit"],
    journal:
      "Draw or describe a circular farm system that reuses at least four resources before anything becomes waste.",
    quiz: [
      {
        q: "What is the main idea behind integrated farming?",
        a: "Recycling resources within the farm",
        o: ["Using one crop only", "Recycling resources within the farm", "Avoiding animals", "Burning all residues"],
      },
      {
        q: "Which resource from livestock can improve a crop garden?",
        a: "Manure",
        o: ["Plastic", "Manure", "Smoke", "Rust"],
      },
      {
        q: "A well planned integrated farm mostly helps to reduce what?",
        a: "Waste and production costs",
        o: ["Food supply", "Waste and production costs", "Soil life", "Water storage"],
      },
    ],
  },
  {
    id: "organic",
    strand: "Food Production Processes",
    title: "Organic Gardening",
    pages: [23, 41],
    color: "#4d7d2f",
    icon: "O",
    game: "gardenPlanner",
    summary:
      "Grow vegetables, legumes, and spices using compost, manure, mulching, rotation, natural pesticides, and careful harvesting.",
    goals: [
      "Prepare an organic garden and raise crops responsibly.",
      "Use organic soil fertility and pest management practices.",
      "Harvest crops at the right stage while observing hygiene.",
    ],
    ideas: [
      "Organic gardening avoids over-reliance on artificial fertilizers and pesticides.",
      "Compost, manure, mulch, irrigation, and top dressing support healthy crops.",
      "Crop rotation, companion planting, field hygiene, and natural predators reduce pests and diseases.",
    ],
    activities: ["Garden duty schedule", "Natural pesticide lab", "Harvesting table", "Portfolio photos"],
    journal:
      "Choose one crop from your area and create a weekly organic garden care schedule from planting to harvest.",
    quiz: [
      {
        q: "Which practice helps suppress weeds and conserve soil moisture in an organic garden?",
        a: "Mulching",
        o: ["Mulching", "Flooding every day", "Burning compost", "Leaving soil bare"],
      },
      {
        q: "Why should related crops be rotated instead of planted repeatedly in the same site?",
        a: "They may share pests and diseases",
        o: ["They may share pests and diseases", "They cannot use water", "They stop sunlight", "They need no soil"],
      },
      {
        q: "Which is a natural pesticide ingredient mentioned in the book?",
        a: "Hot pepper",
        o: ["Hot pepper", "Motor oil", "Paint ash", "Bleach"],
      },
    ],
  },
  {
    id: "storage",
    strand: "Food Production Processes",
    title: "Storage of Crop Produce",
    pages: [42, 46],
    color: "#7c5d2a",
    icon: "S",
    game: "storageInspector",
    summary:
      "Prepare and manage granaries, rooms, bags, jars, and containers so grains and tubers remain safe.",
    goals: [
      "Identify storage structures and facilities for crop produce.",
      "Prepare stores by cleaning, drying, sealing, and pest-proofing.",
      "Manage stored produce to prevent mould, pests, wetness, and bad odours.",
    ],
    ideas: [
      "Storage facilities should be dry, clean, cool, ventilated, and secure from pests.",
      "Old produce remains, dust, leaks, broken parts, and vegetation around stores must be handled.",
      "Spoilt or infested produce should be removed to prevent spread.",
    ],
    activities: ["Storage structure inspection", "Prepare a school store", "Food safety case study"],
    journal:
      "Inspect a food storage place at home or school. List three risks and three actions that would make it safer.",
    quiz: [
      {
        q: "Why should a crop storage facility be kept dry?",
        a: "To reduce rotting and mould growth",
        o: ["To reduce rotting and mould growth", "To make grains wet", "To attract rodents", "To stop air circulation"],
      },
      {
        q: "Which action helps prevent pests from entering a storage container?",
        a: "Using a tightly fitting lid",
        o: ["Using a tightly fitting lid", "Leaving it open", "Adding water", "Keeping broken parts"],
      },
      {
        q: "What should be done when rotten grains are found in a sack?",
        a: "Remove them to protect the rest",
        o: ["Return them to the sack", "Remove them to protect the rest", "Mix them with clean grain", "Wet the sack"],
      },
    ],
  },
  {
    id: "flour",
    strand: "Food Production Processes",
    title: "Cooking: Using Flour Mixtures",
    pages: [47, 54],
    color: "#b57922",
    icon: "F",
    game: "flourMixer",
    summary:
      "Use batter and dough to prepare pancakes, chapati, mandazi, doughnuts, bread, and coated foods.",
    goals: [
      "Distinguish batter from dough by consistency and ingredients.",
      "Prepare batter and dough using correct procedures.",
      "Match flour mixtures with shallow frying, deep frying, and baking products.",
    ],
    ideas: [
      "Batter has a flowing consistency and may be thin or thick.",
      "Dough is soft but firm, elastic, and can be kneaded, rolled, and shaped.",
      "Thin batter makes pancakes; dough makes chapati, mandazi, doughnuts, and bread.",
    ],
    activities: ["Prepare batter", "Prepare dough", "Pancake practical", "Chapati and mandazi practical"],
    journal:
      "Compare batter and dough in a table. Include water level, texture, handling method, and two products.",
    quiz: [
      {
        q: "Which flour mixture has a flowing consistency?",
        a: "Batter",
        o: ["Batter", "Dough", "Hay", "Compost"],
      },
      {
        q: "Which product is commonly made from thin batter?",
        a: "Pancakes",
        o: ["Pancakes", "Chapati", "Mandazi", "Bread"],
      },
      {
        q: "What can be done to dough but not to thin batter?",
        a: "Knead and roll it",
        o: ["Knead and roll it", "Pour it easily", "Use it as spray", "Disinfect it"],
      },
    ],
  },
  {
    id: "waste",
    strand: "Hygiene Practices",
    title: "Cleaning Waste Disposal Facilities",
    pages: [55, 62],
    color: "#2c7378",
    icon: "W",
    game: "cleanupOrder",
    summary:
      "Clean bins, sinks, and drains using correct tools, detergents, disinfectants, and safe procedures.",
    goals: [
      "Identify household waste disposal facilities.",
      "Clean waste bins, sinks, cemented drains, and earthen drains safely.",
      "Explain why regular cleaning protects health.",
    ],
    ideas: [
      "Gloves protect hands from dirt and germs during cleaning.",
      "Sinks and drains should be cleared, scrubbed, rinsed, and flushed.",
      "Waste bin liners and regular duty rosters help maintain cleanliness.",
    ],
    activities: ["Waste bin duty roster", "Kitchen sink cleaning", "Drain cleaning practical"],
    journal:
      "Create a weekly cleaning roster for one waste disposal facility. Include tools, safety, and inspection points.",
    quiz: [
      {
        q: "Why should gloves be worn when cleaning waste disposal facilities?",
        a: "To protect hands from dirt and germs",
        o: ["To protect hands from dirt and germs", "To dry the sink", "To increase bad odour", "To store grains"],
      },
      {
        q: "What can a clogged sink cause?",
        a: "Build-up of dirt and poor drainage",
        o: ["Build-up of dirt and poor drainage", "Better ventilation", "Drier produce", "Cleaner crops"],
      },
      {
        q: "Why are waste bin liners useful?",
        a: "They make bins easier to keep clean",
        o: ["They make bins easier to keep clean", "They attract pests", "They replace washing forever", "They block drains"],
      },
    ],
  },
  {
    id: "disinfecting",
    strand: "Hygiene Practices",
    title: "Disinfecting Clothing and Household Articles",
    pages: [63, 71],
    color: "#b54863",
    icon: "D",
    game: "disinfectMatch",
    summary:
      "Use boiling, disinfectants, sunlight, salting, and ironing to reduce spread of communicable diseases.",
    goals: [
      "Describe five methods of disinfecting clothing and household articles.",
      "Choose methods suitable for different fabrics and situations.",
      "Observe precautions to prevent burns, scalds, and infections.",
    ],
    ideas: [
      "Boiling works well for white cotton and linen that can withstand heat.",
      "Disinfectants are useful for fabrics damaged by boiling, but label instructions matter.",
      "Combining methods such as sunlight and ironing can improve effectiveness.",
    ],
    activities: ["Crossword", "Boiling practical", "Disinfectant practical", "Sun drying and ironing"],
    journal:
      "Choose one household article and write the safest disinfecting method for it, including materials and precautions.",
    quiz: [
      {
        q: "Which method uses high water temperature to kill germs on suitable fabrics?",
        a: "Boiling",
        o: ["Boiling", "Mulching", "Grafting", "Baling"],
      },
      {
        q: "Which method uses UV rays outdoors?",
        a: "Sunlight",
        o: ["Sunlight", "Salting", "Dusting", "Composting"],
      },
      {
        q: "Why must disinfectant labels be read carefully?",
        a: "To follow safe and effective use instructions",
        o: ["To follow safe and effective use instructions", "To change the fabric colour", "To make water colder", "To avoid rinsing always"],
      },
    ],
  },
  {
    id: "grafting",
    strand: "Production Techniques",
    title: "Grafting in Plants",
    pages: [72, 75],
    color: "#6f6b2f",
    icon: "G",
    game: "graftingLab",
    summary:
      "Join a scion and rootstock from closely related plants to improve fruits, flowers, repair, or rejuvenate plants.",
    goals: [
      "Identify scion, rootstock, and graft union.",
      "Carry out safe V-cut grafting and seal the union.",
      "Care for the grafted seedling until the union heals.",
    ],
    ideas: [
      "The scion is the upper desired plant part; the rootstock is the lower seedling.",
      "A smooth matching cut, tight tying, and sealing protect the graft union.",
      "Water carefully, protect the plant, remove buds below the union, and remove tape after healing.",
    ],
    activities: ["Plant search", "Guided grafting practical", "Seedling care", "Conflict resolution case"],
    journal:
      "Explain how you would repair a damaged mango seedling by grafting. Include safety precautions for sharp tools.",
    quiz: [
      {
        q: "What is the upper part of a grafted plant called?",
        a: "Scion",
        o: ["Scion", "Rootstock", "Tray", "Granary"],
      },
      {
        q: "Why is the graft union sealed?",
        a: "To prevent water entry and rotting",
        o: ["To prevent water entry and rotting", "To make it loose", "To stop all growth", "To attract pests"],
      },
      {
        q: "Which care practice helps only the desired branch grow?",
        a: "Removing buds below the graft union",
        o: ["Removing buds below the graft union", "Splashing water on the union", "Leaving tape forever", "Breaking the scion"],
      },
    ],
  },
  {
    id: "sunDryer",
    strand: "Production Techniques",
    title: "Homemade Sun Dryer",
    pages: [76, 79],
    color: "#d18a27",
    icon: "U",
    game: "sunDryer",
    summary:
      "Construct and use a transparent covered dryer with trays to preserve leafy vegetables through controlled sun drying.",
    goals: [
      "Identify frame, tray, transparent covering, and suitable position.",
      "Construct a sun dryer using locally available materials.",
      "Dry vegetables hygienically in a single layer and store them safely.",
    ],
    ideas: [
      "A transparent cover lets sunlight enter and helps trap heat like a small greenhouse.",
      "Wire mesh trays hold vegetables and allow air circulation.",
      "Clean vegetables, even spreading, turning, and dry storage help preserve quality.",
    ],
    activities: ["Sun dryer sketch", "Construction practical", "Temperature test", "Home food security project"],
    journal:
      "Sketch a sun dryer you can build locally. List frame, tray, cover, cleaning steps, and how you will test it.",
    quiz: [
      {
        q: "Why does a homemade sun dryer need a transparent cover?",
        a: "To allow sunlight in and trap heat",
        o: ["To allow sunlight in and trap heat", "To block all light", "To keep vegetables wet", "To invite pests"],
      },
      {
        q: "Why should leafy vegetables be arranged in a single layer?",
        a: "To allow air circulation and even drying",
        o: ["To allow air circulation and even drying", "To make drying slower", "To hide dirt", "To block heat"],
      },
      {
        q: "When it is very cold at night, what should be done with the sun dryer?",
        a: "Put it inside a room",
        o: ["Put it inside a room", "Leave it in rain", "Add more water", "Open the door all night"],
      },
    ],
  },
];

const STORAGE_KEY = "agriNutritionGrade9Progress";
const THEME_KEY = "agriNutritionGrade9Theme";
const state = {
  moduleId: "hay",
  view: "learn",
  globalSearch: "",
  quizAnswers: {},
  theme: localStorage.getItem(THEME_KEY) || "liquid",
};

const params = new URLSearchParams(window.location.search);
if (MODULES.some((module) => module.id === params.get("module"))) {
  state.moduleId = params.get("module");
}
if (["learn", "play", "quiz", "reader", "journal"].includes(params.get("view"))) {
  state.view = params.get("view");
}

let progress = loadProgress();

const els = {
  moduleList: document.getElementById("moduleList"),
  courseProgressText: document.getElementById("courseProgressText"),
  courseProgressBar: document.getElementById("courseProgressBar"),
  moduleHero: document.getElementById("moduleHero"),
  viewHost: document.getElementById("viewHost"),
  globalSearch: document.getElementById("globalSearch"),
  openPdfButton: document.getElementById("openPdfButton"),
  resetProgressButton: document.getElementById("resetProgressButton"),
};

function applyTheme() {
  document.body.style.transition = "background 0.50s ease, color 0.35s ease";
  document.body.dataset.theme = state.theme;
  document.querySelectorAll(".theme-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.themeChoice === state.theme);
  });
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      return {
        learned: saved.learned || {},
        games: saved.games || {},
        quizScores: saved.quizScores || {},
        notes: saved.notes || {},
      };
    }
  } catch (error) {
    console.warn(error);
  }
  return { learned: {}, games: {}, quizScores: {}, notes: {} };
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function currentModule() {
  return MODULES.find((module) => module.id === state.moduleId) || MODULES[0];
}

function moduleCompletion(module) {
  let done = 0;
  if (progress.learned[module.id]) done += 1;
  if (progress.games[module.id]) done += 1;
  if ((progress.quizScores[module.id] || 0) >= 70) done += 1;
  return done;
}

function coursePercent() {
  const total = MODULES.length * 3;
  const done = MODULES.reduce((sum, module) => sum + moduleCompletion(module), 0);
  return Math.round((done / total) * 100);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function bookPagesFor(module) {
  return (window.BOOK_DATA?.pages || []).filter(
    (page) => page.page >= module.pages[0] && page.page <= module.pages[1],
  );
}

function compactText(text) {
  return String(text)
    .replaceAll("Â’s", "'s")
    .replaceAll("Â’", "'")
    .replaceAll("Â–", "-")
    .replace(/\b([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/([.,;:!?])([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function highlight(text, query) {
  const safe = escapeHTML(compactText(text));
  if (!query.trim()) return safe;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escaped})`, "ig"), "<mark>$1</mark>");
}

function render() {
  applyTheme();
  renderModuleList();
  renderProgress();
  renderHero();
  renderTabs();
  renderView();
}

function renderProgress() {
  const percent = coursePercent();
  els.courseProgressText.textContent = `${percent}%`;
  els.courseProgressBar.style.width = `${percent}%`;
  const hint = document.getElementById("progressHint");
  if (hint) {
    if (percent === 0) hint.textContent = "Start a module to begin";
    else if (percent < 30) hint.textContent = "Great start — keep going!";
    else if (percent < 60) hint.textContent = "Good progress — halfway there!";
    else if (percent < 90) hint.textContent = "Almost done — excellent work!";
    else hint.textContent = "Outstanding — course complete! 🎉";
  }
}

function renderModuleList() {
  els.moduleList.innerHTML = MODULES.map((module) => {
    const done = moduleCompletion(module) === 3;
    const active = module.id === state.moduleId;
    return `
      <button class="module-button ${active ? "active" : ""} ${done ? "done" : ""}" data-module="${module.id}">
        <span class="module-icon" style="background:${module.color}">${module.icon}</span>
        <span>
          <span class="module-title">${escapeHTML(module.title)}</span>
          <span class="module-pages">Pages ${module.pages[0]}-${module.pages[1]} - ${moduleCompletion(module)}/3</span>
        </span>
        <span class="module-check">OK</span>
      </button>
    `;
  }).join("");
}

function renderHero() {
  const module = currentModule();
  const learnDone = progress.learned[module.id];
  const gameDone  = progress.games[module.id];
  const quizScore = progress.quizScores[module.id] || 0;
  els.moduleHero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">MTP Digital &mdash; ${escapeHTML(module.strand)}</p>
      <h2>${escapeHTML(module.title)}</h2>
      <p>${escapeHTML(module.summary)}</p>
      <div class="hero-meta">
        <span class="pill" title="Click the Book tab to read">📖 Pages ${module.pages[0]}–${module.pages[1]}</span>
        <span class="pill ${learnDone ? "pill-done" : ""}" title="Click Learn tab">${learnDone ? "✅" : "📚"} Learn ${learnDone ? "done" : "open"}</span>
        <span class="pill ${gameDone  ? "pill-done" : ""}" title="Click Simulate tab">${gameDone  ? "✅" : "🎮"} Game ${gameDone  ? "done" : "open"}</span>
        <span class="pill ${quizScore >= 70 ? "pill-done" : ""}" title="Click Quiz tab">${quizScore >= 70 ? "✅" : "🏆"} Quiz ${quizScore}%</span>
      </div>
    </div>
    <div class="scene-card" aria-hidden="true">${sceneSvg(module)}</div>
  `;
}

function sceneSvg(module) {
  const c = module.color;
  // Sky gradient background used in all scenes
  const sky = `<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8eaf7"/><stop offset="100%" stop-color="#e8f8e0"/></linearGradient><linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9ecf7a"/><stop offset="100%" stop-color="#6fab4a"/></linearGradient></defs><rect width="520" height="290" fill="url(#skyG)"/><circle cx="440" cy="58" r="36" fill="#fce168" opacity="0.92"/><path d="M0 220 Q130 190 260 210 Q390 228 520 198 L520 290 L0 290Z" fill="url(#groundG)"/>`;
  // Module-specific foreground illustration
  const fg = {
    hay: `<g fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"><rect x="80" y="96" width="180" height="100" rx="8" fill="#d4a84b" stroke="${c}"/><path d="M100 118h140M92 138h156M100 158h140" stroke="#f5d06b"/><path d="M96 96 C148 52 212 52 264 96" fill="none" stroke="#b8842a"/></g><rect x="298" y="108" width="140" height="88" rx="6" fill="#c4983e" stroke="${c}" stroke-width="6"/>`,
    leftovers: `<rect x="60" y="92" width="120" height="80" rx="12" fill="#fff9f2" stroke="${c}" stroke-width="6"/><ellipse cx="120" cy="132" rx="44" ry="22" fill="#f3bc6a"/><rect x="220" y="80" width="160" height="56" rx="10" fill="#e8f2e0" stroke="#2f7d4f" stroke-width="5"/><ellipse cx="300" cy="108" rx="60" ry="18" fill="#9fce6a"/><rect x="220" y="154" width="160" height="34" rx="6" fill="#e8f2e0" stroke="#2f7d4f" stroke-width="4"/>`,
    integrated: `<circle cx="260" cy="138" r="70" fill="none" stroke="${c}" stroke-width="14" stroke-dasharray="8 5"/><circle cx="260" cy="72" r="28" fill="#fff" stroke="${c}" stroke-width="5"/><circle cx="320" cy="172" r="24" fill="#fff" stroke="#226b8f" stroke-width="5"/><circle cx="200" cy="172" r="24" fill="#fff" stroke="#a4522b" stroke-width="5"/><circle cx="260" cy="204" r="22" fill="#fff" stroke="#e0a52d" stroke-width="5"/>`,
    organic: `<g><rect x="50" y="130" width="80" height="50" rx="4" fill="#8a6241"/><rect x="150" y="110" width="80" height="70" rx="4" fill="#8a6241"/><rect x="260" y="120" width="80" height="60" rx="4" fill="#8a6241"/><rect x="370" y="135" width="80" height="45" rx="4" fill="#8a6241"/><path d="M90 130 Q90 80 130 64 Q170 48 170 110" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M190 110 Q190 60 230 48 Q270 36 270 120" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M300 120 Q300 70 340 58 Q380 46 380 135" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/></g>`,
    storage: `<path d="M100 84 L260 36 L420 84 V190 H100Z" fill="#e7d2a8" stroke="${c}" stroke-width="6"/><path d="M86 90 H434" stroke="${c}" stroke-width="10" stroke-linecap="round"/><rect x="150" y="118" width="220" height="72" fill="#f2e0b8" stroke="${c}" stroke-width="5"/><path d="M175 148 h170 M175 168 h170" stroke="${c}" stroke-width="4"/>`,
    flour: `<ellipse cx="260" cy="175" rx="140" ry="44" fill="#d1b78d"/><path d="M142 124 h236 l-28 72 H170Z" fill="#fff9ed" stroke="#b57922" stroke-width="6"/><path d="M172 142 C220 112 300 112 348 142" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round"/><text x="260" y="62" text-anchor="middle" font-size="26" font-weight="900" fill="#4a3010">Flour Mixture</text>`,
    waste: `<rect x="120" y="92" width="110" height="128" rx="12" fill="#e3eef0" stroke="#2c7378" stroke-width="6"/><path d="M108 92 H242" stroke="#2c7378" stroke-width="10" stroke-linecap="round"/><path d="M148 114 h64 M148 142 h64 M148 168 h64" stroke="#2c7378" stroke-width="5"/><circle cx="380" cy="138" r="48" fill="#e3f4e0" stroke="#2f7d4f" stroke-width="6"/><path d="M362 130 l10 16 l22 -28" fill="none" stroke="#2f7d4f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    disinfecting: `<ellipse cx="260" cy="155" rx="140" ry="60" fill="#fdf0f5" stroke="${c}" stroke-width="6"/><path d="M190 120 Q260 80 330 120 Q330 200 260 220 Q190 200 190 120Z" fill="#f5d8e4" stroke="${c}" stroke-width="6"/><circle cx="260" cy="155" r="28" fill="#fff" stroke="${c}" stroke-width="4"/><path d="M248 155 l8 10 l18 -18" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    grafting: `<path d="M260 200 V128" stroke="#6f4f2f" stroke-width="14" stroke-linecap="round"/><path d="M260 128 L220 88" stroke="#9b7756" stroke-width="12" stroke-linecap="round"/><path d="M260 128 L300 88" stroke="${c}" stroke-width="12" stroke-linecap="round"/><ellipse cx="210" cy="78" rx="34" ry="17" fill="#8fce65"/><ellipse cx="312" cy="76" rx="36" ry="18" fill="#6ab84a"/><rect x="230" y="125" width="60" height="18" rx="4" fill="#f1d284"/><circle cx="260" cy="45" r="22" fill="#dff7d0" stroke="${c}" stroke-width="5"/>`,
    sunDryer: `<circle cx="390" cy="54" r="34" fill="#fce168"/><path d="M90 168 L156 96 H340 L390 168Z" fill="#fff8d0" stroke="#d18a27" stroke-width="6"/><rect x="108" y="168" width="240" height="44" fill="#d6b17b" stroke="#d18a27" stroke-width="5"/><g fill="#5a9a3a"><ellipse cx="168" cy="182" rx="26" ry="10"/><ellipse cx="220" cy="190" rx="28" ry="10"/><ellipse cx="272" cy="182" rx="26" ry="10"/></g><text x="260" y="54" text-anchor="middle" font-size="18" font-weight="900" fill="#5c3a00">Sun Dryer</text>`,
  }[module.id] || `<g fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"><path d="M100 200 C160 155 200 125 260 108 C320 125 360 155 420 200"/><circle cx="260" cy="85" r="35" fill="rgba(255,255,255,0.6)" stroke="${c}"/></g>`;
  return `<svg viewBox="0 0 520 290" role="img" aria-hidden="true">${sky}${fg}</svg>`;
}

function renderTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
}

function renderView() {
  const module = currentModule();
  if (state.view !== "play" && window.MTPThreeSim?.disposeAll) window.MTPThreeSim.disposeAll();
  
  // Smooth animate out
  els.viewHost.style.transition = "opacity 0.15s ease, transform 0.15s ease";
  els.viewHost.style.opacity = "0";
  els.viewHost.style.transform = "translateY(15px) scale(0.98)";
  
  setTimeout(() => {
    if (state.view === "play")    renderPlay(module);
    if (state.view === "learn")   renderLearn(module);
    if (state.view === "quiz")    renderQuiz(module);
    if (state.view === "reader")  renderReader(module);
    if (state.view === "journal") renderJournal(module);
    
    // Force reflow
    void els.viewHost.offsetWidth;
    
    // Smooth animate in
    els.viewHost.style.transition = "opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
    els.viewHost.style.opacity = "1";
    els.viewHost.style.transform = "translateY(0) scale(1)";
  }, 150);
}

function renderLearn(module) {
  els.viewHost.innerHTML = `
    <div class="grid-2">
      <article class="lesson-card" style="animation-delay:0.04s">
        <p class="eyebrow">🎯 Skill targets</p>
        <h3>What to master</h3>
        <ul class="idea-list">
          ${module.goals.map((goal, i) => `<li><span>${i + 1}</span><p>${escapeHTML(goal)}</p></li>`).join("")}
        </ul>
      </article>
      <article class="lesson-card" style="animation-delay:0.10s">
        <p class="eyebrow">💡 Core ideas</p>
        <h3>Book focus</h3>
        <ul class="idea-list">
          ${module.ideas.map((idea, i) => `<li><span>${i + 1}</span><p>${escapeHTML(idea)}</p></li>`).join("")}
        </ul>
      </article>
    </div>
    <div class="grid-2" style="margin-top:${16}px">
      <article class="tool-card" style="animation-delay:0.16s">
        <p class="eyebrow">🏫 Activities</p>
        <h3>Classroom moves</h3>
        <p>Use these formats from the textbook to turn the topic into discussion, practical work, and reflection.</p>
        <div class="activity-strip">
          ${module.activities.map((a) => `<span class="activity-chip">${escapeHTML(a)}</span>`).join("")}
        </div>
      </article>
      <article class="tool-card" style="animation-delay:0.22s">
        <p class="eyebrow">✅ Checkpoint</p>
        <h3>${progress.learned[module.id] ? "Learning marked ✅" : "Mark after review"}</h3>
        <p>Read pages ${module.pages[0]}–${module.pages[1]}, complete the lesson cards, then mark this section before trying the simulation and quiz.</p>
        <button class="primary-button" id="markLearnedButton">${progress.learned[module.id] ? "🔄 Review again" : "✅ Mark learned"}</button>
      </article>
    </div>
  `;
}

function renderPlay(module) {
  if (window.MTPThreeSim?.disposeAll) window.MTPThreeSim.disposeAll();
  els.viewHost.innerHTML = `<div id="gameMount"></div>`;
  const mount = document.getElementById("gameMount");
  const games = {
    hayLab: renderHayLab,
    leftoverSort: renderLeftoverSort,
    farmLoop: renderFarmLoop,
    gardenPlanner: renderGardenPlanner,
    storageInspector: renderStorageInspector,
    flourMixer: renderFlourMixer,
    cleanupOrder: renderCleanupOrder,
    disinfectMatch: renderDisinfectMatch,
    graftingLab: renderGraftingLab,
    sunDryer: renderSunDryer,
  };
  games[module.game](mount, module);
}

function renderQuiz(module) {
  state.quizAnswers[module.id] = state.quizAnswers[module.id] || {};
  const answers = state.quizAnswers[module.id];
  const bestScore = progress.quizScores[module.id] || 0;
  const answered = Object.keys(answers).length;
  els.viewHost.innerHTML = `
    <div class="quiz-layout">
      <div class="question-card" style="animation-delay:0.04s">
        <p class="eyebrow">🏆 Practice quiz</p>
        <h3>${escapeHTML(module.title)}</h3>
        ${module.quiz.map((item, index) => `
          <div class="quiz-block" data-question="${index}" style="margin-bottom:20px">
            <p style="font-weight:800;margin-bottom:8px">${index + 1}. ${escapeHTML(item.q)}</p>
            <div class="quiz-options">
              ${item.o.map((option) => `
                <button class="choice-button ${answers[index] === option ? "selected" : ""}" data-answer="${escapeHTML(option)}" data-question="${index}">
                  ${escapeHTML(option)}
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
      <aside class="tool-card quiz-side" style="animation-delay:0.10s">
        <div>
          <p class="eyebrow">Best score</p>
          <div class="score-number" id="quizScoreDisplay">${bestScore}%</div>
          <div class="quiz-score-bar" style="margin-top:8px"><span style="width:${bestScore}%"></span></div>
        </div>
        <div style="padding:12px 14px;border-radius:10px;background:rgba(30,122,69,0.07);border:1px solid rgba(30,122,69,0.15)">
          <p style="margin:0;font-weight:800;font-size:0.88rem">Progress</p>
          <p style="margin:4px 0 0;font-size:0.82rem;color:var(--muted)">${answered} of ${module.quiz.length} answered</p>
          <p style="margin:6px 0 0;font-size:0.80rem;color:var(--muted)">Score ≥70% to earn the quiz badge.</p>
        </div>
        <button class="primary-button" id="submitQuizButton" style="margin-top:4px">Submit quiz</button>
        <button class="secondary-button" id="clearQuizButton">Clear answers</button>
      </aside>
    </div>
  `;
}

function renderReader(module) {
  const query = state.globalSearch.trim();
  const pages = query ? (window.BOOK_DATA?.pages || []) : bookPagesFor(module);
  const matches = query
    ? pages.filter((page) => compactText(page.text).toLowerCase().includes(query.toLowerCase()))
    : pages;
  const selected = matches[0] || null;
  els.viewHost.innerHTML = `
    <div class="reader-toolbar">
      <input id="readerSearch" type="search" placeholder="Search within ${escapeHTML(module.title)}" value="${escapeHTML(query)}">
      <select id="pageSelect">
        ${pages.map((page) => `<option value="${page.page}" ${selected && selected.page === page.page ? "selected" : ""}>Page ${page.page}</option>`).join("")}
      </select>
    </div>
    <div class="reader-results" id="readerResults"></div>
  `;
  renderReaderResults(module, matches, query);
}

function renderReaderResults(module, matches, query) {
  const host = document.getElementById("readerResults");
  if (!host) return;
  if (!matches.length) {
    host.innerHTML = `<div class="empty-state">No matching pages found.</div>`;
    return;
  }
  const list = query ? matches.slice(0, 12) : matches.slice(0, 3);
  host.innerHTML = list.map((page) => {
    const text = compactText(page.text);
    const display = query ? createSnippet(text, query) : text;
    return `
      <article class="reader-result">
        <h3><span>Page ${page.page}</span><span class="pill">${escapeHTML(moduleForPage(page.page)?.title || module.title)}</span></h3>
        <p class="page-text">${highlight(display, query)}</p>
      </article>
    `;
  }).join("");
}

function moduleForPage(pageNumber) {
  return MODULES.find((module) => pageNumber >= module.pages[0] && pageNumber <= module.pages[1]);
}

function createSnippet(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text.slice(0, 520);
  const start = Math.max(0, idx - 180);
  const end = Math.min(text.length, idx + 420);
  return `${start > 0 ? "... " : ""}${text.slice(start, end)}${end < text.length ? " ..." : ""}`;
}

function renderJournal(module) {
  const note = progress.notes[module.id] || "";
  const completed = MODULES.filter((item) => moduleCompletion(item) === 3).length;
  els.viewHost.innerHTML = `
    <div class="grid-2">
      <article class="journal-card">
        <p class="eyebrow">Portfolio prompt</p>
        <h3>${escapeHTML(module.title)}</h3>
        <p>${escapeHTML(module.journal)}</p>
        <textarea id="journalText" placeholder="Write your notes here">${escapeHTML(note)}</textarea>
        <div class="journal-actions">
          <button class="primary-button" id="saveJournalButton">Save note</button>
          <button class="secondary-button" id="exportProgressButton">Export progress</button>
        </div>
      </article>
      <article class="tool-card">
        <p class="eyebrow">Badges</p>
        <h3>Your offline record</h3>
        <div class="badge-row">
          <span class="badge">Learned ${Object.keys(progress.learned).length}/${MODULES.length}</span>
          <span class="badge">Games ${Object.keys(progress.games).length}/${MODULES.length}</span>
          <span class="badge">Quizzes ${Object.values(progress.quizScores).filter((score) => score >= 70).length}/${MODULES.length}</span>
          <span class="badge">Finished modules ${completed}/${MODULES.length}</span>
        </div>
      </article>
    </div>
  `;
}

function renderHayLab(mount, module) {
  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card control-stack">
        <p class="eyebrow">Hay quality lab</p>
        <h3>Prepare and store a bale</h3>
        <div class="field-row">
          <label for="hayMoisture">Moisture at storage: <span id="hayMoistureLabel">18%</span></label>
          <input id="hayMoisture" type="range" min="8" max="40" value="18">
        </div>
        <div class="field-row">
          <label for="hayDays">Drying days: <span id="hayDaysLabel">3</span></label>
          <input id="hayDays" type="range" min="0" max="8" value="3">
        </div>
        <div class="field-row">
          <label for="hayWeather">Weather during drying</label>
          <select id="hayWeather">
            <option value="hot">Hot and dry</option>
            <option value="cloudy">Cloudy</option>
            <option value="rain">Rainy</option>
          </select>
        </div>
        <div class="field-row">
          <label for="hayStorage">Storage</label>
          <select id="hayStorage">
            <option value="raised">Raised, roofed, aerated shed</option>
            <option value="floor">On a damp floor</option>
            <option value="open">Open to rain</option>
          </select>
        </div>
        <label class="toggle-chip"><input id="hayLegume" type="checkbox" checked> Include lucerne or desmodium</label>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Bale result</p>
        <div class="score-number" id="hayScore">0</div>
        <div class="mini-meter"><span id="hayMeter"></span></div>
        <div class="visual-panel">${haySvg(18)}</div>
        <ul class="feedback-list" id="hayFeedback"></ul>
        <button class="primary-button" id="saveHayButton">Save game result</button>
      </article>
    </div>
  `;
  const update = () => {
    const moisture = Number(document.getElementById("hayMoisture").value);
    const days = Number(document.getElementById("hayDays").value);
    const weather = document.getElementById("hayWeather").value;
    const storage = document.getElementById("hayStorage").value;
    const legume = document.getElementById("hayLegume").checked;
    let score = 100;
    const feedback = [];
    if (moisture < 15 || moisture > 20) {
      score -= moisture > 20 ? 30 : 14;
      feedback.push(moisture > 20 ? "Too much moisture can cause fermentation and mould." : "Very dry hay can lose leaves and nutrients.");
    } else {
      feedback.push("Moisture is in the recommended 15 to 20 percent range.");
    }
    if (days < 2 || days > 4) {
      score -= days < 2 ? 20 : 16;
      feedback.push(days < 2 ? "The forage needs more wilting time." : "Long drying can bleach hay and reduce nutrients.");
    }
    if (weather === "cloudy") score -= 12;
    if (weather === "rain") score -= 32;
    if (storage === "floor") score -= 24;
    if (storage === "open") score -= 36;
    if (legume) score += 5;
    score = clamp(score, 0, 100);
    document.getElementById("hayMoistureLabel").textContent = `${moisture}%`;
    document.getElementById("hayDaysLabel").textContent = days;
    document.getElementById("hayScore").textContent = score;
    document.getElementById("hayMeter").style.width = `${score}%`;
    document.querySelector(".visual-panel").innerHTML = haySvg(moisture);
    document.getElementById("hayFeedback").innerHTML = feedback.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    document.getElementById("saveHayButton").dataset.score = score;
  };
  mount.addEventListener("input", update);
  mount.addEventListener("change", update);
  update();
}

function haySvg(moisture) {
  const good = moisture >= 15 && moisture <= 20;
  const baleColor = moisture > 24 ? "#8a7240" : good ? "#d4a030" : "#bc9028";
  const stripeColor = good ? "#f5d870" : "#e8c050";
  const mould = moisture > 26 ? `<circle cx="172" cy="135" r="9" fill="rgba(60,100,50,0.55)"/><circle cx="222" cy="118" r="8" fill="rgba(60,100,50,0.55)"/><circle cx="282" cy="130" r="7" fill="rgba(60,100,50,0.55)"/>` : "";
  const qualityLabel = good ? "Good quality ✓" : moisture > 22 ? "Too moist – mould risk" : moisture < 13 ? "Over-dried – brittle" : "Acceptable";
  const qualityColor = good ? "#1e7a45" : "#ac3b58";
  return `
    <svg viewBox="0 0 420 240" role="img">
      <defs><linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0fce8"/><stop offset="100%" stop-color="#ddf4ce"/></linearGradient></defs>
      <rect width="420" height="240" fill="url(#bgG)"/>
      <!-- Ground -->
      <path d="M0 185 Q210 165 420 185 L420 240 L0 240Z" fill="#c8a86a"/>
      <!-- Shed posts -->
      <rect x="38" y="72" width="10" height="120" fill="#8a6e3a"/>
      <rect x="372" y="72" width="10" height="120" fill="#8a6e3a"/>
      <path d="M28 72 L210 28 L392 72" fill="none" stroke="#7a5e2a" stroke-width="8" stroke-linecap="round"/>
      <!-- Hay bale -->
      <rect x="84" y="82" width="252" height="92" rx="10" fill="${baleColor}"/>
      <g stroke="${stripeColor}" stroke-width="5" stroke-linecap="round">
        <line x1="104" y1="106" x2="316" y2="106"/>
        <line x1="96" y1="128" x2="324" y2="128"/>
        <line x1="110" y1="150" x2="306" y2="150"/>
        <line x1="148" y1="84" x2="148" y2="172"/>
        <line x1="210" y1="84" x2="210" y2="172"/>
        <line x1="272" y1="84" x2="272" y2="172"/>
      </g>
      ${mould}
      <path d="M84 82 c50 -44 220 -44 252 0" fill="none" stroke="#9a6818" stroke-width="8"/>
      <text x="210" y="218" text-anchor="middle" font-size="16" font-weight="900" fill="${qualityColor}">${qualityLabel}</text>
    </svg>
  `;
}

function renderLeftoverSort(mount, module) {
  const cards = [
    ["coldRice", "Rice, beef, and vegetables kept covered in a fridge overnight", "reuse"],
    ["partyFood", "Extra clean party food packed while still fresh", "share"],
    ["hotUgali", "Leftover ugali stored safely and still fresh", "reuse"],
    ["foulRice", "Rice with unusual smell and texture", "discard"],
    ["warmSoup", "Soup that must cool quickly in a covered container", "store"],
    ["chapati", "Leftover chapati for tea or stew", "reuse"],
  ];
  const targets = [
    ["store", "Store safely"],
    ["reuse", "Reheat or recook"],
    ["share", "Share while fresh"],
    ["discard", "Throw away"],
  ];
  const assignments = {};
  mount.innerHTML = `
    <div class="sort-layout">
      <article class="tool-card">
        <p class="eyebrow">Leftover safety sort</p>
        <h3>Choose the safest action</h3>
        <div class="card-grid" id="leftoverCards">
          ${cards.map(([id, label]) => `<button class="play-card" data-card="${id}"><strong>${escapeHTML(label)}</strong><span>Tap, then choose a zone.</span></button>`).join("")}
        </div>
      </article>
      <article class="tool-card">
        <p class="eyebrow">Action zones</p>
        <div class="card-grid" id="leftoverTargets">
          ${targets.map(([id, label]) => `<div class="target-zone" data-target="${id}"><h4>${escapeHTML(label)}</h4><div class="drop-items"></div></div>`).join("")}
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="primary-button" id="checkLeftovers">Check sort</button>
          <button class="secondary-button" id="resetLeftovers">Reset</button>
        </div>
        <ul class="feedback-list" id="leftoverFeedback" style="margin-top:12px"></ul>
      </article>
    </div>
  `;
  let selected = null;
  const draw = () => {
    document.querySelectorAll("[data-card]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.card === selected);
      button.hidden = Boolean(assignments[button.dataset.card]);
    });
    document.querySelectorAll("[data-target]").forEach((zone) => {
      const zoneId = zone.dataset.target;
      const assigned = Object.entries(assignments)
        .filter(([, target]) => target === zoneId)
        .map(([cardId]) => cards.find(([id]) => id === cardId)?.[1] || cardId);
      zone.querySelector(".drop-items").innerHTML = assigned.map((label) => `<span class="assigned">${escapeHTML(label.split(" ").slice(0, 3).join(" "))}</span>`).join("");
    });
  };
  mount.addEventListener("click", (event) => {
    const card = event.target.closest("[data-card]");
    const target = event.target.closest("[data-target]");
    if (card) {
      selected = card.dataset.card;
      draw();
    }
    if (target && selected) {
      assignments[selected] = target.dataset.target;
      selected = null;
      draw();
    }
    if (event.target.id === "resetLeftovers") {
      Object.keys(assignments).forEach((key) => delete assignments[key]);
      selected = null;
      document.getElementById("leftoverFeedback").innerHTML = "";
      draw();
    }
    if (event.target.id === "checkLeftovers") {
      const correct = cards.filter(([id, , answer]) => assignments[id] === answer).length;
      const score = Math.round((correct / cards.length) * 100);
      document.getElementById("leftoverFeedback").innerHTML = [
        `${correct} of ${cards.length} choices are safe.`,
        score >= 80 ? "Good food safety judgement." : "Check spoilage signs and storage rules before serving leftovers.",
      ].map((item) => `<li>${escapeHTML(item)}</li>`).join("");
      if (score >= 80) completeGame(module.id);
    }
  });
  draw();
}

function renderFarmLoop(mount, module) {
  const correct = ["Crop residues", "Animal feed", "Manure", "Compost", "Organic garden", "Household food"];
  let sequence = [];
  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card">
        <p class="eyebrow">Integrated farm loop</p>
        <h3>Build a resource cycle</h3>
        <div class="activity-strip">
          ${correct.concat(["Burn residues", "Leaking store"]).sort(() => 0.5 - Math.random()).map((item) => `<button class="secondary-button" data-loop-item="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join("")}
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="primary-button" id="checkFarmLoop">Check loop</button>
          <button class="secondary-button" id="clearFarmLoop">Clear</button>
        </div>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Your cycle</p>
        <ol class="sequence-list" id="farmSequence"></ol>
        <div class="visual-panel">${farmLoopSvg(0)}</div>
        <ul class="feedback-list" id="farmLoopFeedback"></ul>
      </article>
    </div>
  `;
  const draw = () => {
    document.getElementById("farmSequence").innerHTML = sequence.map((item, index) => `
      <li class="sequence-item"><span class="step-index">${index + 1}</span><span>${escapeHTML(item)}</span><button class="ghost-button" data-remove-loop="${index}">Remove</button></li>
    `).join("");
    document.querySelector(".visual-panel").innerHTML = farmLoopSvg(sequence.length);
  };
  mount.addEventListener("click", (event) => {
    const item = event.target.closest("[data-loop-item]");
    if (item && sequence.length < correct.length) {
      sequence.push(item.dataset.loopItem);
      draw();
    }
    const remove = event.target.closest("[data-remove-loop]");
    if (remove) {
      sequence.splice(Number(remove.dataset.removeLoop), 1);
      draw();
    }
    if (event.target.id === "clearFarmLoop") {
      sequence = [];
      document.getElementById("farmLoopFeedback").innerHTML = "";
      draw();
    }
    if (event.target.id === "checkFarmLoop") {
      const score = correct.filter((item, index) => sequence[index] === item).length;
      document.getElementById("farmLoopFeedback").innerHTML = `<li>${score} of ${correct.length} cycle links are in the strongest order.</li>`;
      if (score === correct.length) completeGame(module.id);
    }
  });
  draw();
}

function farmLoopSvg(count) {
  const active = (i) => count > i;
  const colors = ["#1e7a45","#7a5e28","#9c4d22","#226b8f","#a45020","#3a7a20"];
  const icons  = ["🌾","🌿","🐄","💩","♻️","🍽️"];
  const labels = ["Crop","Feed","Animals","Manure","Compost","Food"];
  return `
    <svg viewBox="0 0 420 260" role="img">
      <defs>
        <linearGradient id="bgFL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f0fce8"/><stop offset="100%" stop-color="#e0f6d4"/>
        </linearGradient>
      </defs>
      <rect width="420" height="260" fill="url(#bgFL)"/>
      <!-- Ring -->
      <circle cx="210" cy="130" r="88" fill="none" stroke="rgba(30,122,69,0.18)" stroke-width="20"/>
      <!-- Directional arrows on ring -->
      ${Array.from({length:6}, (_,i) => {
        const a0 = ((-90 + i*60 + 24) * Math.PI) / 180;
        const ax = 210 + Math.cos(a0)*88, ay = 130 + Math.sin(a0)*88;
        const a1 = ((-90 + i*60 + 38) * Math.PI) / 180;
        const bx = 210 + Math.cos(a1)*88, by = 130 + Math.sin(a1)*88;
        const op = active(i) ? "0.80" : "0.18";
        return `<path d="M${ax} ${ay} Q${(ax+bx)/2+3} ${(ay+by)/2+3} ${bx} ${by}" fill="none" stroke="rgba(30,122,69,${op})" stroke-width="4" marker-end="url(#arrow)"/>`;
      }).join("")}
      <!-- Nodes -->
      ${labels.map((label, i) => {
        const angle = (-90 + i * 60) * Math.PI / 180;
        const cx = 210 + Math.cos(angle) * 96;
        const cy = 130 + Math.sin(angle) * 96;
        const on = active(i);
        return `
          <g opacity="${on ? "1" : "0.28"}">
            <circle cx="${cx}" cy="${cy}" r="30" fill="${on ? colors[i] : "#ccc"}" stroke="white" stroke-width="3"/>
            <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="15">${icons[i]}</text>
            <text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="10" font-weight="800" fill="white">${label}</text>
          </g>
        `;
      }).join("")}
    </svg>
  `;
}

function renderGardenPlanner(mount, module) {
  const crops = {
    kale: { name: "Kale", short: "K", color: "#4d934d", days: 5 },
    spinach: { name: "Spinach", short: "S", color: "#2f7d4f", days: 4 },
    beans: { name: "Dry beans", short: "B", color: "#7c5d2a", days: 6 },
    dhania: { name: "Dhania", short: "D", color: "#65a85d", days: 3 },
  };
  const tools = [
    ["prepare", "Prepare bed"],
    ["plant", "Plant"],
    ["water", "Water"],
    ["compost", "Compost"],
    ["mulch", "Mulch"],
    ["weed", "Weed"],
    ["spray", "Natural spray"],
    ["harvest", "Harvest"],
  ];
  const garden = {
    day: 1,
    tool: "plant",
    crop: "kale",
    harvested: 0,
    message: "Select a tool, then tap a plot.",
    plots: Array.from({ length: 12 }, () => ({
      crop: null,
      stage: 0,
      water: 35,
      fertility: 35,
      pests: 0,
      weeds: 18,
      mulch: false,
    })),
  };
  let threeController = null;

  mount.innerHTML = `
    <div class="garden-sim">
      <article class="tool-card garden-tools">
        <p class="eyebrow">Planting simulation</p>
        <h3>Run an organic garden</h3>
        <div class="field-row">
          <label for="cropSelect">Crop to plant</label>
          <select id="cropSelect">
            ${Object.entries(crops).map(([id, crop]) => `<option value="${id}">${escapeHTML(crop.name)}</option>`).join("")}
          </select>
        </div>
        <div class="tool-rack">
          ${tools.map(([id, label]) => `<button class="secondary-button sim-tool ${id === garden.tool ? "active" : ""}" data-garden-tool="${id}">${escapeHTML(label)}</button>`).join("")}
        </div>
      </article>
      <article class="tool-card garden-field-card">
        <div class="sim-header">
          <div>
            <p class="eyebrow">School plot</p>
            <h3>Day <span id="gardenDay">1</span></h3>
          </div>
          <div class="sim-actions">
            <button class="primary-button" id="nextGardenDay">Next day</button>
            <button class="secondary-button" id="resetGardenSim">Reset</button>
          </div>
        </div>
        <div class="three-stage" id="gardenThreeStage"></div>
        <div class="garden-grid" id="gardenGrid"></div>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Garden record</p>
        <div class="meter-stack">
          <strong>Average water</strong><div class="mini-meter"><span id="gardenWaterMeter"></span></div>
          <strong>Average fertility</strong><div class="mini-meter"><span id="gardenFertilityMeter"></span></div>
          <strong>Pest safety</strong><div class="mini-meter"><span id="gardenPestMeter"></span></div>
        </div>
        <div class="harvest-count"><span id="gardenHarvested">0</span><small>harvests</small></div>
        <p id="gardenMessage">Select a tool, then tap a plot.</p>
        <button class="primary-button" id="saveGardenPlan">Save simulation</button>
      </article>
    </div>
  `;

  const reset = () => {
    garden.day = 1;
    garden.harvested = 0;
    garden.message = "Select a tool, then tap a plot.";
    garden.plots = Array.from({ length: 12 }, () => ({
      crop: null,
      stage: 0,
      water: 35,
      fertility: 35,
      pests: 0,
      weeds: 18,
      mulch: false,
    }));
    draw();
  };

  const average = (key, fallback = 0) => {
    const active = garden.plots.filter((plot) => plot.crop);
    if (!active.length) return fallback;
    return Math.round(active.reduce((sum, plot) => sum + plot[key], 0) / active.length);
  };

  const plotScore = (plot) => {
    if (!plot.crop) return 0;
    return clamp(plot.water * 0.25 + plot.fertility * 0.25 + (100 - plot.pests) * 0.25 + plot.stage * 8 - plot.weeds * 0.12, 0, 100);
  };

  const gardenScore = () => {
    const activeScore = garden.plots.reduce((sum, plot) => sum + plotScore(plot), 0) / garden.plots.length;
    return clamp(Math.round(activeScore + garden.harvested * 12), 0, 100);
  };

  const syncThree = () => {
    const host = document.getElementById("gardenThreeStage");
    if (!host) return;
    if (!window.MTPThreeSim) {
      host.innerHTML = `<div class="three-loading">Loading 3D garden...</div>`;
      window.addEventListener("mtp-three-ready", () => {
        threeController = null;
        draw();
      }, { once: true });
      return;
    }
    if (!threeController) {
      threeController = window.MTPThreeSim.mountGarden(host, garden, crops, (index) => {
        applyTool(garden.plots[index]);
        draw();
      });
    }
    threeController?.update(garden, crops);
  };

  const applyTool = (plot) => {
    const tool = garden.tool;
    if (tool === "prepare") {
      if (plot.crop) {
        garden.message = "Prepare empty beds before planting.";
        return;
      }
      plot.fertility = clamp(plot.fertility + 20, 0, 100);
      plot.weeds = 0;
      garden.message = "Bed prepared: old weeds removed and soil loosened.";
    }
    if (tool === "plant") {
      if (plot.crop) {
        garden.message = "This plot already has a crop.";
        return;
      }
      if (plot.fertility < 25) {
        garden.message = "Add compost or prepare the bed before planting.";
        return;
      }
      plot.crop = garden.crop;
      plot.stage = 1;
      plot.water = clamp(plot.water + 5, 0, 100);
      garden.message = `${crops[garden.crop].name} planted. Keep it watered and weed-free.`;
    }
    if (tool === "water") {
      plot.water = clamp(plot.water + 30, 0, 100);
      if (plot.water > 92) plot.pests = clamp(plot.pests + 8, 0, 100);
      garden.message = plot.water > 92 ? "Water added, but too much overhead watering can raise disease risk." : "Water added.";
    }
    if (tool === "compost") {
      plot.fertility = clamp(plot.fertility + 28, 0, 100);
      garden.message = "Organic manure or compost improved soil fertility.";
    }
    if (tool === "mulch") {
      plot.mulch = true;
      plot.water = clamp(plot.water + 12, 0, 100);
      plot.weeds = clamp(plot.weeds - 18, 0, 100);
      garden.message = "Mulch is conserving moisture and suppressing weeds.";
    }
    if (tool === "weed") {
      plot.weeds = 0;
      plot.pests = clamp(plot.pests - 8, 0, 100);
      garden.message = "Weeds removed. Field hygiene improves pest control.";
    }
    if (tool === "spray") {
      plot.pests = clamp(plot.pests - 35, 0, 100);
      garden.message = "Natural pesticide applied carefully.";
    }
    if (tool === "harvest") {
      if (!plot.crop || plot.stage < 4) {
        garden.message = "Harvest only mature crops.";
        return;
      }
      if (plot.pests > 65) {
        garden.message = "Control pests before harvesting this crop.";
        return;
      }
      garden.harvested += 1;
      Object.assign(plot, { crop: null, stage: 0, water: 35, fertility: 35, pests: 0, weeds: 12, mulch: false });
      garden.message = "Crop harvested hygienically at the right stage.";
    }
  };

  const nextDay = () => {
    garden.day += 1;
    garden.plots.forEach((plot) => {
      if (!plot.crop) {
        plot.weeds = clamp(plot.weeds + 4, 0, 100);
        return;
      }
      plot.water = clamp(plot.water - (plot.mulch ? 8 : 16), 0, 100);
      plot.fertility = clamp(plot.fertility - 5, 0, 100);
      plot.weeds = clamp(plot.weeds + (plot.mulch ? 4 : 11), 0, 100);
      if (plot.weeds > 45) plot.pests = clamp(plot.pests + 10, 0, 100);
      if (plot.water > 15 && plot.fertility > 18 && plot.pests < 70) {
        plot.stage = clamp(plot.stage + 1, 1, 4);
      }
      if (plot.water === 0 || plot.pests >= 96) {
        plot.stage = clamp(plot.stage - 1, 1, 4);
      }
    });
    garden.message = "A day passed. Check water, weeds, fertility, and pests.";
    draw();
  };

  const draw = () => {
    document.querySelectorAll(".sim-tool").forEach((button) => {
      button.classList.toggle("active", button.dataset.gardenTool === garden.tool);
    });
    document.getElementById("gardenDay").textContent = garden.day;
    document.getElementById("gardenHarvested").textContent = garden.harvested;
    document.getElementById("gardenMessage").textContent = garden.message;
    document.getElementById("gardenWaterMeter").style.width = `${average("water", 35)}%`;
    document.getElementById("gardenFertilityMeter").style.width = `${average("fertility", 35)}%`;
    document.getElementById("gardenPestMeter").style.width = `${100 - average("pests", 0)}%`;
    document.getElementById("saveGardenPlan").dataset.score = gardenScore();
    document.getElementById("gardenGrid").innerHTML = garden.plots.map((plot, index) => gardenPlotTemplate(plot, index, crops)).join("");
    syncThree();
  };

  mount.addEventListener("click", (event) => {
    const tool = event.target.closest("[data-garden-tool]");
    if (tool) {
      garden.tool = tool.dataset.gardenTool;
      draw();
      return;
    }
    const plotButton = event.target.closest("[data-plot]");
    if (plotButton) {
      applyTool(garden.plots[Number(plotButton.dataset.plot)]);
      draw();
      return;
    }
    if (event.target.id === "nextGardenDay") nextDay();
    if (event.target.id === "resetGardenSim") reset();
  });

  mount.addEventListener("change", (event) => {
    if (event.target.id === "cropSelect") {
      garden.crop = event.target.value;
    }
  });

  draw();
}

function gardenPlotTemplate(plot, index, crops) {
  const crop = plot.crop ? crops[plot.crop] : null;
  const plantHeight = crop ? 14 + plot.stage * 11 : 0;
  const status = crop ? `${crop.name} stage ${plot.stage}` : "Empty bed";
  const warnings = [
    plot.water < 20 ? "dry" : "",
    plot.weeds > 55 ? "weedy" : "",
    plot.pests > 55 ? "pests" : "",
    plot.stage >= 4 ? "ready" : "",
  ].filter(Boolean);
  return `
    <button class="garden-plot ${crop ? "planted" : ""} ${plot.mulch ? "mulched" : ""}" data-plot="${index}" aria-label="${escapeHTML(status)}">
      <span class="plot-soil"></span>
      ${crop ? `
        <span class="plot-plant" style="--plant:${crop.color};--plant-height:${plantHeight}px">
          <span>${escapeHTML(crop.short)}</span>
        </span>
      ` : `<span class="plot-empty">+</span>`}
      <span class="plot-bars">
        <i style="width:${plot.water}%"></i>
        <i style="width:${plot.fertility}%"></i>
        <i style="width:${100 - plot.pests}%"></i>
      </span>
      <span class="plot-status">${warnings.length ? escapeHTML(warnings.join(" / ")) : escapeHTML(status)}</span>
    </button>
  `;
}

function renderStorageInspector(mount, module) {
  const checks = [
    ["removeOld", "Remove previous crop remains", 14],
    ["sweep", "Sweep and remove dust", 14],
    ["dry", "Dry containers and bags", 18],
    ["seal", "Seal leaks and broken parts", 16],
    ["vent", "Open for fresh air circulation", 12],
    ["pests", "Dust or pest-proof safely", 14],
    ["vegetation", "Clear vegetation around store", 8],
  ];
  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card">
        <p class="eyebrow">Storage inspector</p>
        <h3>Prepare the facility</h3>
        <div class="field-row">
          <label for="storageFacility">Facility</label>
          <select id="storageFacility">
            <option>Granary</option>
            <option>Plastic drum or jar</option>
            <option>Storage room</option>
            <option>Storage bag</option>
          </select>
        </div>
        <div class="toggle-grid">
          ${checks.map(([id, label]) => `<label class="toggle-chip"><input type="checkbox" data-storage="${id}"> ${escapeHTML(label)}</label>`).join("")}
        </div>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Food safety</p>
        <div class="score-number" id="storageScore">0</div>
        <div class="mini-meter"><span id="storageMeter"></span></div>
        <div class="visual-panel" id="storageVisual"></div>
        <button class="primary-button" id="saveStoragePlan">Save inspection</button>
      </article>
    </div>
  `;
  const update = () => {
    const score = checks.reduce((sum, [id, , value]) => sum + (document.querySelector(`[data-storage="${id}"]`)?.checked ? value : 0), 0);
    document.getElementById("storageScore").textContent = `${score}%`;
    document.getElementById("storageMeter").style.width = `${score}%`;
    document.getElementById("storageVisual").innerHTML = storageSvg(score);
    document.getElementById("saveStoragePlan").dataset.score = score;
  };
  mount.addEventListener("change", update);
  update();
}

function storageSvg(score) {
  const dry = score >= 70;
  return `
    <svg viewBox="0 0 420 240" role="img">
      <rect width="420" height="240" fill="#f8faf5"></rect>
      <path d="M86 92 L210 42 L334 92 V202 H86 Z" fill="#e7d2a8" stroke="#7c5d2a" stroke-width="5"></path>
      <path d="M72 96 H348" stroke="#7c5d2a" stroke-width="8" stroke-linecap="round"></path>
      <rect x="128" y="128" width="164" height="74" fill="${dry ? "#f4e3bd" : "#bda47e"}" stroke="#7c5d2a" stroke-width="4"></rect>
      <path d="M150 154 h120 M150 174 h120" stroke="#7c5d2a" stroke-width="4"></path>
      ${dry ? '<text x="210" y="224" text-anchor="middle" font-size="16" font-weight="800" fill="#2f7d4f">Dry and safe</text>' : '<text x="210" y="224" text-anchor="middle" font-size="16" font-weight="800" fill="#b54863">Risk of spoilage</text>'}
    </svg>
  `;
}

function renderFlourMixer(mount, module) {
  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card control-stack">
        <p class="eyebrow">Flour mixture lab</p>
        <h3>Mix for the product</h3>
        <div class="field-row">
          <label for="flourAmount">Flour: <span id="flourAmountLabel">250 g</span></label>
          <input id="flourAmount" type="range" min="100" max="500" value="250" step="25">
        </div>
        <div class="field-row">
          <label for="waterAmount">Liquid: <span id="waterAmountLabel">150 ml</span></label>
          <input id="waterAmount" type="range" min="50" max="500" value="150" step="25">
        </div>
        <div class="field-row">
          <label for="flourProduct">Target product</label>
          <select id="flourProduct">
            <option value="chapati">Chapati</option>
            <option value="pancake">Pancake</option>
            <option value="mandazi">Mandazi</option>
            <option value="coating">Coating for fish or potatoes</option>
          </select>
        </div>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Mixture result</p>
        <h3 id="mixtureType">Dough</h3>
        <div class="visual-panel" id="flourVisual"></div>
        <ul class="feedback-list" id="flourFeedback"></ul>
        <button class="primary-button" id="saveFlourMix">Save mixture</button>
      </article>
    </div>
  `;
  const update = () => {
    const flour = Number(document.getElementById("flourAmount").value);
    const water = Number(document.getElementById("waterAmount").value);
    const product = document.getElementById("flourProduct").value;
    const ratio = water / flour;
    const type = ratio < 0.72 ? "Dough" : ratio < 1.35 ? "Thick batter" : "Thin batter";
    const expected = { chapati: "Dough", mandazi: "Dough", pancake: "Thin batter", coating: "Thick batter" }[product];
    const score = type === expected ? 100 : type.includes("batter") && expected.includes("batter") ? 70 : 35;
    document.getElementById("flourAmountLabel").textContent = `${flour} g`;
    document.getElementById("waterAmountLabel").textContent = `${water} ml`;
    document.getElementById("mixtureType").textContent = type;
    document.getElementById("flourVisual").innerHTML = flourSvg(type);
    document.getElementById("flourFeedback").innerHTML = [
      `${productLabel(product)} needs ${expected.toLowerCase()}.`,
      type === expected ? "The consistency matches the book process." : "Adjust the liquid-to-flour balance.",
    ].map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    document.getElementById("saveFlourMix").dataset.score = score;
  };
  mount.addEventListener("input", update);
  mount.addEventListener("change", update);
  update();
}

function productLabel(value) {
  return { chapati: "Chapati", mandazi: "Mandazi", pancake: "Pancake", coating: "A coating batter" }[value] || value;
}

function flourSvg(type) {
  const thin = type === "Thin batter";
  const thick = type === "Thick batter";
  return `
    <svg viewBox="0 0 420 240" role="img">
      <rect width="420" height="240" fill="#f8faf5"></rect>
      <ellipse cx="210" cy="170" rx="118" ry="38" fill="#d1b78d"></ellipse>
      <path d="M116 116 h188 l-22 68 H138 Z" fill="#fff7e5" stroke="#b57922" stroke-width="5"></path>
      <path d="M146 134 C184 ${thin ? 164 : 120} 236 ${thin ? 166 : 118} 274 134" fill="none" stroke="${thin ? "#e7c471" : thick ? "#dba64b" : "#b67d31"}" stroke-width="${thin ? 6 : thick ? 12 : 20}" stroke-linecap="round"></path>
      <text x="210" y="54" text-anchor="middle" font-size="22" font-weight="900" fill="#17201b">${type}</text>
    </svg>
  `;
}

function renderCleanupOrder(mount, module) {
  const procedures = {
    bin: ["Wear gloves", "Empty the bin", "Wash with warm soapy water", "Rinse with clean water", "Disinfect", "Dry and line the bin"],
    sink: ["Wear gloves", "Rinse loose dirt", "Sprinkle baking soda", "Scrub basin, tap, and drain", "Rinse with warm then cold water", "Dry with a clean cloth"],
    drain: ["Wear gloves", "Remove litter and leaves", "Pour warm soapy water", "Scrub with stiff brush", "Rinse with clean water", "Flush with hot then cold water"],
  };
  let facility = "bin";
  let order = shuffle([...procedures[facility]]);
  const draw = () => {
    mount.innerHTML = cleanupTemplate(facility, order);
  };
  mount.addEventListener("click", (event) => {
    const move = event.target.closest("[data-move]");
    if (move) {
      const index = Number(move.dataset.index);
      const dir = move.dataset.move === "up" ? -1 : 1;
      const next = index + dir;
      if (next >= 0 && next < order.length) {
        [order[index], order[next]] = [order[next], order[index]];
        draw();
      }
    }
    if (event.target.id === "checkCleanup") {
      const score = procedures[facility].filter((step, index) => order[index] === step).length;
      document.getElementById("cleanupFeedback").innerHTML = `<li>${score} of ${order.length} steps are in the correct place.</li>`;
      if (score === order.length) completeGame(module.id);
    }
  });
  mount.addEventListener("change", (event) => {
    if (event.target.id === "facilitySelect") {
      facility = event.target.value;
      order = shuffle([...procedures[facility]]);
      draw();
    }
  });
  draw();
}

function cleanupTemplate(facility, order) {
  return `
    <div class="game-board">
      <article class="tool-card">
        <p class="eyebrow">Cleanup sequence</p>
        <h3>Put the steps in order</h3>
        <div class="field-row">
          <label for="facilitySelect">Facility</label>
          <select id="facilitySelect">
            <option value="bin" ${facility === "bin" ? "selected" : ""}>Waste bin</option>
            <option value="sink" ${facility === "sink" ? "selected" : ""}>Kitchen sink</option>
            <option value="drain" ${facility === "drain" ? "selected" : ""}>Open drain</option>
          </select>
        </div>
        <ol class="sequence-list">
          ${order.map((step, index) => `
            <li class="sequence-item">
              <span class="step-index">${index + 1}</span>
              <span>${escapeHTML(step)}</span>
              <span class="step-tools">
                <button data-move="up" data-index="${index}" title="Move up">Up</button>
                <button data-move="down" data-index="${index}" title="Move down">Dn</button>
              </span>
            </li>
          `).join("")}
        </ol>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Hygiene check</p>
        <div class="visual-panel">${cleanupSvg(facility)}</div>
        <button class="primary-button" id="checkCleanup">Check order</button>
        <ul class="feedback-list" id="cleanupFeedback"></ul>
      </article>
    </div>
  `;
}

function cleanupSvg(facility) {
  const label = { bin: "Bin", sink: "Sink", drain: "Drain" }[facility];
  return `
    <svg viewBox="0 0 420 240" role="img">
      <rect width="420" height="240" fill="#f8faf5"></rect>
      <rect x="110" y="88" width="200" height="96" rx="8" fill="#e3eef0" stroke="#2c7378" stroke-width="5"></rect>
      <path d="M140 118 h140 M140 146 h140" stroke="#2c7378" stroke-width="5" stroke-linecap="round"></path>
      <circle cx="306" cy="72" r="22" fill="#f4cf5d"></circle>
      <text x="210" y="212" text-anchor="middle" font-size="20" font-weight="900" fill="#17201b">${label}</text>
    </svg>
  `;
}

function renderDisinfectMatch(mount, module) {
  const scenarios = [
    ["whiteTowel", "White cotton towel after infectious skin disease", "Boiling"],
    ["delicateSocks", "Socks that may be damaged by boiling", "Disinfectant"],
    ["apron", "Clean apron drying outdoors on a sunny day", "Sunlight"],
    ["shirt", "Dry shirt needing heat after washing", "Ironing"],
    ["laundry", "Laundry soaked with common kitchen ingredient", "Salting"],
  ];
  const methods = ["Boiling", "Disinfectant", "Sunlight", "Ironing", "Salting"];
  const picks = {};
  mount.innerHTML = `
    <div class="match-layout">
      <article class="tool-card">
        <p class="eyebrow">Disinfection match</p>
        <h3>Choose the method</h3>
        <div class="card-grid">
          ${scenarios.map(([id, label]) => `
            <div class="play-card">
              <strong>${escapeHTML(label)}</strong>
              <select data-disinfect="${id}">
                <option value="">Choose method</option>
                ${methods.map((method) => `<option>${method}</option>`).join("")}
              </select>
            </div>
          `).join("")}
        </div>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Health protection</p>
        <div class="visual-panel">${disinfectSvg(0)}</div>
        <button class="primary-button" id="checkDisinfect">Check matches</button>
        <ul class="feedback-list" id="disinfectFeedback"></ul>
      </article>
    </div>
  `;
  mount.addEventListener("change", (event) => {
    if (event.target.dataset.disinfect) picks[event.target.dataset.disinfect] = event.target.value;
  });
  mount.addEventListener("click", (event) => {
    if (event.target.id === "checkDisinfect") {
      const correct = scenarios.filter(([id, , answer]) => picks[id] === answer).length;
      document.querySelector(".visual-panel").innerHTML = disinfectSvg(correct);
      document.getElementById("disinfectFeedback").innerHTML = `<li>${correct} of ${scenarios.length} methods match the safest situations.</li>`;
      if (correct >= 4) completeGame(module.id);
    }
  });
}

function disinfectSvg(count) {
  return `
    <svg viewBox="0 0 420 240" role="img">
      <rect width="420" height="240" fill="#f8faf5"></rect>
      <path d="M80 92 h260 v78 H80 Z" fill="#fff" stroke="#b54863" stroke-width="5"></path>
      <path d="M96 108 h228 M96 132 h228 M96 156 h228" stroke="#f0bfd0" stroke-width="8"></path>
      ${Array.from({ length: count }).map((_, index) => `<circle cx="${132 + index * 42}" cy="72" r="14" fill="#b54863"></circle>`).join("")}
      <text x="210" y="210" text-anchor="middle" font-size="18" font-weight="900" fill="#17201b">Matched ${count}/5</text>
    </svg>
  `;
}

function renderGraftingLab(mount, module) {
  const correct = ["Select scion", "Select rootstock", "Make matching V-cuts", "Insert scion", "Tie and seal union", "Protect and water"];
  let steps = [];
  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card">
        <p class="eyebrow">Grafting lab</p>
        <h3>Build the graft</h3>
        <div class="activity-strip">
          ${shuffle([...correct]).map((step) => `<button class="secondary-button" data-graft-step="${escapeHTML(step)}">${escapeHTML(step)}</button>`).join("")}
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="primary-button" id="checkGraft">Check graft</button>
          <button class="secondary-button" id="clearGraft">Clear</button>
        </div>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Seedling progress</p>
        <ol class="sequence-list" id="graftSequence"></ol>
        <div class="visual-panel" id="graftVisual"></div>
        <ul class="feedback-list" id="graftFeedback"></ul>
      </article>
    </div>
  `;
  const draw = () => {
    document.getElementById("graftSequence").innerHTML = steps.map((step, index) => `<li class="sequence-item"><span class="step-index">${index + 1}</span><span>${escapeHTML(step)}</span><button class="ghost-button" data-remove-graft="${index}">Remove</button></li>`).join("");
    document.getElementById("graftVisual").innerHTML = graftSvg(steps.length);
  };
  mount.addEventListener("click", (event) => {
    const step = event.target.closest("[data-graft-step]");
    if (step && steps.length < correct.length) {
      steps.push(step.dataset.graftStep);
      draw();
    }
    const remove = event.target.closest("[data-remove-graft]");
    if (remove) {
      steps.splice(Number(remove.dataset.removeGraft), 1);
      draw();
    }
    if (event.target.id === "clearGraft") {
      steps = [];
      document.getElementById("graftFeedback").innerHTML = "";
      draw();
    }
    if (event.target.id === "checkGraft") {
      const score = correct.filter((step, index) => steps[index] === step).length;
      document.getElementById("graftFeedback").innerHTML = `<li>${score} of ${correct.length} grafting steps are in order.</li>`;
      if (score === correct.length) completeGame(module.id);
    }
  });
  draw();
}

function graftSvg(count) {
  return `
    <svg viewBox="0 0 420 240" role="img">
      <rect width="420" height="240" fill="#f8faf5"></rect>
      <path d="M210 204 V120" stroke="#6f4f2f" stroke-width="14" stroke-linecap="round"></path>
      <path d="M210 120 L178 82" stroke="${count > 3 ? "#2f7d4f" : "#9b7756"}" stroke-width="12" stroke-linecap="round"></path>
      <path d="M210 120 L246 82" stroke="${count > 3 ? "#2f7d4f" : "#9b7756"}" stroke-width="12" stroke-linecap="round"></path>
      <ellipse cx="170" cy="74" rx="28" ry="14" fill="${count > 5 ? "#5aa463" : "#ccd6c3"}"></ellipse>
      <ellipse cx="252" cy="72" rx="30" ry="15" fill="${count > 5 ? "#4c9a55" : "#ccd6c3"}"></ellipse>
      <rect x="178" y="118" width="64" height="20" rx="4" fill="${count > 4 ? "#f1d284" : "#d6c1a6"}"></rect>
      <text x="210" y="34" text-anchor="middle" font-size="18" font-weight="900" fill="#17201b">Step ${Math.min(count, 6)}/6</text>
    </svg>
  `;
}

function renderSunDryer(mount, module) {
  const checks = [
    ["frame", "Strong frame"],
    ["tray", "Wire mesh tray"],
    ["cover", "Transparent cover"],
    ["clean", "Clean dryer and vegetables"],
    ["single", "Single layer of leaves"],
    ["closed", "Door closed while drying"],
  ];
  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card control-stack">
        <p class="eyebrow">Sun dryer builder</p>
        <h3>Test the dryer</h3>
        <div class="toggle-grid">
          ${checks.map(([id, label]) => `<label class="toggle-chip"><input type="checkbox" data-dryer="${id}"> ${escapeHTML(label)}</label>`).join("")}
        </div>
        <div class="field-row">
          <label for="sunHours">Sun exposure hours: <span id="sunHoursLabel">5</span></label>
          <input id="sunHours" type="range" min="0" max="10" value="5">
        </div>
        <div class="field-row">
          <label for="turns">Turning checks: <span id="turnsLabel">2</span></label>
          <input id="turns" type="range" min="0" max="5" value="2">
        </div>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Drying result</p>
        <div class="score-number" id="dryerScore">0%</div>
        <div class="mini-meter"><span id="dryerMeter"></span></div>
        <div class="visual-panel" id="dryerVisual"></div>
        <ul class="feedback-list" id="dryerFeedback"></ul>
        <button class="primary-button" id="saveDryer">Save dryer</button>
      </article>
    </div>
  `;
  const update = () => {
    let score = 0;
    checks.forEach(([id]) => {
      if (document.querySelector(`[data-dryer="${id}"]`)?.checked) score += 12;
    });
    const hours = Number(document.getElementById("sunHours").value);
    const turns = Number(document.getElementById("turns").value);
    score += clamp(hours * 3, 0, 24);
    score += clamp(turns * 2, 0, 10);
    score = clamp(score, 0, 100);
    const temp = 24 + (document.querySelector('[data-dryer="cover"]')?.checked ? 9 : 0) + Math.round(hours * 1.8);
    const moisture = clamp(100 - score, 4, 100);
    document.getElementById("sunHoursLabel").textContent = hours;
    document.getElementById("turnsLabel").textContent = turns;
    document.getElementById("dryerScore").textContent = `${score}%`;
    document.getElementById("dryerMeter").style.width = `${score}%`;
    document.getElementById("dryerVisual").innerHTML = dryerSvg(score, temp);
    document.getElementById("dryerFeedback").innerHTML = [
      `Estimated inside temperature: ${temp} C.`,
      `Estimated moisture remaining: ${moisture}%.`,
      score >= 80 ? "The dryer is ready for safe vegetable preservation." : "Add structure, sunlight, hygiene, and turning checks.",
    ].map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    document.getElementById("saveDryer").dataset.score = score;
  };
  mount.addEventListener("input", update);
  mount.addEventListener("change", update);
  update();
}

function dryerSvg(score, temp) {
  const coverColor = score > 55 ? "rgba(255,248,200,0.88)" : "rgba(224,218,202,0.80)";
  const vegColor   = score > 75 ? "#3a8830" : "#5fa048";
  const rayCount = Math.max(2, Math.round(score / 14));
  const rays = Array.from({length: rayCount}, (_, i) => {
    const angle = -60 + i * (120 / Math.max(rayCount - 1, 1));
    const rad = angle * Math.PI / 180;
    const x2 = 368 + Math.cos(rad) * 36;
    const y2 = 48  + Math.sin(rad) * 36;
    return `<line x1="368" y1="48" x2="${x2}" y2="${y2}" stroke="#f6c351" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`;
  }).join("");
  return `
    <svg viewBox="0 0 420 240" role="img">
      <defs><linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d0eefa"/><stop offset="100%" stop-color="#f0fae8"/></linearGradient></defs>
      <rect width="420" height="240" fill="url(#skyD)"/>
      <circle cx="368" cy="48" r="26" fill="#fce168"/>
      ${rays}
      <!-- Dryer frame -->
      <path d="M78 170 L136 96 H306 L358 170Z" fill="${coverColor}" stroke="#c98020" stroke-width="6"/>
      <!-- Legs -->
      <line x1="100" y1="170" x2="84" y2="215" stroke="#9a6830" stroke-width="6" stroke-linecap="round"/>
      <line x1="320" y1="170" x2="336" y2="215" stroke="#9a6830" stroke-width="6" stroke-linecap="round"/>
      <rect x="94" y="170" width="248" height="42" fill="#d6a870" stroke="#c08020" stroke-width="5"/>
      <!-- Tray lines -->
      <line x1="118" y1="183" x2="324" y2="183" stroke="#8a5810" stroke-width="3" opacity="0.5"/>
      <line x1="118" y1="197" x2="324" y2="197" stroke="#8a5810" stroke-width="3" opacity="0.5"/>
      <!-- Vegetables -->
      <g fill="${vegColor}">
        <ellipse cx="152" cy="183" rx="24" ry="9"/>
        <ellipse cx="200" cy="191" rx="26" ry="9"/>
        <ellipse cx="250" cy="183" rx="24" ry="9"/>
        <ellipse cx="298" cy="190" rx="22" ry="8"/>
      </g>
      <text x="218" y="52" text-anchor="middle" font-size="16" font-weight="900" fill="#4a2c00">${temp}°C inside</text>
      <text x="218" y="230" text-anchor="middle" font-size="14" font-weight="800" fill="${score >= 80 ? "#1e7a45" : "#a04020"}">${score >= 80 ? "Ready for safe drying ✓" : "Improve setup for best results"}</text>
    </svg>
  `;
}

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function completeGame(moduleId) {
  if (!progress.games[moduleId]) {
    progress.games[moduleId] = true;
    saveProgress();
    showToast("🎉 Game completed! Progress saved.", "success");
    triggerCelebration(document.getElementById("gameMount"));
  } else {
    progress.games[moduleId] = true;
    saveProgress();
    showToast("✅ Score saved.", "info");
  }
  renderModuleList();
  renderProgress();
  renderHero();
}

// Global ripple effect on buttons
document.addEventListener("click", (event) => {
  const btn = event.target.closest("button:not([disabled])");
  if (btn) addRipple(event);
}, true);

document.addEventListener("click", (event) => {
  const themeButton = event.target.closest("[data-theme-choice]");
  if (themeButton) {
    state.theme = themeButton.dataset.themeChoice;
    localStorage.setItem(THEME_KEY, state.theme);
    applyTheme();
    return;
  }

  const moduleButton = event.target.closest("[data-module]");
  if (moduleButton) {
    state.moduleId = moduleButton.dataset.module;
    state.globalSearch = "";
    els.globalSearch.value = "";
    render();
    return;
  }
  const tab = event.target.closest("[data-view]");
  if (tab) {
    state.view = tab.dataset.view;
    render();
    return;
  }
  if (event.target.id === "markLearnedButton") {
    progress.learned[state.moduleId] = true;
    saveProgress();
    showToast("📚 Module marked as learned!", "success");
    render();
  }
  if (event.target.id === "submitQuizButton") {
    const module = currentModule();
    const answers = state.quizAnswers[module.id] || {};
    const correct = module.quiz.filter((item, index) => answers[index] === item.a).length;
    const score = Math.round((correct / module.quiz.length) * 100);
    const oldBest = progress.quizScores[module.id] || 0;
    progress.quizScores[module.id] = Math.max(oldBest, score);
    saveProgress();
    document.querySelectorAll(".quiz-block").forEach((block) => {
      const index = Number(block.dataset.question);
      block.querySelectorAll(".choice-button").forEach((button) => {
        button.classList.toggle("correct", button.dataset.answer === module.quiz[index].a);
        button.classList.toggle("wrong", button.classList.contains("selected") && button.dataset.answer !== module.quiz[index].a);
      });
    });
    // Animate the score display
    const scoreEl = document.getElementById("quizScoreDisplay");
    const scoreBar = document.querySelector(".quiz-score-bar span");
    if (scoreEl) animateValue(scoreEl, progress.quizScores[module.id], 700, "%");
    if (scoreBar) { scoreBar.style.transition = "width 0.7s cubic-bezier(0.34,1.56,0.64,1)"; scoreBar.style.width = `${progress.quizScores[module.id]}%`; }
    if (score >= 70) showToast(`🏆 ${score}% — Quiz badge earned!`, "success");
    else if (score >= 40) showToast(`📝 ${score}% — Keep practising!`, "info");
    else showToast(`🔄 ${score}% — Review the notes and try again.`, "warn");
    renderModuleList();
    renderProgress();
    renderHero();
  }
  if (event.target.id === "clearQuizButton") {
    state.quizAnswers[state.moduleId] = {};
    renderQuiz(currentModule());
  }
  if (event.target.id === "saveJournalButton") {
    progress.notes[state.moduleId] = document.getElementById("journalText").value;
    saveProgress();
    showToast("💾 Journal note saved.", "info");
    render();
  }
  if (event.target.id === "exportProgressButton") {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agriculture-nutrition-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  if (event.target.id === "saveHayButton" && Number(event.target.dataset.score) >= 75) completeGame(state.moduleId);
  if (event.target.id === "saveGardenPlan" && Number(event.target.dataset.score) >= 75) completeGame(state.moduleId);
  if (event.target.id === "saveStoragePlan" && Number(event.target.dataset.score) >= 80) completeGame(state.moduleId);
  if (event.target.id === "saveFlourMix" && Number(event.target.dataset.score) >= 80) completeGame(state.moduleId);
  if (event.target.id === "saveDryer" && Number(event.target.dataset.score) >= 80) completeGame(state.moduleId);
});

document.addEventListener("click", (event) => {
  const answer = event.target.closest(".choice-button[data-question]");
  if (!answer) return;
  const module = currentModule();
  state.quizAnswers[module.id] = state.quizAnswers[module.id] || {};
  state.quizAnswers[module.id][answer.dataset.question] = answer.dataset.answer;
  renderQuiz(module);
});

els.globalSearch.addEventListener("input", (event) => {
  state.globalSearch = event.target.value;
  state.view = "reader";
  renderTabs();
  renderReader(currentModule());
});

document.addEventListener("input", (event) => {
  if (event.target.id === "readerSearch") {
    state.globalSearch = event.target.value;
    els.globalSearch.value = event.target.value;
    renderReader(currentModule());
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "pageSelect" && !state.globalSearch.trim()) {
    const pageNumber = Number(event.target.value);
    const page = (window.BOOK_DATA?.pages || []).find((item) => item.page === pageNumber);
    if (page) {
      document.getElementById("readerResults").innerHTML = `
        <article class="reader-result">
          <h3><span>Page ${page.page}</span><span class="pill">${escapeHTML(moduleForPage(page.page)?.title || currentModule().title)}</span></h3>
          <p class="page-text">${escapeHTML(compactText(page.text))}</p>
        </article>
      `;
    }
  }
});

els.openPdfButton.addEventListener("click", () => {
  window.open("assets/book.pdf", "_blank");
});

els.resetProgressButton.addEventListener("click", () => {
  if (!confirm("Reset all saved progress and notes?")) return;
  progress = { learned: {}, games: {}, quizScores: {}, notes: {} };
  state.quizAnswers = {};
  saveProgress();
  render();
});

render();
