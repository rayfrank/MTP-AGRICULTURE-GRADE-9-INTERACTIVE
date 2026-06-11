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

/* ── Effects System ──────────────────────────────────────────── */

function spawnFloatingScore(screenX, screenY, text, color = "#ffd700") {
  const el = document.createElement("div");
  el.className = "float-score-el";
  el.textContent = text;
  el.style.left = `${screenX}px`;
  el.style.top  = `${screenY}px`;
  el.style.color = color;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

function shakeElement(el) {
  if (!el) return;
  el.classList.remove("screen-shake");
  void el.offsetWidth;
  el.classList.add("screen-shake");
  el.addEventListener("animationend", () => el.classList.remove("screen-shake"), { once: true });
}

function popScoreEl(el) {
  if (!el) return;
  el.classList.remove("score-pop");
  void el.offsetWidth;
  el.classList.add("score-pop");
}

function confettiBurst(originX, originY, count = 28) {
  const colors = ["#ffd700","#ff6b6b","#4ecdc4","#45b7d1","#96e6a1","#f8b500","#ff9ff3","#54a0ff","#5f27cd"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 8;
    el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;left:${originX}px;top:${originY}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};`;
    document.body.appendChild(el);
    const vx = (Math.random() - 0.5) * 320;
    const vy = -(160 + Math.random() * 200);
    const t0 = performance.now();
    const frame = (now) => {
      const t = (now - t0) / 1000;
      const opacity = Math.max(0, 1 - t * 1.3);
      el.style.transform = `translate(${vx * t}px,${vy * t + 280 * t * t}px) rotate(${t * 400}deg)`;
      el.style.opacity = opacity;
      if (opacity > 0) requestAnimationFrame(frame);
      else el.remove();
    };
    requestAnimationFrame(frame);
  }
}

/* ── End Effects System ──────────────────────────────────────── */

/* ── In-game tutorial hint ───────────────────────────────────── */
function showGameHint(stage, msg, ms = 5500) {
  if (!stage) return;
  const existing = stage.querySelector(".game-tutorial-hint");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "game-tutorial-hint";
  el.textContent = msg;
  stage.appendChild(el);
  setTimeout(() => { el.classList.add("gone"); setTimeout(() => el.remove(), 550); }, ms);
}

/* ── Visual step-by-step tutorial ───────────────────────────── */
function showVisualTutorial(stage, steps, onDone) {
  let idx = 0;
  const wrap = document.createElement("div");
  wrap.className = "vis-tutorial-overlay";
  stage.appendChild(wrap);

  function render() {
    const s = steps[idx];
    const dots = steps.map((_, i) =>
      `<span class="vt-dot${i === idx ? ' on' : i < idx ? ' past' : ''}"></span>`
    ).join('');
    wrap.innerHTML = `
      <div class="vt-card">
        <div class="vt-dots">${dots}</div>
        <div class="vt-art">${s.art}</div>
        <div class="vt-title">${s.title}</div>
        <p class="vt-desc">${s.desc}</p>
        <div style="display:flex;gap:8px;justify-content:center;align-items:center">
          ${idx > 0 ? '<button class="secondary-button vt-back" style="min-width:70px;padding:8px 12px">← Back</button>' : ''}
          <button class="primary-button vt-next" style="min-width:130px">
            ${idx < steps.length - 1 ? 'Next →' : '🎮 Play!'}
          </button>
        </div>
      </div>
    `;
    wrap.querySelector(".vt-next").onclick = () => {
      if (idx < steps.length - 1) { idx++; render(); }
      else { wrap.classList.add("vt-out"); setTimeout(() => wrap.remove(), 300); onDone(); }
    };
    const back = wrap.querySelector(".vt-back");
    if (back) back.onclick = () => { idx--; render(); };
  }
  render();
}

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
    prompts: [
      "What forage crops are available near your home or school?",
      "How would you test if hay is dry enough for safe storage?",
      "What problems might arise if hay is stored while still wet?",
    ],
    glossary: [
      { term: "Forage", def: "Plant material (leaves, stems, grass) that animals eat, either grazed or harvested." },
      { term: "Hay", def: "Cut and dried forage stored for use as animal feed during dry seasons." },
      { term: "Pasture", def: "Land covered with grass or other plants suitable for grazing animals." },
      { term: "Fodder crop", def: "A crop grown specifically to feed livestock, such as maize, sorghum, or lucerne." },
      { term: "Baling", def: "Compressing dried forage into compact rectangular or round blocks for storage." },
      { term: "Wilting", def: "The initial drying stage where freshly cut forage loses excess moisture before baling." },
      { term: "Stover", def: "Dried stalks and leaves of a crop (e.g., maize) left after grain is harvested." },
    ],
    links: [
      { label: "Kenya Forage Handbook", url: "https://www.kari.org/forages" },
      { label: "FAO Hay Making Guide", url: "https://www.fao.org/agriculture/crops/hay" },
    ],
    video: null,
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
    prompts: [
      "What leftover foods are most common in your household each week?",
      "How do you know when food has gone bad and should be thrown away?",
      "What money or resources could your family save by reducing food waste?",
    ],
    glossary: [
      { term: "Leftover food", def: "Food prepared but not eaten at a meal, which can be stored for later use." },
      { term: "Contamination", def: "The introduction of harmful microbes or substances into food making it unsafe to eat." },
      { term: "Refrigeration", def: "Cooling food to slow down the growth of bacteria and extend its safe life." },
      { term: "Reheating", def: "Heating leftover food to a safe temperature to kill any bacteria that may have grown." },
      { term: "Food wastage", def: "Food that is thrown away unnecessarily, wasting money, energy, and resources." },
      { term: "Spoilage", def: "The process by which food becomes unfit to eat due to bacteria, mould, or yeast." },
    ],
    links: [
      { label: "KEBS Food Safety Standards", url: "https://www.kebs.org/food-safety" },
      { label: "WHO Food Safety Tips", url: "https://www.who.int/news-room/fact-sheets/detail/food-safety" },
    ],
    video: null,
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
    game: "farmRaider",
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
    prompts: [
      "Which farm activities at home or school could share resources?",
      "How does animal manure benefit a crop garden?",
      "What is one change you could make at home to reduce farm waste?",
    ],
    glossary: [
      { term: "Integrated farming", def: "A system that combines crops, livestock, fish, and other activities so waste from one becomes input for another." },
      { term: "Manure", def: "Animal dung used as a natural fertilizer to improve soil fertility." },
      { term: "Compost", def: "Decomposed organic matter (plant and food waste) used to enrich soil." },
      { term: "Biogas", def: "Gas (mainly methane) produced from decomposing organic waste, used as fuel for cooking." },
      { term: "Crop residues", def: "Plant parts left in the field after harvest, such as stalks and leaves." },
      { term: "Food security", def: "Reliable access to enough safe, nutritious food for all people in a household or community." },
      { term: "Resource recycling", def: "Using outputs from one process as inputs for another to reduce waste and cost." },
    ],
    links: [
      { label: "FAO Integrated Farming", url: "https://www.fao.org/integrated-farming" },
      { label: "KALRO Research Farms", url: "https://www.kalro.org" },
    ],
    video: null,
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
    prompts: [
      "What natural materials around your home could be used to make compost?",
      "Why is it important to harvest crops at the right time rather than too early or too late?",
      "How does crop rotation help reduce pest and disease problems?",
    ],
    glossary: [
      { term: "Organic gardening", def: "Growing food using natural methods without synthetic chemicals or fertilizers." },
      { term: "Mulching", def: "Covering soil with plant material to conserve moisture, suppress weeds, and add nutrients." },
      { term: "Crop rotation", def: "Growing different crops on the same land in different seasons to break pest cycles and restore soil nutrients." },
      { term: "Companion planting", def: "Growing two or more crops close together so one benefits the other, e.g. by deterring pests." },
      { term: "Top dressing", def: "Applying fertilizer or compost to the soil surface around growing plants to boost nutrition." },
      { term: "Natural pesticide", def: "A pest control substance made from plants or minerals rather than synthetic chemicals." },
      { term: "Field hygiene", def: "Removing crop debris and diseased plants from the garden to prevent spread of pests and diseases." },
    ],
    links: [
      { label: "Kenya Organic Agriculture Network", url: "https://www.koan.co.ke" },
      { label: "FAO Organic Gardening Guide", url: "https://www.fao.org/organic-agriculture" },
    ],
    video: null,
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
    game: "pestBlaster",
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
    prompts: [
      "What storage facilities exist at your home and what condition are they in?",
      "How can you tell if grain in a store has been attacked by pests or mould?",
      "What simple actions can a family take today to improve their food storage?",
    ],
    glossary: [
      { term: "Granary", def: "A building or store used for storing harvested grain." },
      { term: "Ventilation", def: "Allowing fresh air to flow through a store to remove moisture and prevent mould." },
      { term: "Mould", def: "A type of fungus that grows on damp food or surfaces, making food unsafe to eat." },
      { term: "Pest-proofing", def: "Sealing gaps and using safe methods to prevent insects and rodents from entering a store." },
      { term: "Infestation", def: "A large number of insects or rodents living in or attacking a store or crop." },
      { term: "Desiccant", def: "A substance that absorbs moisture, used to keep stored produce dry." },
    ],
    links: [
      { label: "Post-Harvest Loss Kenya", url: "https://www.aphlis.net/en/page/8/kenya" },
      { label: "FAO Storage Best Practices", url: "https://www.fao.org/post-harvest" },
    ],
    video: null,
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
    game: "flourFrenzy",
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
    prompts: [
      "What flour products does your family make at home and how are they made?",
      "How would you explain the difference between batter and dough to a younger student?",
      "What safety precautions should you follow when deep frying food?",
    ],
    glossary: [
      { term: "Batter", def: "A liquid mixture of flour and liquid with a flowing consistency, used for pancakes and coatings." },
      { term: "Dough", def: "A thick, firm mixture of flour and liquid that can be kneaded, rolled, and shaped." },
      { term: "Kneading", def: "Pressing and folding dough repeatedly to develop gluten and make it elastic." },
      { term: "Gluten", def: "A protein network formed when flour is mixed with water, giving dough its elasticity." },
      { term: "Leavening", def: "Making dough or batter rise by adding yeast or baking powder to produce gas bubbles." },
      { term: "Shallow frying", def: "Cooking food in a small amount of oil in a pan, turning to cook both sides." },
      { term: "Deep frying", def: "Cooking food by submerging it fully in hot oil." },
    ],
    links: [
      { label: "Kenya Home Science Association", url: "https://www.homescience.co.ke" },
      { label: "Bread & Baking Basics", url: "https://www.bbga.org/resources/baking-basics" },
    ],
    video: null,
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
    prompts: [
      "What cleaning tools and products are available in your home for this task?",
      "How often should a household waste bin be emptied and cleaned?",
      "What health problems can result from a dirty or blocked drain?",
    ],
    glossary: [
      { term: "Disinfectant", def: "A chemical liquid used to kill germs on surfaces and equipment." },
      { term: "Detergent", def: "A cleaning substance that removes grease and dirt, usually mixed with water." },
      { term: "Drain", def: "A channel or pipe that carries away waste water from a sink or yard." },
      { term: "Bin liner", def: "A plastic bag placed inside a waste bin to make it easier to remove and clean." },
      { term: "Sanitation", def: "The maintenance of clean conditions to protect health and prevent disease." },
      { term: "Cross-contamination", def: "The transfer of germs from a dirty surface or object to a clean one." },
    ],
    links: [
      { label: "Ministry of Health Kenya — Sanitation", url: "https://www.health.go.ke/sanitation" },
      { label: "WHO Hygiene Promotion", url: "https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health" },
    ],
    video: null,
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
    prompts: [
      "Which disinfecting method is most practical for your home and why?",
      "What safety precautions should be taken when boiling clothing?",
      "How does sunlight help to kill germs on fabric?",
    ],
    glossary: [
      { term: "Boiling", def: "Submerging items in water heated to 100°C to kill germs and pathogens." },
      { term: "Salting", def: "Soaking fabrics in a strong salt solution to draw out moisture and kill microorganisms." },
      { term: "Ironing", def: "Using a hot iron on fabric to kill surface germs through direct heat." },
      { term: "Pathogen", def: "A microorganism such as a bacterium or virus that causes disease." },
      { term: "UV rays", def: "Ultraviolet radiation from the sun that destroys the DNA of bacteria on surfaces." },
      { term: "Scald", def: "A burn caused by very hot liquid or steam." },
      { term: "Communicable disease", def: "A disease that can spread from person to person through direct or indirect contact." },
    ],
    links: [
      { label: "CDC Disinfection Guidelines", url: "https://www.cdc.gov/infectioncontrol/guidelines" },
      { label: "WHO Infection Prevention", url: "https://www.who.int/infection-prevention" },
    ],
    video: null,
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
    prompts: [
      "What fruit trees near your home or school could benefit from grafting?",
      "Why is it important to make a smooth, matching cut when grafting?",
      "What would happen if the graft union is not sealed or tied tightly?",
    ],
    glossary: [
      { term: "Scion", def: "The upper part of a grafted plant, taken from a plant with desired characteristics." },
      { term: "Rootstock", def: "The lower part of a grafted plant that provides the root system and support." },
      { term: "Graft union", def: "The point where the scion and rootstock are joined together and fuse." },
      { term: "V-cut grafting", def: "A grafting method where a V-shaped cut is made in the rootstock to insert a wedge-shaped scion." },
      { term: "Grafting tape", def: "A stretchy tape used to bind and protect the graft union while it heals." },
      { term: "Callus", def: "New tissue that grows over a wound or graft union to seal and heal the join." },
      { term: "Vegetative propagation", def: "Reproducing plants using non-seed parts such as cuttings, buds, or grafts." },
    ],
    links: [
      { label: "KARI Horticulture Grafting Guide", url: "https://www.kari.org/horticulture" },
      { label: "FAO Plant Propagation Manual", url: "https://www.fao.org/plant-production-protection" },
    ],
    video: null,
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
    prompts: [
      "What locally available materials could you use to build a sun dryer frame?",
      "Why is it important to turn vegetables during the drying process?",
      "How would you test whether the vegetables are fully dried before storing them?",
    ],
    glossary: [
      { term: "Sun dryer", def: "A device that uses solar energy and trapped heat to dry food for preservation." },
      { term: "Transparent cover", def: "A clear material (glass or plastic) that allows sunlight in while trapping heat inside the dryer." },
      { term: "Wire mesh tray", def: "A tray made from metal netting that holds food and allows air to circulate around it." },
      { term: "Dehydration", def: "Removing water from food to prevent microbial growth and extend shelf life." },
      { term: "Solar drying", def: "Using energy from the sun to remove moisture from food or crops." },
      { term: "Greenhouse effect", def: "The trapping of heat inside an enclosed space, similar to how a sun dryer works." },
      { term: "Moisture content", def: "The amount of water remaining in dried food, which must be low enough to prevent spoilage." },
    ],
    links: [
      { label: "SOLARAID Food Drying Resources", url: "https://www.solaraid.org/resources" },
      { label: "FAO Solar Food Drying", url: "https://www.fao.org/post-harvest/solar-drying" },
    ],
    video: null,
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
const ACCOUNT_KEY = "agriNutritionGrade9Accounts";
const SESSION_KEY = "agriNutritionGrade9ActiveAccount";
const OBSERVED_LEARNER_KEY = "agriNutritionGrade9ObservedLearner";
const LEGACY_PROGRESS_MIGRATED_KEY = "agriNutritionGrade9ProgressMigratedToProfiles";

const ACCOUNT_ROLES = {
  student: {
    label: "Student",
    action: "Learn, play, answer quizzes, and save progress.",
    dashboard: "My progress",
  },
  teacher: {
    label: "Teacher",
    action: "View local student progress and compare shared codes.",
    dashboard: "Teacher dashboard",
  },
  parent: {
    label: "Parent",
    action: "View a learner's progress and support revision at home.",
    dashboard: "Parent view",
  },
};

const DEFAULT_ACCOUNTS = [
  { id: "student-demo", role: "student", name: "Student" },
  { id: "teacher-demo", role: "teacher", name: "Teacher" },
  { id: "parent-demo", role: "parent", name: "Parent" },
];

const SHOULD_PROMPT_LOGIN = !localStorage.getItem(SESSION_KEY);
let offlineAccounts = [];
let currentProfile = null;

const STRINGS = {
  en: {
    tabLearn: "Learn", tabPlay: "Games", tabQuiz: "Quiz", tabReader: "Book",
    tabJournal: "Journal", tabFlashcard: "Flashcards", tabGlossary: "Glossary",
    markLearned: "Mark learned", reviewAgain: "Review again",
    submitQuiz: "Submit quiz", clearAnswers: "Clear answers",
    saveNote: "Save note", exportProgress: "Export progress", shareProgress: "Share progress",
    downloadCert: "Download Certificate", startAssessment: "Start Assessment",
    timedMode: "Timed mode", bestScore: "Best score", progress: "Progress",
    answered: "answered", badgeEarned: "Quiz badge earned!",
    keepPractising: "Keep practising!", reviewNotes: "Review the notes and try again.",
    learnedToast: "Module marked as learned!",
    noteSaved: "Journal note saved.",
    progressReset: "Reset all saved progress and notes?",
    gameComplete: "Game completed! Progress saved.",
    scoreSaved: "Score saved.",
    offlineBanner: "You are offline. Content is still available.",
    onlineBanner: "Back online!",
    assignmentBanner: "Assignment mode",
    printSummary: "Print summary",
    watchVideo: "Watch video",
    relatedLinks: "Related links",
    flipHint: "Click card to flip",
    knownBtn: "Got it!",
    allKnown: "All cards mastered!",
    searchGlossary: "Search terms…",
    copyCode: "Copy code",
    importCode: "Import",
    shareModalTitle: "Share your progress",
    shareInstructions: "Give this code to your teacher or classmate to import your progress.",
    importModalTitle: "Import progress code",
    importPlaceholder: "Paste code here…",
    importBtn: "Import",
    certTitle: "Certificate of Achievement",
    certSub: "This is to certify that",
    certBody: "has successfully completed all modules of the",
    certCourse: "Agriculture & Nutrition Grade 9 MTP Digital Course",
    streakLabel: "day streak",
    weeklyLabel: "this week",
    assessmentTitle: "Timed Assessment",
    assessmentTimer: "Time remaining",
    assessmentSubmit: "Submit Assessment",
    promptsHeading: "Reflect further…",
  },
  sw: {
    tabLearn: "Jifunze", tabPlay: "Michezo", tabQuiz: "Jaribio", tabReader: "Kitabu",
    tabJournal: "Shajara", tabFlashcard: "Kadi", tabGlossary: "Kamusi",
    markLearned: "Weka alama ya kujifunza", reviewAgain: "Kagua tena",
    submitQuiz: "Wasilisha jaribio", clearAnswers: "Futa majibu",
    saveNote: "Hifadhi kumbukumbu", exportProgress: "Hamisha maendeleo", shareProgress: "Shiriki maendeleo",
    downloadCert: "Pakua Cheti", startAssessment: "Anza Tathmini",
    timedMode: "Hali ya wakati", bestScore: "Alama bora", progress: "Maendeleo",
    answered: "imejibiwa", badgeEarned: "Beji ya jaribio imepata!",
    keepPractising: "Endelea kujifunza!", reviewNotes: "Kagua maelezo na ujaribu tena.",
    learnedToast: "Moduli imewekwa alama ya kujifunza!",
    noteSaved: "Kumbukumbu ya shajara imehifadhiwa.",
    progressReset: "Futa maendeleo yote na maelezo?",
    gameComplete: "Mchezo umekamilika! Maendeleo yamehifadhiwa.",
    scoreSaved: "Alama imehifadhiwa.",
    offlineBanner: "Uko nje ya mtandao. Maudhui bado yanapatikana.",
    onlineBanner: "Umeunganishwa tena!",
    assignmentBanner: "Hali ya kazi ya darasa",
    printSummary: "Chapisha muhtasari",
    watchVideo: "Tazama video",
    relatedLinks: "Viungo vinavyohusiana",
    flipHint: "Bonyeza kadi kugeuka",
    knownBtn: "Nimeelewa!",
    allKnown: "Kadi zote zimesomwa!",
    searchGlossary: "Tafuta maneno…",
    copyCode: "Nakili nambari",
    importCode: "Ingiza",
    shareModalTitle: "Shiriki maendeleo yako",
    shareInstructions: "Toa nambari hii kwa mwalimu au mwanafunzi mwenzako.",
    importModalTitle: "Ingiza nambari ya maendeleo",
    importPlaceholder: "Bandika nambari hapa…",
    importBtn: "Ingiza",
    certTitle: "Cheti cha Mafanikio",
    certSub: "Hii ni kuthibitisha kwamba",
    certBody: "amefanikiwa kukamilisha moduli zote za",
    certCourse: "Kozi ya Kilimo na Lishe Darasa la 9",
    streakLabel: "siku mfululizo",
    weeklyLabel: "wiki hii",
    assessmentTitle: "Tathmini ya Wakati",
    assessmentTimer: "Muda uliobaki",
    assessmentSubmit: "Wasilisha Tathmini",
    promptsHeading: "Fikiria zaidi…",
  },
};

function t(key) {
  return (STRINGS[progress?.language || "en"] || STRINGS.en)[key] || key;
}

const MODULE_TRANSLATIONS = {
  sw: {
    hay: {
      strand: "Uhifadhi wa Rasilimali",
      title: "Kuhifadhi Chakula cha Wanyama: Nyasi",
      summary: "Hifadhi nyasi iliyokatwa, masalia, au nyasi inayosimama ili wanyama wapate chakula wakati wa kiangazi.",
      goals: ["Eleza malisho, mfugo, mazao ya malisho, na nyasi.","Chagua mazao ya malisho yanayofaa na uvune wakati wa kuwa na maua.","Kausha, bana, panga, na hifadhi nyasi ili kudumisha thamani ya lishe."],
      ideas: ["Nyasi nzuri hukatwa na kukaushwa hadi unyevu wa asilimia 15 hadi 20.","Hewa kavu, kupinda mara kwa mara, na kuhifadhi katika eneo kavu hulinda ubora.","Nyasi iliyobanwa kwa kawaida ina lishe zaidi kuliko masalia ya mashina au nyasi inayosimama."],
      activities: ["Mazungumzo ya wawili","Utafutaji wa kidijitali","Mradi wa kuhifadhi malisho","Matembezi ya maonyesho"],
      journal: "Panga mradi mdogo wa kuhifadhi nyasi nyumbani au shuleni. Taja aina ya malisho, zana, njia ya kukausha, na mahali pa kuhifadhi.",
      prompts: ["Je, mazao ya malisho gani yanapatikana karibu na nyumba yako au shuleni?","Ungejuaje ikiwa nyasi imekauka ya kutosha kwa uhifadhi salama?","Ni matatizo gani yanaweza kutokea ikiwa nyasi inahifadhiwa na unyevu mwingi?"],
      glossary: [
        { term: "Malisho", def: "Nyenzo za mimea (majani, mashina, nyasi) ambazo wanyama hula kwa kuchunga au kuvuna." },
        { term: "Nyasi kavu", def: "Malisho yaliyokatwa na kukaushwa, huhifadhiwa kama chakula cha wanyama wakati wa kiangazi." },
        { term: "Uwanja wa malisho", def: "Ardhi iliyofunikwa na nyasi au mimea mingine inayofaa kwa wanyama kuchunga." },
        { term: "Zao la malisho", def: "Zao linalolimwa hasa kulisha mifugo, kama mahindi, mtama, au luseni." },
        { term: "Kubana nyasi", def: "Kusukuma nyasi kavu kuwa mapande makubwa ya mstatili au mviringo kwa uhifadhi." },
        { term: "Kunyauka", def: "Hatua ya kwanza ya kukausha ambapo malisho mapya yaliyokatwa hupoteza unyevu kupita kiasi." },
        { term: "Masalia ya mashina", def: "Mashina makavu na majani ya zao (k.m. mahindi) yaliyobaki baada ya nafaka kuvunwa." },
      ],
      links: [{ label: "Mwongozo wa Malisho wa Kenya", url: "https://www.kari.org/forages" },{ label: "Mwongozo wa FAO wa Kutengeneza Nyasi", url: "https://www.fao.org/agriculture/crops/hay" }],
      quiz: [
        { q: "Mazao ya malisho yanapaswa kuvunwa katika hatua gani kwa nyasi ya ubora wa juu?", o: ["Hatua ya miche","Hatua ya maua","Baada ya kuoza","Wakati wa mvua"] },
        { q: "Kwa nini nyasi inapaswa kuhifadhiwa katika banda lililoinuliwa na lenye hewa?", o: ["Kuongeza unyevu","Kuihifadhi kavu na kupunguza upotevu wa lishe","Kuvutia wadudu","Kuifanya iwe nyeupe haraka"] },
        { q: "Njia gani inaruhusu wanyama kuchunga malisho yaliyobaki shambani wakati wa kiangazi?", o: ["Nyasi iliyobanwa","Nyasi inayosimama","Kukaanga kwa mafuta mengi","Uingizaji"] },
      ],
    },
    leftovers: {
      strand: "Uhifadhi wa Rasilimali",
      title: "Kuhifadhi Chakula Kilichobaki",
      summary: "Shughulikia chakula kilichobaki kwa usalama kwa kuhifadhi, kushiriki, kupasha moto, kupika upya, au kutupa chakula kilichooza.",
      goals: ["Tambua njia salama za kuhifadhi chakula kilichobaki.","Eleza faida za kuzuia upotevu wa chakula.","Andaa milo rahisi kutoka kwa ugali, chapati, viazi vikuu, githeri, na wali uliobaki."],
      ideas: ["Chakula kilichobaki kinapaswa kuhifadhiwa katika vyombo safi vilivyofunikwa kwenye jokofu au mahali pa baridi.","Chakula chenye harufu mbaya, rangi ya ajabu, au muundo wa ajabu kinapaswa kutupwa.","Kuhifadhi chakula kilichobaki kunaokoa chakula, pesa, mafuta, kazi, na muda."],
      activities: ["Hali ya usalama wa chakula","Ukusanyaji wa mapishi","Ugali wa kukaanga","Mukimo kutoka githeri"],
      journal: "Andika mapishi salama ya chakula kilichobaki kutoka nyumbani kwako. Taja chakula cha awali, njia ya kuhifadhi, hatua za maandalizi, na ukaguzi wa usalama.",
      prompts: ["Ni vyakula gani vilivyobaki vinavyopatikana mara nyingi nyumbani kwako kila wiki?","Unajuaje chakula kimeharibika na kinapaswa kutupwa?","Pesa au rasilimali ngapi familia yako ingeweza kuokoa kwa kupunguza upotevu wa chakula?"],
      glossary: [
        { term: "Chakula kilichobaki", def: "Chakula kilichoandaliwa lakini hakikuliwa wakati wa mlo, ambacho kinaweza kuhifadhiwa kwa matumizi ya baadaye." },
        { term: "Uchafuzi", def: "Kuingizwa kwa vijidudu hatari au vitu kwenye chakula na kukifanya kisifae kuliwa." },
        { term: "Ujokofu", def: "Kupoza chakula ili kupunguza ukuaji wa bakteria na kuongeza muda wake salama." },
        { term: "Kupasha moto", def: "Kupasha moto chakula kilichobaki hadi joto salama kuua bakteria yoyote iliyokua." },
        { term: "Upotevu wa chakula", def: "Chakula kinachotupwa bila sababu, kupoteza pesa, nishati, na rasilimali." },
        { term: "Kuharibika", def: "Mchakato ambapo chakula kinakuwa kisifae kuliwa kutokana na bakteria, ukungu, au chachu." },
      ],
      links: [{ label: "Viwango vya Usalama wa Chakula vya KEBS", url: "https://www.kebs.org/food-safety" },{ label: "Vidokezo vya Usalama wa Chakula vya WHO", url: "https://www.who.int/news-room/fact-sheets/detail/food-safety" }],
      quiz: [
        { q: "Ni nini kifanyike na wali uliobaki wenye harufu ya ajabu?", o: ["Uhudumie baridi","Utupe","Uchanganye na viungo tu","Uhifadhi kwa wiki nyingine"] },
        { q: "Mazoea gani husaidia kuzuia uchafuzi wa chakula kilichobaki?", o: ["Kuacha wazi","Kuhifadhi kwa kufunikwa katika chombo safi","Kuiweka sakafuni","Kugusa kwa mikono michafu"] },
        { q: "Kubadilisha chakula kilichobaki kuwa mlo mpya hasa husaidia kupunguza nini?", o: ["Upotevu wa chakula","Usafi","Ustadi wa kupika","Uingizaji hewa"] },
      ],
    },
    integrated: {
      strand: "Uhifadhi wa Rasilimali",
      title: "Kilimo Changanyiko",
      summary: "Rudia rasilimali kati ya mazao, wanyama, samaki, maji, na taka ili kupunguza gharama na kuboresha uzalishaji wa shamba.",
      goals: ["Eleza kilimo changanyiko kama mfumo wa kurudia rasilimali.","Unganisha masalia ya mazao, samadi, maji, mabwawa ya samaki, na bustani.","Eleza jinsi ushirikiano unavyosaidia mapato na usalama wa chakula."],
      ideas: ["Taka kutoka shughuli moja ya shamba inaweza kuwa ingizo kwa shughuli nyingine.","Samadi ya wanyama inaweza kuboresha rutuba ya udongo au kulisha mboji na mifumo ya biogas.","Mashamba changanyiko hupunguza taka na kutumia ardhi, maji, na kazi vizuri zaidi."],
      activities: ["Ramani ya rasilimali za shamba","Mjadala wa kikundi","Ukaguzi wa shamba la nyumbani"],
      journal: "Chora au eleza mfumo wa shamba wa mzunguko ambao unarudia rasilimali angalau nne kabla ya kitu chochote kuwa taka.",
      prompts: ["Shughuli gani za shamba nyumbani au shuleni zinaweza kushiriki rasilimali?","Jinsi gani samadi ya wanyama inufaisha bustani ya mazao?","Ni mabadiliko gani moja unayoweza kufanya nyumbani ili kupunguza taka za shamba?"],
      glossary: [
        { term: "Kilimo changanyiko", def: "Mfumo unaounganisha mazao, mifugo, samaki, na shughuli nyingine ili taka kutoka moja iwe ingizo kwa nyingine." },
        { term: "Samadi", def: "Kinyesi cha wanyama kinachotumiwa kama mbolea asilia kuboresha rutuba ya udongo." },
        { term: "Mboji", def: "Viumbe hai vilivyooza (taka za mimea na chakula) vinavyotumiwa kurutubisha udongo." },
        { term: "Biogas", def: "Gesi (hasa methane) inayozalishwa kutoka kwa taka za viumbe hai vinavyooza, inayotumiwa kama mafuta ya kupikia." },
        { term: "Masalia ya mazao", def: "Sehemu za mimea zilizobaki shambani baada ya mavuno, kama mashina na majani." },
        { term: "Usalama wa chakula", def: "Upatikanaji wa kutosha wa chakula salama na chenye lishe kwa watu wote katika kaya au jamii." },
        { term: "Kurudia rasilimali", def: "Kutumia matokeo ya mchakato mmoja kama ingizo la mchakato mwingine kupunguza taka na gharama." },
      ],
      links: [{ label: "Kilimo Changanyiko cha FAO", url: "https://www.fao.org/integrated-farming" },{ label: "Mashamba ya Utafiti ya KALRO", url: "https://www.kalro.org" }],
      quiz: [
        { q: "Wazo kuu la kilimo changanyiko ni nini?", o: ["Kutumia zao moja tu","Kurudia rasilimali ndani ya shamba","Kuepuka wanyama","Kuchoma masalia yote"] },
        { q: "Rasilimali gani kutoka kwa mifugo inaweza kuboresha bustani ya mazao?", o: ["Plastiki","Samadi","Moshi","Kutu"] },
        { q: "Shamba changanyiko lililopangwa vizuri husaidia kupunguza nini zaidi?", o: ["Ugavi wa chakula","Taka na gharama za uzalishaji","Uhai wa udongo","Uhifadhi wa maji"] },
      ],
    },
    organic: {
      strand: "Michakato ya Uzalishaji wa Chakula",
      title: "Bustani ya Kilimo Asilia",
      summary: "Panda mboga, mikunde, na viungo kwa kutumia mboji, samadi, matandazo, mzunguko wa mazao, dawa za asilia za kuua wadudu, na uvunaji makini.",
      goals: ["Andaa bustani ya kilimo asilia na ulee mazao kwa uwajibikaji.","Tumia mazoea ya asilia ya rutuba ya udongo na udhibiti wa wadudu.","Vuna mazao katika hatua sahihi ukizingatia usafi."],
      ideas: ["Kilimo asilia kinaepuka utegemezi mkubwa kwa mbolea bandia na dawa za kuua wadudu.","Mboji, samadi, matandazo, umwagiliaji, na kuongeza mbolea vinasaidia mazao yenye afya.","Mzunguko wa mazao, upanzi wa pamoja, usafi wa shamba, na wawindaji wa asilia hupunguza wadudu na magonjwa."],
      activities: ["Ratiba ya wajibu wa bustani","Maabara ya dawa za asilia za wadudu","Jedwali la uvunaji","Picha za portfolio"],
      journal: "Chagua zao moja kutoka eneo lako na uunda ratiba ya kila wiki ya utunzaji wa bustani ya kilimo asilia kutoka upanzi hadi uvunaji.",
      prompts: ["Ni nyenzo gani za asilia karibu na nyumba yako zinazoweza kutumika kutengeneza mboji?","Kwa nini ni muhimu kuvuna mazao wakati unaofaa badala ya mapema au marehemu sana?","Jinsi gani mzunguko wa mazao husaidia kupunguza matatizo ya wadudu na magonjwa?"],
      glossary: [
        { term: "Kilimo asilia", def: "Kukua chakula kwa kutumia njia za asilia bila kemikali bandia au mbolea." },
        { term: "Matandazo", def: "Kufunika udongo kwa nyenzo za mmea ili kuhifadhi unyevu, kuzuia magugu, na kuongeza virutubisho." },
        { term: "Mzunguko wa mazao", def: "Kukua mazao tofauti kwenye ardhi moja katika misimu tofauti kuvunja mzunguko wa wadudu na kurejesha virutubisho." },
        { term: "Upanzi wa pamoja", def: "Kukua mazao mawili au zaidi karibu ili moja linufaishe lingine, k.m. kwa kuzuia wadudu." },
        { term: "Kuongeza mbolea", def: "Kuweka mbolea au mboji kwenye uso wa udongo karibu na mimea inayokua ili kuongeza lishe." },
        { term: "Dawa ya asilia ya wadudu", def: "Dawa ya kudhibiti wadudu iliyotengenezwa kutoka kwa mimea au madini badala ya kemikali bandia." },
        { term: "Usafi wa shamba", def: "Kuondoa masalia ya mazao na mimea yenye ugonjwa kutoka bustanini ili kuzuia kuenea kwa wadudu na magonjwa." },
      ],
      links: [{ label: "Mtandao wa Kilimo Asilia wa Kenya", url: "https://www.koan.co.ke" },{ label: "Mwongozo wa FAO wa Bustani ya Kilimo Asilia", url: "https://www.fao.org/organic-agriculture" }],
      quiz: [
        { q: "Mazoea gani husaidia kuzuia magugu na kuhifadhi unyevu wa udongo katika bustani ya kilimo asilia?", o: ["Matandazo","Kumwagilia kila siku","Kuchoma mboji","Kuacha udongo wazi"] },
        { q: "Kwa nini mazao yanayohusiana yanapaswa kupanda maeneo tofauti badala ya sehemu moja kila wakati?", o: ["Yanaweza kushiriki wadudu na magonjwa","Hayawezi kutumia maji","Yanazuia jua","Hayhitaji udongo"] },
        { q: "Ni kiungo gani cha dawa ya asilia ya wadudu kilichotajwa katika kitabu?", o: ["Pilipili kali","Mafuta ya gari","Majivu ya rangi","Blichi"] },
      ],
    },
    storage: {
      strand: "Michakato ya Uzalishaji wa Chakula",
      title: "Kuhifadhi Mazao ya Shamba",
      summary: "Andaa na simamia maghala, vyumba, mifuko, na vyombo ili nafaka na mizizi viendelee kuwa salama.",
      goals: ["Tambua miundo ya uhifadhi na vifaa vya mazao ya shamba.","Andaa ghala kwa kusafisha, kukausha, kuziba, na kuzuia wadudu.","Simamia mazao yaliyohifadhiwa ili kuzuia ukungu, wadudu, unyevu, na harufu mbaya."],
      ideas: ["Vifaa vya uhifadhi vinapaswa kuwa vikavu, safi, baridi, vyenye hewa, na salama dhidi ya wadudu.","Masalia ya mazao ya zamani, vumbi, uvujaji, sehemu zilizovunjika, na mimea karibu na ghala lazima yashughulikiwe.","Mazao yaliyoharibika au yenye wadudu yanapaswa kuondolewa ili kuzuia kuenea."],
      activities: ["Ukaguzi wa muundo wa uhifadhi","Andaa ghala la shule","Utafiti wa usalama wa chakula"],
      journal: "Kagua mahali pa kuhifadhi chakula nyumbani au shuleni. Orodhesha hatari tatu na vitendo vitatu vitakavyofanya kuwa salama zaidi.",
      prompts: ["Ni vifaa gani vya uhifadhi vilivyopo nyumbani kwako na hali yao ni nini?","Unajuaje nafaka kwenye ghala imeshambuliwa na wadudu au ukungu?","Vitendo gani rahisi familia inaweza kuchukua leo kuboresha uhifadhi wao wa chakula?"],
      glossary: [
        { term: "Ghala", def: "Jengo au chumba kinachotumiwa kuhifadhi nafaka iliyovunwa." },
        { term: "Uingizaji hewa", def: "Kuruhusu hewa safi kupita kwenye ghala ili kuondoa unyevu na kuzuia ukungu." },
        { term: "Ukungu", def: "Aina ya kuvu unaokua kwenye chakula au nyuso zenye unyevu, ukifanya chakula kisifae kuliwa." },
        { term: "Kuzuia wadudu", def: "Kuziba nafasi na kutumia njia salama ili kuzuia wadudu na panya wasiingie ghali." },
        { term: "Shambulio la wadudu", def: "Idadi kubwa ya wadudu au panya wanaoishi ndani au kushambulia ghala au mazao." },
        { term: "Kifyonzaji cha unyevu", def: "Dutu inayofyonza unyevu, inayotumiwa kuweka mazao yaliyohifadhiwa yakiwa kavu." },
      ],
      links: [{ label: "Upotevu wa Baada ya Mavuno Kenya", url: "https://www.aphlis.net/en/page/8/kenya" },{ label: "Mazoea Bora ya Uhifadhi ya FAO", url: "https://www.fao.org/post-harvest" }],
      quiz: [
        { q: "Kwa nini ghala la mazao inapaswa kuwa kavu?", o: ["Kupunguza kuoza na ukuaji wa ukungu","Kulowesha nafaka","Kuvutia panya","Kuzuia mzunguko wa hewa"] },
        { q: "Kitendo gani kinazuia wadudu kuingia kwenye chombo cha kuhifadhi?", o: ["Kutumia kifuniko kinachofaa vizuri","Kukiacha wazi","Kuongeza maji","Kuweka sehemu zilizovunjika"] },
        { q: "Ni nini kifanyike nafaka zilizooza zinapopatikana kwenye mfuko?", o: ["Zirudishe kwenye mfuko","Ziondoe kulinda zilizobaki","Zichanganye na nafaka safi","Lowesha mfuko"] },
      ],
    },
    flour: {
      strand: "Michakato ya Uzalishaji wa Chakula",
      title: "Kupika: Kutumia Mchanganyiko wa Unga",
      summary: "Tumia uji wa kupiga na unga ulioandaliwa kutengeneza pancakes, chapati, mandazi, donati, mkate, na vyakula vilivyopakiwa unga.",
      goals: ["Tofautisha uji wa kupiga na unga ulioandaliwa kwa muundo na viungo.","Andaa uji wa kupiga na unga ulioandaliwa kwa taratibu sahihi.","Oanisha mchanganyiko wa unga na bidhaa za kukaanga kidogo, kukaanga kwa mafuta mengi, na kuoka."],
      ideas: ["Uji wa kupiga una muundo wa kutiririka na unaweza kuwa nyembamba au mnene.","Unga ulioandaliwa ni laini lakini imara, hupinda, na unaweza kukandwa, kusombwa, na kupewa umbo.","Uji mwembamba hutengeneza pancakes; unga ulioandaliwa hutengeneza chapati, mandazi, donati, na mkate."],
      activities: ["Andaa uji wa kupiga","Andaa unga ulioandaliwa","Vitendo vya kutengeneza pancake","Vitendo vya chapati na mandazi"],
      journal: "Linganisha uji wa kupiga na unga ulioandaliwa kwenye jedwali. Jumuisha kiwango cha maji, muundo, njia ya kushughulikia, na bidhaa mbili.",
      prompts: ["Ni bidhaa gani za unga familia yako hutengeneza nyumbani na hutengenezwa vipi?","Ungaelezaje tofauti kati ya uji wa kupiga na unga ulioandaliwa kwa mwanafunzi mdogo?","Ni tahadhari gani za usalama unapaswa kufuata unapokaanga chakula kwa mafuta mengi?"],
      glossary: [
        { term: "Uji wa kupiga", def: "Mchanganyiko wa unga na kioevu wenye muundo wa kutiririka, unaotumika kwa pancakes na kupaka." },
        { term: "Unga ulioandaliwa", def: "Mchanganyiko mnene wa unga na kioevu ambao unaweza kukandwa, kusombwa, na kupewa umbo." },
        { term: "Kukanda", def: "Kubonyeza na kukunja unga mara kwa mara ili kukuza gluteni na kuufanya upinde." },
        { term: "Gluteni", def: "Mtandao wa protini unaounda unga unapochanganywa na maji, ukipa unga wake wa kupinda." },
        { term: "Kuchachisha", def: "Kufanya unga au uji wa kupiga uinuke kwa kuongeza chachu au unga wa kuoka." },
        { term: "Kukaanga kidogo", def: "Kupika chakula katika kiasi kidogo cha mafuta kwenye sufuria, ukigeuzisha kupika pande zote." },
        { term: "Kukaanga kwa mafuta mengi", def: "Kupika chakula kwa kuzamisha kabisa katika mafuta moto." },
      ],
      links: [{ label: "Chama cha Sayansi ya Nyumbani cha Kenya", url: "https://www.homescience.co.ke" },{ label: "Misingi ya Mkate na Uoka", url: "https://www.bbga.org/resources/baking-basics" }],
      quiz: [
        { q: "Mchanganyiko gani wa unga una muundo wa kutiririka?", o: ["Uji wa kupiga","Unga ulioandaliwa","Nyasi","Mboji"] },
        { q: "Bidhaa gani hutengenezwa kawaida kutoka kwa uji mwembamba?", o: ["Pancakes","Chapati","Mandazi","Mkate"] },
        { q: "Ni nini kinaweza kufanywa na unga ulioandaliwa lakini si kwa uji mwembamba?", o: ["Kukanda na kusomba","Kuumimina kwa urahisi","Kutumia kama dawa","Kuua vijidudu"] },
      ],
    },
    waste: {
      strand: "Mazoea ya Usafi",
      title: "Kusafisha Vifaa vya Kutupa Taka",
      summary: "Safisha mapipa, sinki, na mifereji kwa kutumia zana sahihi, sabuni ya kusafisha, dawa ya kuua vijidudu, na taratibu salama.",
      goals: ["Tambua vifaa vya kutupa taka vya nyumbani.","Safisha mapipa ya taka, sinki, mifereji ya saruji, na mifereji ya udongo kwa usalama.","Eleza kwa nini kusafisha mara kwa mara kulinda afya."],
      ideas: ["Glavu hulinda mikono dhidi ya uchafu na vijidudu wakati wa kusafisha.","Sinki na mifereji inapaswa kusafishwa, kukwa, suuzwa, na kusombwa.","Mifuko ya mapipa ya taka na ratiba za wajibu za mara kwa mara husaidia kudumisha usafi."],
      activities: ["Ratiba ya wajibu wa pipa la taka","Kusafisha sinki la jikoni","Vitendo vya kusafisha mfereji"],
      journal: "Unda ratiba ya kusafisha kila wiki kwa kifaa kimoja cha kutupa taka. Jumuisha zana, usalama, na pointi za ukaguzi.",
      prompts: ["Ni zana na bidhaa gani za kusafisha zinazopatikana nyumbani kwako kwa kazi hii?","Pipa la taka la nyumbani linapaswa kutolewa na kusafishwa mara ngapi?","Ni matatizo gani ya afya yanayoweza kutokana na mfereji mchafu au ulozibwa?"],
      glossary: [
        { term: "Dawa ya kuua vijidudu", def: "Kioevu cha kemikali kinachotumiwa kuua vijidudu kwenye nyuso na vifaa." },
        { term: "Sabuni ya kusafisha", def: "Dutu ya kusafisha inayoondoa mafuta na uchafu, kawaida huchanganywa na maji." },
        { term: "Mfereji", def: "Njia au bomba linalobeba maji machafu kutoka sinki au ua." },
        { term: "Mfuko wa ndani wa pipa", def: "Mfuko wa plastiki unaowekwa ndani ya pipa la taka kurahisisha kuondoa na kusafisha." },
        { term: "Usafi wa mazingira", def: "Kudumisha hali za usafi ili kulinda afya na kuzuia magonjwa." },
        { term: "Maambukizo ya msalaba", def: "Uhamishaji wa vijidudu kutoka uso au kitu kichafu hadi kitu safi." },
      ],
      links: [{ label: "Wizara ya Afya ya Kenya — Usafi", url: "https://www.health.go.ke/sanitation" },{ label: "Kukuza Usafi wa WHO", url: "https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health" }],
      quiz: [
        { q: "Kwa nini glavu zinapaswa kuvaliwa wakati wa kusafisha vifaa vya kutupa taka?", o: ["Kulinda mikono dhidi ya uchafu na vijidudu","Kukausha sinki","Kuongeza harufu mbaya","Kuhifadhi nafaka"] },
        { q: "Sinki iliyozibwa inaweza kusababisha nini?", o: ["Mkusanyiko wa uchafu na mifereji mibaya","Uingizaji hewa bora","Mazao makavu zaidi","Mazao safi zaidi"] },
        { q: "Kwa nini mifuko ya ndani ya mapipa ya taka ni muhimu?", o: ["Hufanya mapipa kuwa rahisi kudumisha usafi","Huvutia wadudu","Inabadilisha kuosha milele","Inaziba mifereji"] },
      ],
    },
    disinfecting: {
      strand: "Mazoea ya Usafi",
      title: "Kuua Vijidudu kwenye Nguo na Vifaa vya Nyumbani",
      summary: "Tumia kuchemsha, dawa ya kuua vijidudu, jua, chumvi, na pasi kupunguza kuenea kwa magonjwa ya kuambukizana.",
      goals: ["Eleza njia tano za kuua vijidudu kwenye nguo na vifaa vya nyumbani.","Chagua njia zinazofaa kwa vitambaa na hali tofauti.","Zingatia tahadhari za kuzuia kuungua, kuungua kwa mvuke, na maambukizo."],
      ideas: ["Kuchemsha kunafanya vizuri kwa pamba nyeupe na kitani kinachoweza kuvumilia joto.","Dawa ya kuua vijidudu ni muhimu kwa vitambaa visivyostahimili kuchemsha, lakini maelekezo ya lebo ni muhimu.","Kuchanganya njia kama jua na kupiga pasi kunaweza kuboresha ufanisi."],
      activities: ["Maneno ya msalaba","Vitendo vya kuchemsha","Vitendo vya dawa ya kuua vijidudu","Kuanikwa na kupiga pasi"],
      journal: "Chagua kitu kimoja cha nyumbani na uandike njia salama ya kuua vijidudu kwa hicho, ikijumuisha vifaa na tahadhari.",
      prompts: ["Ni njia gani ya kuua vijidudu inayofaa zaidi kwa nyumba yako na kwa nini?","Ni tahadhari gani za usalama zinapaswa kuchukuliwa wakati wa kuchemsha nguo?","Jinsi gani jua husaidia kuua vijidudu kwenye kitambaa?"],
      glossary: [
        { term: "Kuchemsha", def: "Kuzamisha vitu kwenye maji yaliyochomwa hadi 100°C ili kuua vijidudu na viumbe vya magonjwa." },
        { term: "Kutia chumvi", def: "Kuloweka vitambaa kwenye uyeyusho wenye chumvi nyingi ili kuondoa unyevu na kuua viumbe vidogo." },
        { term: "Kupiga pasi", def: "Kutumia pasi ya moto kwenye kitambaa kuua vijidudu vya juu kwa joto la moja kwa moja." },
        { term: "Kimelea cha ugonjwa", def: "Kiumbe kidogo kama bakteria au virusi kinachosababisha ugonjwa." },
        { term: "Mionzi ya urujuani", def: "Mionzi ya jua isiyoonekana (UV) inayoharibu DNA ya bakteria kwenye nyuso." },
        { term: "Kuungua kwa mvuke", def: "Kuungua kunakosababishwa na kioevu cha moto sana au mvuke." },
        { term: "Ugonjwa wa kuambukizana", def: "Ugonjwa unaoweza kuenea kutoka mtu hadi mtu kwa mawasiliano ya moja kwa moja au yasiyokuwa ya moja kwa moja." },
      ],
      links: [{ label: "Mwongozo wa Usafi wa CDC", url: "https://www.cdc.gov/infectioncontrol/guidelines" },{ label: "Kuzuia Maambukizo ya WHO", url: "https://www.who.int/infection-prevention" }],
      quiz: [
        { q: "Njia gani inatumia joto la juu la maji kuua vijidudu kwenye vitambaa vinavyofaa?", o: ["Kuchemsha","Matandazo","Uingizaji","Kubana nyasi"] },
        { q: "Njia gani inatumia mionzi ya UV nje ya nyumba?", o: ["Jua","Kutia chumvi","Kupiga vumbi","Kutengeneza mboji"] },
        { q: "Kwa nini maelekezo ya lebo ya dawa ya kuua vijidudu lazima yasomwe kwa makini?", o: ["Kufuata maelekezo salama na ya ufanisi","Kubadilisha rangi ya kitambaa","Kufanya maji yawe baridi","Kuepuka kusuuza wakati wote"] },
      ],
    },
    grafting: {
      strand: "Mbinu za Uzalishaji",
      title: "Uingizaji wa Mimea",
      summary: "Unganisha chipukizi na shina la msingi kutoka kwa mimea inayohusiana kwa karibu ili kuboresha matunda, maua, kurekebisha, au kufufua mimea.",
      goals: ["Tambua chipukizi, shina la msingi, na kiungo cha uingizaji.","Fanya uingizaji salama wa kata ya V na funika kiungo.","Tunza mche uliounganishwa hadi kiungo kipone."],
      ideas: ["Chipukizi ni sehemu ya juu ya mmea inayotakiwa; shina la msingi ni mche wa chini.","Kata laini inayofanana, kufunga kwa nguvu, na kutiia uimarishaji vinalinda kiungo cha uingizaji.","Mwagilia kwa uangalifu, linda mmea, ondoa machipuo chini ya kiungo, na ondoa mkanda baada ya kupona."],
      activities: ["Utafutaji wa mmea","Vitendo vya uingizaji wa mwongozo","Utunzaji wa mche","Kesi ya utatuzi wa migogoro"],
      journal: "Eleza jinsi unavyorekebisha mche wa mwembe ulioharibiwa kwa uingizaji. Jumuisha tahadhari za usalama kwa zana kali.",
      prompts: ["Ni miti gani ya matunda karibu na nyumba yako au shuleni inayoweza kufaidika na uingizaji?","Kwa nini ni muhimu kufanya kata laini inayofanana wakati wa uingizaji?","Ni nini kingetokea ikiwa kiungo cha uingizaji hakifunikwa au hakifungwi kwa nguvu?"],
      glossary: [
        { term: "Chipukizi", def: "Sehemu ya juu ya mmea uliounganishwa, inayochukuliwa kutoka kwa mmea wenye sifa zinazotakiwa." },
        { term: "Shina la msingi", def: "Sehemu ya chini ya mmea uliounganishwa inayotoa mfumo wa mizizi na msaada." },
        { term: "Kiungo cha uingizaji", def: "Sehemu ambapo chipukizi na shina la msingi vinaunganishwa pamoja na kuungana." },
        { term: "Uingizaji wa kata ya V", def: "Njia ya uingizaji ambapo kata ya umbo la V inafanywa katika shina la msingi ili kuweka chipukizi chenye umbo la kabari." },
        { term: "Mkanda wa uingizaji", def: "Mkanda wa kupinda unaotumika kufunga na kulinda kiungo cha uingizaji wakati wa kupona." },
        { term: "Kalasi", def: "Tishu mpya inayokua juu ya jeraha au kiungo cha uingizaji ili kuiziba na kuiponya." },
        { term: "Uenezaji kwa mimea", def: "Kuzaliana mimea kwa kutumia sehemu zisizo za mbegu kama vipande, machipuo, au uingizaji." },
      ],
      links: [{ label: "Mwongozo wa Uingizaji wa Bustani ya KARI", url: "https://www.kari.org/horticulture" },{ label: "Mwongozo wa FAO wa Uenezaji wa Mimea", url: "https://www.fao.org/plant-production-protection" }],
      quiz: [
        { q: "Sehemu ya juu ya mmea uliounganishwa inaitwa nini?", o: ["Chipukizi","Shina la msingi","Tray","Ghala"] },
        { q: "Kwa nini kiungo cha uingizaji kinafunikwa?", o: ["Kuzuia kuingia kwa maji na kuoza","Kukifanya kiwe huru","Kusimamisha ukuaji wote","Kuvutia wadudu"] },
        { q: "Ni mazoea gani ya utunzaji yanayosaidia tawi linalotakiwa peke yake kukua?", o: ["Kuondoa machipuo chini ya kiungo cha uingizaji","Kunyunyiza maji kwenye kiungo","Kuacha mkanda milele","Kuvunja chipukizi"] },
      ],
    },
    sunDryer: {
      strand: "Mbinu za Uzalishaji",
      title: "Kiyoyozi cha Jua Kilichotengenezwa Nyumbani",
      summary: "Jenga na tumia kiyoyozi chenye kifuniko cha uwazi na trays ili kuhifadhi mboga za majani kwa njia ya kukausha kwa jua iliyodhibitiwa.",
      goals: ["Tambua fremu, tray, kifuniko cha uwazi, na nafasi inayofaa.","Jenga kiyoyozi cha jua kwa kutumia vifaa vinavyopatikana eneo.","Kausha mboga kwa usafi katika safu moja na uzihifadhi kwa usalama."],
      ideas: ["Kifuniko cha uwazi huruhusu jua kuingia na kunasa joto kama chafu ndogo.","Trays za waya hushikilia mboga na kuruhusu mzunguko wa hewa.","Mboga safi, usambazaji sawa, kupinda, na kuhifadhi kwa ukaushaji husaidia kudumisha ubora."],
      activities: ["Mchoro wa kiyoyozi cha jua","Vitendo vya ujenzi","Jaribio la joto","Mradi wa usalama wa chakula nyumbani"],
      journal: "Chora kiyoyozi cha jua unachoweza kujenga eneo lako. Orodhesha fremu, tray, kifuniko, hatua za kusafisha, na jinsi utakavyokijaribu.",
      prompts: ["Ni vifaa gani vinavyopatikana eneo lako unavyoweza kutumia kujenga fremu ya kiyoyozi cha jua?","Kwa nini ni muhimu kupinda mboga wakati wa mchakato wa kukausha?","Ungeujuaje ikiwa mboga zimekauka kabisa kabla ya kuzihifadhi?"],
      glossary: [
        { term: "Kiyoyozi cha jua", def: "Kifaa kinachotumia nishati ya jua na joto lililonaswa kukaushia chakula kwa uhifadhi." },
        { term: "Kifuniko cha uwazi", def: "Nyenzo ya uwazi (kioo au plastiki) inayoruhusu jua kuingia huku ikinasa joto ndani ya kiyoyozi." },
        { term: "Tray ya waya", def: "Tray iliyotengenezwa kwa wavu wa chuma inayoshikilia chakula na kuruhusu hewa kuzunguka." },
        { term: "Ukaushaji", def: "Kuondoa maji kutoka kwa chakula ili kuzuia ukuaji wa viumbe vidogo na kuongeza muda wa matumizi." },
        { term: "Ukaushaji wa jua", def: "Kutumia nishati ya jua kuondoa unyevu kutoka kwa chakula au mazao." },
        { term: "Athari ya chafu", def: "Kunaswa kwa joto ndani ya nafasi iliyofungwa, sawa na jinsi kiyoyozi cha jua kinavyofanya kazi." },
        { term: "Maudhui ya unyevu", def: "Kiasi cha maji kilichobaki kwenye chakula kilichokaushwa, ambacho lazima kiwe kidogo ya kutosha kuzuia kuharibika." },
      ],
      links: [{ label: "Rasilimali za Kukausha Chakula za SOLARAID", url: "https://www.solaraid.org/resources" },{ label: "Ukaushaji wa Chakula kwa Jua wa FAO", url: "https://www.fao.org/post-harvest/solar-drying" }],
      quiz: [
        { q: "Kwa nini kiyoyozi cha jua kilichotengenezwa nyumbani kinahitaji kifuniko cha uwazi?", o: ["Kuruhusu jua kuingia na kunasa joto","Kuzuia mwanga wote","Kuweka mboga zikiwa na unyevu","Kualika wadudu"] },
        { q: "Kwa nini mboga za majani zinapaswa kupangwa katika safu moja?", o: ["Kuruhusu mzunguko wa hewa na kukausha sawasawa","Kuifanya kukausha kuwe polepole zaidi","Kuficha uchafu","Kuzuia joto"] },
        { q: "Usiku wa baridi sana, kiyoyozi cha jua kifanyike nini?", o: ["Kiingizwe ndani ya chumba","Kiaachwe mvuani","Ongeza maji zaidi","Fungua mlango usiku wote"] },
      ],
    },
  },
};

function ml(module, field) {
  if ((progress?.language || "en") === "en") return module[field];
  return MODULE_TRANSLATIONS.sw?.[module.id]?.[field] ?? module[field];
}
function mlq(module, qIdx) {
  const item = module.quiz[qIdx];
  if ((progress?.language || "en") === "en") return { q: item.q, o: item.o };
  const sw = MODULE_TRANSLATIONS.sw?.[module.id]?.quiz?.[qIdx];
  return { q: sw?.q ?? item.q, o: sw?.o ?? item.o };
}

/* ── Achievement Badges ──────────────────────────────────────── */
const BADGES = [
  { id: "first_steps", icon: "🌱", title: "First Steps",  desc: "Complete all 3 tasks in any module" },
  { id: "on_fire",     icon: "🔥", title: "On Fire",      desc: "Reach a 3-day study streak" },
  { id: "scholar",     icon: "📚", title: "Scholar",      desc: "Mark 5 modules as Learned" },
  { id: "game_master", icon: "🎮", title: "Game Master",  desc: "Complete 5 games" },
  { id: "quiz_ace",    icon: "🏆", title: "Quiz Ace",     desc: "Score 100% on any quiz" },
  { id: "all_rounder", icon: "🌟", title: "All-Rounder",  desc: "Fully complete all 10 modules" },
  { id: "note_keeper", icon: "✏️",  title: "Note Keeper",  desc: "Write journal notes for 5 modules" },
  { id: "bilingual",   icon: "🌍", title: "Bilingual",    desc: "Use the Swahili language mode" },
];

function checkBadges() {
  if (!progress.badges) progress.badges = [];
  const newlyEarned = [];
  BADGES.forEach((badge) => {
    if (progress.badges.includes(badge.id)) return;
    let earned = false;
    switch (badge.id) {
      case "first_steps": earned = MODULES.some((m) => moduleCompletion(m) === 3); break;
      case "on_fire":     earned = progress.streak.count >= 3; break;
      case "scholar":     earned = Object.values(progress.learned).filter(Boolean).length >= 5; break;
      case "game_master": earned = Object.values(progress.games).filter(Boolean).length >= 5; break;
      case "quiz_ace":    earned = Object.values(progress.quizScores).some((s) => s >= 100); break;
      case "all_rounder": earned = MODULES.every((m) => moduleCompletion(m) === 3); break;
      case "note_keeper": earned = Object.values(progress.notes).filter((n) => n.trim().length > 10).length >= 5; break;
      case "bilingual":   earned = progress.language === "sw"; break;
    }
    if (earned) { progress.badges.push(badge.id); newlyEarned.push(badge); }
  });
  if (newlyEarned.length) {
    saveProgress();
    newlyEarned.forEach((b) => {
      showToast(`${b.icon} Badge unlocked: ${b.title}!`, "success");
      confettiBurst(window.innerWidth / 2, window.innerHeight / 3, 25);
    });
    renderBadgesInline();
  }
}

function renderBadgesInline() {
  const el = document.getElementById("badgesGrid");
  if (!el) return;
  const earned = progress.badges || [];
  el.innerHTML = BADGES.map((b) => `
    <div class="badge-pill ${earned.includes(b.id) ? "badge-earned" : "badge-locked"}" title="${escapeHTML(b.desc)}">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-title">${escapeHTML(b.title)}</span>
    </div>
  `).join("");
}

/* ── Performance Analytics ───────────────────────────────────── */
function renderAnalyticsCard() {
  const scores = MODULES.map((m) => progress.quizScores[m.id] || 0);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const maxScore = Math.max(...scores);
  const best = maxScore > 0 ? MODULES[scores.indexOf(maxScore)] : null;
  const attempted = MODULES.filter((m) => (progress.quizScores[m.id] || 0) > 0);
  const worst = attempted.sort((a, b) => (progress.quizScores[a.id] || 0) - (progress.quizScores[b.id] || 0))[0];
  return `
    <article class="tool-card analytics-card" style="animation-delay:0.22s">
      <p class="eyebrow">📊 Analytics</p>
      <h3>Quiz performance</h3>
      <div class="analytics-bars">
        ${MODULES.map((m) => {
          const score = progress.quizScores[m.id] || 0;
          const label = ml(m, "title").split(":")[0].trim();
          return `<div class="analytics-row">
            <span class="analytics-label">${escapeHTML(label)}</span>
            <div class="analytics-track">
              <div class="analytics-fill" style="width:${score}%;background:${m.color}"></div>
            </div>
            <span class="analytics-pct ${score >= 70 ? "pct-pass" : score > 0 ? "pct-partial" : ""}">${score > 0 ? score + "%" : "—"}</span>
          </div>`;
        }).join("")}
      </div>
      <div class="analytics-summary">
        <span class="pill">Avg: ${avg}%</span>
        ${best ? `<span class="pill pill-done">Best: ${escapeHTML(ml(best, "title").split(":")[0])}</span>` : ""}
        ${worst ? `<span class="pill" style="border-color:rgba(239,68,68,0.35);color:#f87171">Needs work: ${escapeHTML(ml(worst, "title").split(":")[0])}</span>` : ""}
      </div>
      ${smartStudyRecommendation()}
    </article>
  `;
}

/* ── AI Advisor Panel ────────────────────────────────────────── */
function showAIPanel() {
  const module = currentModule();
  const misses = progress.quizMisses?.[module.id] || {};
  const hardQuestions = module.quiz
    .map((q, i) => ({ idx: i, q: q.q, count: misses[i] || 0 }))
    .filter((q) => q.count > 0)
    .sort((a, b) => b.count - a.count);

  const overall = coursePercent();
  const attempted = MODULES.filter((m) => (progress.quizScores[m.id] || 0) > 0);
  const avgScore = attempted.length
    ? Math.round(attempted.reduce((s, m) => s + progress.quizScores[m.id], 0) / attempted.length)
    : 0;

  const modal = document.createElement("div");
  modal.className = "share-modal-overlay";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="share-modal" style="width:min(540px,95vw);max-height:88vh;overflow-y:auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:1.8rem">🤖</span>
        <div>
          <h3 style="margin:0;font-size:1.1rem">AI Study Advisor</h3>
          <p style="margin:0;font-size:0.76rem;color:var(--muted)">Works fully offline — no internet needed</p>
        </div>
        <span class="pill" style="margin-left:auto;background:rgba(22,163,74,0.15);color:var(--leaf);font-size:0.72rem">Offline ✓</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:14px 0">
        <div style="padding:10px;border-radius:10px;background:rgba(30,122,69,0.08);text-align:center">
          <div style="font-size:1.4rem;font-weight:900">${overall}%</div>
          <div style="font-size:0.72rem;color:var(--muted)">Course done</div>
        </div>
        <div style="padding:10px;border-radius:10px;background:rgba(30,122,69,0.08);text-align:center">
          <div style="font-size:1.4rem;font-weight:900">${avgScore > 0 ? avgScore + "%" : "—"}</div>
          <div style="font-size:0.72rem;color:var(--muted)">Avg quiz score</div>
        </div>
        <div style="padding:10px;border-radius:10px;background:rgba(30,122,69,0.08);text-align:center">
          <div style="font-size:1.4rem;font-weight:900">${progress.streak.count}</div>
          <div style="font-size:0.72rem;color:var(--muted)">Day streak 🔥</div>
        </div>
      </div>

      <p class="eyebrow" style="margin-bottom:6px">📚 Recommended next step</p>
      ${smartStudyRecommendation()}

      <p class="eyebrow" style="margin:14px 0 6px">🎯 Adaptive quiz — ${escapeHTML(ml(module, "title").split(":")[0])}</p>
      ${hardQuestions.length ? `
        <ul style="list-style:none;padding:0;margin:0 0 8px">
          ${hardQuestions.map((hq) => `
            <li style="padding:7px 10px;margin-bottom:5px;border-radius:8px;background:rgba(239,68,68,0.07);border-left:3px solid rgba(239,68,68,0.45);font-size:0.82rem">
              <strong>Missed ${hq.count}×</strong> — ${escapeHTML(hq.q)}
            </li>`).join("")}
        </ul>
        <p style="font-size:0.78rem;color:var(--muted)">These questions appear first on your next quiz attempt.</p>
      ` : `<p style="font-size:0.84rem;color:var(--muted);margin-bottom:8px">No missed questions yet for this module. Take the quiz to unlock personalised ordering.</p>`}

      <p class="eyebrow" style="margin:14px 0 8px">🔊 Read aloud</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <button class="secondary-button" id="aiSpeakSummary">Module summary</button>
        ${(ml(module, "goals") || []).slice(0, 2).map((g, i) => `<button class="secondary-button ai-speak-btn" data-speak="${escapeHTML(g)}" style="font-size:0.78rem">Goal ${i + 1}</button>`).join("")}
        ${(ml(module, "ideas") || []).slice(0, 2).map((idea, i) => `<button class="secondary-button ai-speak-btn" data-speak="${escapeHTML(idea)}" style="font-size:0.78rem">Idea ${i + 1}</button>`).join("")}
      </div>

      <button class="primary-button" id="closeAIPanel" style="width:100%">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#closeAIPanel")?.addEventListener("click", () => modal.remove());
  modal.querySelector("#aiSpeakSummary")?.addEventListener("click", () => speakText(ml(module, "summary")));
  modal.querySelectorAll(".ai-speak-btn").forEach((btn) => btn.addEventListener("click", () => speakText(btn.dataset.speak)));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

/* ── Smart Study Recommendation ──────────────────────────────── */
function smartStudyRecommendation() {
  const incomplete = MODULES.filter((m) => moduleCompletion(m) < 3);
  if (!incomplete.length) {
    return `<p style="margin-top:12px;padding:9px 12px;border-radius:8px;background:rgba(22,163,74,0.12);border:1px solid rgba(22,163,74,0.25);font-size:0.84rem;color:var(--leaf)">🎉 Outstanding — every module is complete. Download your certificate!</p>`;
  }
  const attempted = MODULES.filter((m) => (progress.quizScores[m.id] || 0) > 0);
  const failing = attempted
    .filter((m) => (progress.quizScores[m.id] || 0) < 70)
    .sort((a, b) => (progress.quizScores[a.id] || 0) - (progress.quizScores[b.id] || 0));
  const unstarted = MODULES.find((m) => !progress.learned[m.id] && !progress.games[m.id] && !(progress.quizScores[m.id] || 0));
  const learnDoneNoGame = MODULES.find((m) => progress.learned[m.id] && !progress.games[m.id]);
  const gameDoneNoQuiz = MODULES.find((m) => progress.games[m.id] && (progress.quizScores[m.id] || 0) < 70);

  let msg = "";
  if (failing.length) {
    const m = failing[0];
    msg = `Retake the <strong>${escapeHTML(ml(m, "title").split(":")[0])}</strong> quiz — score is ${progress.quizScores[m.id] || 0}%, needs 70%.`;
  } else if (gameDoneNoQuiz) {
    msg = `Open the Quiz tab for <strong>${escapeHTML(ml(gameDoneNoQuiz, "title").split(":")[0])}</strong> — you finished the game, now take the quiz.`;
  } else if (learnDoneNoGame) {
    msg = `Try the Simulate tab for <strong>${escapeHTML(ml(learnDoneNoGame, "title").split(":")[0])}</strong> — you read it, now play the game.`;
  } else if (unstarted) {
    msg = `Start <strong>${escapeHTML(ml(unstarted, "title").split(":")[0])}</strong> — open the Learn tab to begin.`;
  } else {
    msg = `Keep going — ${incomplete.length} module${incomplete.length > 1 ? "s" : ""} left to fully complete.`;
  }
  return `<p style="margin-top:12px;padding:9px 12px;border-radius:8px;background:rgba(30,122,69,0.07);border:1px solid rgba(30,122,69,0.18);font-size:0.84rem;line-height:1.55">💡 <strong>Recommended next:</strong> ${msg}</p>`;
}

/* ── Report Card ─────────────────────────────────────────────── */
function generateReportCard() {
  const canvas = document.createElement("canvas");
  canvas.width = 900; canvas.height = 1260;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f7faf7";
  ctx.fillRect(0, 0, 900, 1260);
  ctx.fillStyle = "#0d3320";
  ctx.fillRect(0, 0, 900, 110);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Agriculture & Nutrition Grade 9 — MTP Digital", 450, 44);
  ctx.font = "19px Arial";
  ctx.fillText("Student Progress Report", 450, 80);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "13px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`${new Date().toLocaleDateString("en-KE", { dateStyle: "long" })}   ·   Streak: ${progress.streak.count} day${progress.streak.count !== 1 ? "s" : ""}`, 875, 132);
  let y = 148;
  MODULES.forEach((m) => {
    const score = progress.quizScores[m.id] || 0;
    const comp = moduleCompletion(m);
    ctx.fillStyle = "#eaf3ea";
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(24, y, 852, 74, 7); else ctx.rect(24, y, 852, 74); ctx.fill();
    ctx.fillStyle = m.color;
    ctx.fillRect(24, y, 6, 74);
    ctx.fillStyle = "#111";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(m.title, 44, y + 25);
    ctx.font = "13px Arial";
    ctx.fillStyle = progress.learned[m.id] ? "#16a34a" : "#bbb";
    ctx.fillText("✓ Learn", 44, y + 52);
    ctx.fillStyle = progress.games[m.id] ? "#16a34a" : "#bbb";
    ctx.fillText("✓ Game", 120, y + 52);
    ctx.fillStyle = score >= 70 ? "#16a34a" : score > 0 ? "#d97706" : "#bbb";
    ctx.fillText(`Quiz: ${score > 0 ? score + "%" : "—"}`, 196, y + 52);
    ctx.fillStyle = comp === 3 ? "#16a34a" : comp > 0 ? "#d97706" : "#999";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`${comp}/3`, 868, y + 44);
    y += 82;
  });
  y += 8;
  ctx.fillStyle = "#0d3320";
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(24, y, 852, 60, 8); else ctx.rect(24, y, 852, 60); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 19px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Overall: ${coursePercent()}%`, 44, y + 37);
  ctx.textAlign = "right";
  ctx.fillText(`Badges: ${(progress.badges || []).length}/${BADGES.length}`, 868, y + 37);
  ctx.fillStyle = "#aaa";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Mountain Publishers — MTP Digital", 450, y + 90);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "mtp-report-card.png";
  link.click();
  showToast("📊 Report card downloaded!", "success");
}

/* ── Matching Pairs Game ─────────────────────────────────────── */
function renderMatchingPairs(mount, module) {
  const glossary = ml(module, "glossary") || [];
  if (glossary.length < 3) {
    mount.innerHTML = `<div class="empty-state">Not enough glossary terms for this game. Try the main game instead.</div>`;
    return;
  }
  const pairs = shuffle(glossary).slice(0, Math.min(6, glossary.length));
  const cards = shuffle([
    ...pairs.map((g, i) => ({ id: i, text: g.term, kind: "term" })),
    ...pairs.map((g, i) => ({ id: i, text: g.def,  kind: "def"  })),
  ]);
  let flipped = [];
  let matched = new Set();
  let moves = 0;
  let locked = false;

  const draw = () => {
    const grid = document.getElementById("matchGrid");
    if (!grid) return;
    grid.innerHTML = cards.map((card, idx) => {
      const isFlipped = flipped.includes(idx);
      const isMatched = matched.has(String(card.id));
      const small = card.text.length > 45;
      return `<button class="match-card ${isMatched ? "match-matched" : isFlipped ? "match-flipped" : ""}"
        data-match-idx="${idx}">
        <div class="match-inner">
          <div class="match-face match-back-face">?</div>
          <div class="match-face match-front-face" style="font-size:${small ? "0.65rem" : "0.8rem"}">${escapeHTML(card.text)}</div>
        </div>
      </button>`;
    }).join("");
    const movesEl = document.getElementById("matchMoves");
    const foundEl = document.getElementById("matchFound");
    if (movesEl) movesEl.textContent = moves;
    if (foundEl) foundEl.textContent = `${matched.size}/${pairs.length}`;
    if (matched.size === pairs.length) {
      completeGame(module.id);
      confettiBurst(
        mount.getBoundingClientRect().left + mount.offsetWidth / 2,
        mount.getBoundingClientRect().top + 120, 35
      );
    }
  };

  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card">
        <p class="eyebrow">🃏 Term Match</p>
        <h3>${escapeHTML(ml(module, "title"))}</h3>
        <p style="font-size:0.82rem;color:var(--muted);margin-bottom:14px">Flip cards to match each term with its definition.</p>
        <div class="match-grid" id="matchGrid"></div>
        <p style="margin-top:10px;font-size:0.82rem;color:var(--muted)">
          Moves: <strong id="matchMoves">0</strong> &nbsp;·&nbsp; Matched: <strong id="matchFound">0/${pairs.length}</strong>
        </p>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">How to play</p>
        <h3>Memory matching</h3>
        <ul class="feedback-list">
          <li>Click any card to flip it</li>
          <li>Find its matching pair</li>
          <li>Match all ${pairs.length} pairs to complete</li>
        </ul>
        <button class="secondary-button" id="matchReset" style="margin-top:14px">🔀 New game</button>
      </article>
    </div>
  `;
  draw();

  mount.addEventListener("click", (e) => {
    if (e.target.id === "matchReset") { renderMatchingPairs(mount, module); return; }
    if (locked) return;
    const btn = e.target.closest("[data-match-idx]");
    if (!btn) return;
    const idx = Number(btn.dataset.matchIdx);
    const card = cards[idx];
    if (flipped.includes(idx) || matched.has(String(card.id))) return;
    if (flipped.length >= 2) return;
    flipped = [...flipped, idx];
    draw();
    if (flipped.length === 2) {
      locked = true;
      const [i1, i2] = flipped;
      const c1 = cards[i1], c2 = cards[i2];
      setTimeout(() => {
        if (c1.id === c2.id && c1.kind !== c2.kind) {
          matched.add(String(c1.id));
          showToast(`✅ ${c1.kind === "term" ? c1.text : c2.text}`, "success");
        }
        flipped = [];
        locked = false;
        draw();
      }, 950);
    }
  });
}

/* ── Notifications ───────────────────────────────────────────── */
function initNotifications() {
  const btn = document.getElementById("notifToggleBtn");
  if (!("Notification" in window)) { if (btn) btn.style.display = "none"; return; }
  const updateBtn = () => {
    if (!btn) return;
    if (Notification.permission === "granted") {
      btn.textContent = "🔔 Reminders on";
      btn.classList.add("active");
    } else if (Notification.permission === "denied") {
      btn.textContent = "🔕 Blocked";
      btn.disabled = true;
    } else {
      btn.textContent = "🔔 Enable reminders";
      btn.classList.remove("active");
    }
  };
  updateBtn();
  if (btn) btn.addEventListener("click", async () => {
    if (Notification.permission === "default") await Notification.requestPermission();
    updateBtn();
    if (Notification.permission === "granted") scheduleReminder();
  });
  if (Notification.permission === "granted") scheduleReminder();
}

function scheduleReminder() {
  const today = todayISO();
  if (progress.streak.lastDate === today) return;
  setTimeout(() => {
    if (todayISO() !== progress.streak.lastDate && Notification.permission === "granted") {
      new Notification("📚 MTP Digital — Time to study!", {
        body: `Keep your ${progress.streak.count}-day streak going! Open the app to continue.`,
        icon: "./icons/icon.svg",
      });
    }
  }, 4 * 60 * 60 * 1000);
}

/* ─────────────────────────────────────────────────────────────────
   Role dashboards — Teacher / Parent / Student
   ───────────────────────────────────────────────────────────────── */
function showTeacherDashboard() {
  const role = currentProfile?.role || "student";
  if (role === "teacher") { _showTeacherView(); return; }
  if (role === "parent")  { _showParentView();  return; }
  _showStudentView();
}

/* ── Teacher Dashboard ─────────────────────────────────────────── */
function _showTeacherView(activeClass) {
  const teacherClasses = currentProfile.classCodes || [];
  // Determine which class to show; null = "All students"
  const showingClass = activeClass !== undefined ? activeClass
    : teacherClasses.length ? teacherClasses[0] : null;

  const students = showingClass
    ? getStudentsInClass(showingClass)
    : getTeacherStudents(currentProfile);
  const allProgress = students.map(s => ({ profile: s, p: loadProgress(s.id) }));

  const makeStudentCard = ({ profile, p }) => {
    const scores   = Object.values(p.quizScores || {}).filter(Boolean);
    const avg      = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    const learned  = Object.keys(p.learned || {}).length;
    const games    = Object.keys(p.games || {}).length;
    const total    = MODULES.length;
    const isWatching = activeLearnerProfileId() === profile.id;
    const atRisk   = scores.length > 1 && avg < 40;
    const dots     = MODULES.map(m => {
      const s = p.quizScores?.[m.id] || 0;
      const g = p.games?.[m.id]; const l = p.learned?.[m.id];
      const cls = (s >= 70 || (l && g)) ? "done" : (s > 0 || g || l) ? "part" : "none";
      return `<div class="dash-module-dot ${cls}" title="${escapeHTML(ml(m,"title").split(":")[0])} — ${s?s+"%":cls}"></div>`;
    }).join("");
    const classBadge = profile.classCode
      ? `<span class="class-badge">${escapeHTML(profile.classCode)}</span>` : "";
    return `
      <div class="dash-student-card ${atRisk?"at-risk":""} ${isWatching?"watching":""}">
        ${atRisk ? `<span class="dash-student-risk">⚠ Needs help</span>` : ""}
        <div class="dash-student-top">
          <span class="account-avatar account-avatar-student">${escapeHTML(profile.name.charAt(0).toUpperCase())}</span>
          <div>
            <h4>${escapeHTML(profile.name)} ${classBadge}</h4>
            <small>${learned}/${total} learned · ${games}/${total} games · avg ${avg||0}%</small>
          </div>
        </div>
        <div class="dash-bar-row">
          <div class="dash-bar-label">Quiz average <span>${avg||0}%</span></div>
          <div class="dash-bar-track"><div class="dash-bar-fill ${avg<40?"red":avg<70?"amber":""}" style="width:${avg}%"></div></div>
        </div>
        <div class="dash-module-grid">${dots}</div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="secondary-button" style="font-size:0.75rem;padding:5px 10px" data-view-learner="${profile.id}">👁 View progress</button>
        </div>
      </div>
    `;
  };

  const studentCards = allProgress.map(makeStudentCard).join("");
  const allScores    = allProgress.flatMap(({p}) => Object.values(p.quizScores||{}).filter(Boolean));
  const classAvg     = allScores.length ? Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length) : 0;
  const atRiskCount  = allProgress.filter(({p}) => {
    const sc = Object.values(p.quizScores||{}).filter(Boolean);
    return sc.length > 1 && sc.reduce((a,b)=>a+b,0)/sc.length < 40;
  }).length;
  const topModule = (() => {
    const counts = {}; MODULES.forEach(m => { counts[m.id] = allProgress.filter(({p}) => p.quizScores?.[m.id] >= 70).length; });
    const best = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    const mod = best ? MODULES.find(m=>m.id===best[0]) : null;
    return mod ? ml(mod,"title").split(":")[0] : "—";
  })();

  // Class switcher tabs
  const classTabs = teacherClasses.length > 0 ? `
    <div class="dash-tab-row" id="classTabRow">
      <button class="dash-tab ${!showingClass?"active":""}" data-class-tab="">All students</button>
      ${teacherClasses.map(c=>`<button class="dash-tab ${showingClass===c?"active":""}" data-class-tab="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join("")}
    </div>
  ` : "";

  const emptyMsg = teacherClasses.length
    ? `No students in ${showingClass ? `class ${showingClass}` : "your classes"} yet. Students must set their class code to <strong>${teacherClasses[0]}</strong> when creating their account.`
    : `No student accounts on this device. To monitor specific classes, add your class codes in <em>⚙ My account</em>.`;

  const modal = document.createElement("div");
  modal.className = "share-modal-overlay";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="share-modal account-dashboard-modal role-dashboard">
      <div class="account-modal-head">
        <div><p class="eyebrow">Teacher</p><h3>📋 Teacher Dashboard</h3></div>
        <button class="icon-button" id="closeTeacherModal" aria-label="Close">×</button>
      </div>
      <div class="role-dash-hero role-dash-hero-teacher">
        <div class="role-dash-hero-avatar">📋</div>
        <div style="flex:1">
          <h3>${escapeHTML(currentProfile.name)}</h3>
          <p>${teacherClasses.length ? `Classes: ${teacherClasses.join(", ")}` : "No classes set"} · ${students.length} student${students.length!==1?"s":""} · avg ${classAvg}%</p>
        </div>
        <button class="secondary-button" id="teacherSettingsBtn" style="font-size:0.75rem;padding:5px 10px;white-space:nowrap">⚙ Settings</button>
      </div>
      <div class="dash-stats-row">
        <div class="dash-stat-card"><div class="dash-stat-num">${students.length}</div><div class="dash-stat-label">Students</div></div>
        <div class="dash-stat-card"><div class="dash-stat-num blue">${classAvg}%</div><div class="dash-stat-label">Class Avg</div></div>
        <div class="dash-stat-card"><div class="dash-stat-num amber">${atRiskCount}</div><div class="dash-stat-label">Need Help</div></div>
        <div class="dash-stat-card"><div class="dash-stat-num" style="font-size:0.9rem;padding-top:6px">${escapeHTML(topModule)}</div><div class="dash-stat-label">Top Module</div></div>
      </div>
      ${classTabs}
      <p class="dash-section-title">Students — click "View progress" to observe</p>
      <div class="dash-student-grid">
        ${studentCards || `<p style="color:var(--muted);font-size:0.85rem">${emptyMsg}</p>`}
      </div>
      <p class="dash-section-title">Compare shared progress codes</p>
      <div class="dash-compare-area">
        <textarea id="teacherCodesInput" rows="4" placeholder="Paste student export codes here, one per line…"></textarea>
        <button class="primary-button" id="teacherAnalyseBtn">Analyse codes</button>
        <div id="teacherResults" style="margin-top:14px"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#closeTeacherModal")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  modal.querySelector("#teacherSettingsBtn")?.addEventListener("click", () => { modal.remove(); showAccountSettings(); });
  modal.querySelectorAll("[data-view-learner]").forEach(btn => {
    btn.addEventListener("click", () => { selectLearnerForViewer(btn.dataset.viewLearner); modal.remove(); });
  });
  modal.querySelectorAll("[data-class-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      modal.remove();
      _showTeacherView(btn.dataset.classTab || null);
    });
  });
  modal.querySelector("#teacherAnalyseBtn")?.addEventListener("click", () => {
    const codeLines = modal.querySelector("#teacherCodesInput").value.trim().split("\n").filter(Boolean).slice(0,6);
    if (!codeLines.length) return;
    const results = codeLines.map((code, i) => {
      try { const d = JSON.parse(atob(code.trim())); return { label: d.name||`Student ${i+1}`, scores: d.scores||{}, learned: d.learned||{}, games: d.games||{} }; }
      catch { return null; }
    }).filter(Boolean);
    if (!results.length) { showToast("No valid codes found.", "warn"); return; }
    const host = modal.querySelector("#teacherResults");
    const rows = MODULES.map(m => {
      const cells = results.map(r => { const s=r.scores[m.id]||0; const color=s>=70?"#4ade80":s>0?"#fbbf24":"rgba(255,255,255,0.25)"; return `<td style="text-align:center;padding:6px 10px;color:${color}">${s>0?s+"%":"-"}</td>`; }).join("");
      return `<tr style="border-top:1px solid rgba(255,255,255,0.07)"><td style="padding:6px 10px;font-weight:600">${escapeHTML(ml(m,"title").split(":")[0])}</td>${cells}</tr>`;
    }).join("");
    const avgCells = results.map(r => { const vals=Object.values(r.scores).filter(Boolean); const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0; return `<td style="text-align:center;padding:6px 10px">${avg>0?avg+"%":"-"}</td>`; }).join("");
    host.innerHTML = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.82rem">
      <thead><tr style="background:rgba(255,255,255,0.07)"><th style="text-align:left;padding:8px 10px">Module</th>${results.map(r=>`<th style="padding:8px 10px">${escapeHTML(r.label)}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="background:rgba(255,255,255,0.06);font-weight:700"><td style="padding:6px 10px">Average</td>${avgCells}</tr></tfoot>
    </table></div>`;
  });
}

/* ── Parent View ───────────────────────────────────────────────── */
function _showParentView() {
  const linkedStudents = getLinkedStudents(currentProfile);
  const learnerProfile = currentLearnerProfile();
  const p         = loadProgress(activeLearnerProfileId());
  const scores    = p.quizScores || {};
  const scoreVals = Object.values(scores).filter(Boolean);
  const avg    = scoreVals.length ? Math.round(scoreVals.reduce((a,b)=>a+b,0)/scoreVals.length) : 0;
  const learned = Object.keys(p.learned||{}).length;
  const games   = Object.keys(p.games||{}).length;
  const total   = MODULES.length;
  const streak  = p.streak?.count || 0;
  const pct     = Math.round(((learned + games) / (total * 2)) * 100);

  const R = 52, circ = 2 * Math.PI * R;
  const dash = circ * (pct / 100);
  const ring = `<svg width="128" height="128" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="${R}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/>
    <circle cx="64" cy="64" r="${R}" fill="none" stroke="url(#prg)" stroke-width="10"
      stroke-dasharray="${dash} ${circ}" stroke-linecap="round" transform="rotate(-90 64 64)"/>
    <defs><linearGradient id="prg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#17c964"/><stop offset="100%" stop-color="#5ec880"/>
    </linearGradient></defs>
    <text x="64" y="60" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">${pct}%</text>
    <text x="64" y="78" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.55)">OVERALL</text>
  </svg>`;

  const moduleRows = MODULES.map(m => {
    const s = scores[m.id] || 0;
    const g = p.games?.[m.id] ? "✅" : "○";
    const l = p.learned?.[m.id] ? "✅" : "○";
    return `
      <div class="dash-bar-row">
        <div class="dash-bar-label">
          ${escapeHTML(ml(m,"title").split(":")[0])}
          <span>Learn ${l} · Game ${g} · Quiz ${s?s+"%":"—"}</span>
        </div>
        <div class="dash-bar-track"><div class="dash-bar-fill ${s<70?"amber":""}" style="width:${s}%"></div></div>
      </div>
    `;
  }).join("");

  const nextMod = MODULES.find(m => !p.learned?.[m.id] || !p.games?.[m.id] || !(p.quizScores?.[m.id] >= 70));
  const recommendation = nextMod
    ? `<div class="dash-recommendation"><strong>📚 Next to revise: ${escapeHTML(ml(nextMod,"title").split(":")[0])}</strong>${escapeHTML(ml(nextMod,"summary")||"Complete the lesson, game, and quiz.")}</div>`
    : `<div class="dash-recommendation"><strong>🎉 All modules completed!</strong> Encourage a full review before exams.</div>`;

  // Child switcher tabs (only linked children)
  const childTabs = linkedStudents.length > 1 ? `
    <div class="dash-tab-row">
      ${linkedStudents.map(s=>`<button class="dash-tab ${s.id===activeLearnerProfileId()?"active":""}" data-child-id="${s.id}">${escapeHTML(s.name)}</button>`).join("")}
    </div>
  ` : "";

  // No child linked yet
  const noChildPanel = !linkedStudents.length ? `
    <div class="dash-recommendation" style="border-left-color:#f59e0b;background:rgba(245,158,11,0.1)">
      <strong>👪 No child linked yet</strong>
      Ask your child for their 6-letter family code, then add it in your account settings.
      <div style="display:flex;gap:8px;margin-top:10px">
        <input id="quickLinkCode" type="text" maxlength="6" placeholder="Child's family code" autocomplete="off"
          style="flex:1;padding:7px 10px;border-radius:8px;border:1px solid var(--line);background:var(--control);color:inherit;text-transform:uppercase;letter-spacing:0.08em">
        <button class="primary-button" id="quickLinkBtn" style="white-space:nowrap">Link child</button>
      </div>
    </div>
  ` : "";

  const modal = document.createElement("div");
  modal.className = "share-modal-overlay";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="share-modal account-dashboard-modal role-dashboard">
      <div class="account-modal-head">
        <div><p class="eyebrow">Parent</p><h3>👪 Parent View</h3></div>
        <button class="icon-button" id="closeTeacherModal" aria-label="Close">×</button>
      </div>
      <div class="role-dash-hero role-dash-hero-parent">
        <div class="role-dash-hero-avatar">👪</div>
        <div style="flex:1">
          <h3>${escapeHTML(currentProfile.name)}</h3>
          <p>${linkedStudents.length ? `${linkedStudents.length} child${linkedStudents.length!==1?"ren":""} linked · Viewing: ${escapeHTML(learnerProfile?.name||"—")}` : "No children linked yet"}</p>
        </div>
        <button class="secondary-button" id="parentSettingsBtn" style="font-size:0.75rem;padding:5px 10px;white-space:nowrap">⚙ Settings</button>
      </div>
      ${noChildPanel}
      ${linkedStudents.length ? `
        ${childTabs}
        <div class="dash-stats-row">
          <div class="dash-stat-card"><div class="dash-stat-num">${learned}/${total}</div><div class="dash-stat-label">Lessons done</div></div>
          <div class="dash-stat-card"><div class="dash-stat-num blue">${games}/${total}</div><div class="dash-stat-label">Games played</div></div>
          <div class="dash-stat-card"><div class="dash-stat-num ${avg<50?"red":avg<70?"amber":""}">${avg||0}%</div><div class="dash-stat-label">Quiz average</div></div>
          <div class="dash-stat-card"><div class="dash-stat-num">${streak}🔥</div><div class="dash-stat-label">Day streak</div></div>
        </div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-bottom:18px">
          <div class="dash-progress-ring-wrap">${ring}
            <div class="dash-progress-ring-label"><span>Course completion</span></div>
          </div>
          <div style="flex:1;min-width:220px">${recommendation}</div>
        </div>
        <p class="dash-section-title">Module-by-module progress</p>
        <div style="padding:4px 0">${moduleRows}</div>
      ` : ""}
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#closeTeacherModal")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  modal.querySelector("#parentSettingsBtn")?.addEventListener("click", () => { modal.remove(); showAccountSettings(); });
  modal.querySelectorAll("[data-child-id]").forEach(btn => {
    btn.addEventListener("click", () => { selectLearnerForViewer(btn.dataset.childId); modal.remove(); setTimeout(_showParentView, 60); });
  });
  modal.querySelector("#quickLinkBtn")?.addEventListener("click", () => {
    const code = modal.querySelector("#quickLinkCode")?.value.trim().toUpperCase();
    if (!code) return;
    const result = linkParentToStudent(currentProfile.id, code);
    if (!result) { showToast("Family code not found. Check the code with your child.", "warn"); return; }
    showToast(`Linked to ${result.name}!`, "success");
    modal.remove(); setTimeout(_showParentView, 60);
  });
}

/* ── Student Self-Dashboard ────────────────────────────────────── */
function _showStudentView() {
  const p   = progress;
  const scores    = p.quizScores || {};
  const scoreVals = Object.values(scores).filter(Boolean);
  const avg    = scoreVals.length ? Math.round(scoreVals.reduce((a,b)=>a+b,0)/scoreVals.length) : 0;
  const learned = Object.keys(p.learned||{}).length;
  const games   = Object.keys(p.games||{}).length;
  const total   = MODULES.length;
  const streak  = p.streak?.count || 0;
  const pct     = Math.round(((learned + games) / (total * 2)) * 100);

  // Ring SVG
  const R = 52, circ = 2 * Math.PI * R;
  const dash = circ * (pct / 100);
  const ring = `<svg width="128" height="128" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="${R}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10"/>
    <circle cx="64" cy="64" r="${R}" fill="none" stroke="url(#srg)" stroke-width="10"
      stroke-dasharray="${dash} ${circ}" stroke-linecap="round" transform="rotate(-90 64 64)"/>
    <defs><linearGradient id="srg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#17c964"/><stop offset="100%" stop-color="#5ec880"/>
    </linearGradient></defs>
    <text x="64" y="60" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">${pct}%</text>
    <text x="64" y="78" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.55)">DONE</text>
  </svg>`;

  const nextMod = MODULES.find(m => !p.learned?.[m.id] || !p.games?.[m.id] || !(p.quizScores?.[m.id] >= 70));
  const recommendation = nextMod
    ? `<div class="dash-recommendation"><strong>🎯 Up next: ${escapeHTML(ml(nextMod,"title").split(":")[0])}</strong>${escapeHTML(ml(nextMod,"summary")||"")}</div>`
    : `<div class="dash-recommendation"><strong>🏆 You've completed everything!</strong> Well done — review before exams.</div>`;

  const badges = (p.badges || []);
  const badgeHTML = badges.length
    ? badges.map(b=>`<div class="dash-badge-chip">🏅 ${escapeHTML(b)}</div>`).join("")
    : `<p style="color:var(--muted);font-size:0.8rem;margin:0">Complete quizzes and games to earn badges!</p>`;

  const moduleRows = MODULES.map(m => {
    const s = scores[m.id] || 0;
    const g = p.games?.[m.id]; const l = p.learned?.[m.id];
    const status = (s >= 70 && g && l) ? "✅ Complete" : (s > 0 || g || l) ? "🔄 In progress" : "○ Not started";
    return `
      <div class="dash-bar-row">
        <div class="dash-bar-label">
          ${escapeHTML(ml(m,"title").split(":")[0])}
          <span>${status} · ${s?s+"%":"no quiz"}</span>
        </div>
        <div class="dash-bar-track"><div class="dash-bar-fill ${s<70&&s>0?"amber":s===0&&(g||l)?"amber":""}" style="width:${Math.max(s, (l?30:0)+(g?30:0))}%"></div></div>
      </div>
    `;
  }).join("");

  const modal = document.createElement("div");
  modal.className = "share-modal-overlay";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="share-modal account-dashboard-modal role-dashboard">
      <div class="account-modal-head">
        <div><p class="eyebrow">Student</p><h3>🎓 My Dashboard</h3></div>
        <button class="icon-button" id="closeTeacherModal" aria-label="Close">×</button>
      </div>
      <div class="role-dash-hero role-dash-hero-student">
        <div class="role-dash-hero-avatar">🎓</div>
        <div>
          <h3>Hi, ${escapeHTML(currentProfile.name)}!</h3>
          <p>${streak > 0 ? `🔥 ${streak}-day streak — keep it up!` : "Start learning to build your streak!"}</p>
        </div>
      </div>
      <div class="dash-stats-row">
        <div class="dash-stat-card"><div class="dash-stat-num">${learned}/${total}</div><div class="dash-stat-label">Lessons done</div></div>
        <div class="dash-stat-card"><div class="dash-stat-num blue">${games}/${total}</div><div class="dash-stat-label">Games played</div></div>
        <div class="dash-stat-card"><div class="dash-stat-num ${avg<50?"red":avg<70?"amber":""}">${avg||0}%</div><div class="dash-stat-label">Quiz average</div></div>
        <div class="dash-stat-card"><div class="dash-stat-num">${streak}🔥</div><div class="dash-stat-label">Day streak</div></div>
      </div>
      <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
        <div class="dash-progress-ring-wrap">${ring}
          <div class="dash-progress-ring-label"><span>Course completion</span></div>
        </div>
        <div style="flex:1;min-width:220px">
          ${recommendation}
          <p class="dash-section-title" style="margin-top:14px">Badges earned</p>
          <div class="dash-badge-row">${badgeHTML}</div>
        </div>
      </div>
      <p class="dash-section-title">All modules</p>
      <div style="padding:4px 0">${moduleRows}</div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#closeTeacherModal")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

function parseStoredJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

function defaultProgress() {
  return {
    learned: {}, games: {}, quizScores: {}, notes: {},
    quizHistory: {}, quizMisses: {}, streak: { count: 0, lastDate: "" },
    weeklyGoal: { target: 3, weekStart: "", done: [] },
    fontScale: 1, language: "en", badges: [],
  };
}

function normalizeProgress(saved) {
  const base = defaultProgress();
  if (!saved || typeof saved !== "object") return base;
  return {
    learned:      saved.learned      || base.learned,
    games:        saved.games        || base.games,
    quizScores:   saved.quizScores   || base.quizScores,
    notes:        saved.notes        || base.notes,
    quizHistory:  saved.quizHistory  || base.quizHistory,
    quizMisses:   saved.quizMisses   || base.quizMisses,
    streak:       saved.streak       || base.streak,
    weeklyGoal:   saved.weeklyGoal   || base.weeklyGoal,
    fontScale:    saved.fontScale    ?? base.fontScale,
    language:     saved.language     || base.language,
    badges:       saved.badges       || base.badges,
  };
}

function profileProgressKey(profileId) {
  return `${STORAGE_KEY}:${profileId}`;
}

function saveAccounts() {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(offlineAccounts));
}

function ensureOfflineAccounts() {
  const saved = parseStoredJSON(ACCOUNT_KEY, null);
  offlineAccounts = Array.isArray(saved) && saved.length
    ? saved.filter((account) => account && account.id && ACCOUNT_ROLES[account.role])
    : DEFAULT_ACCOUNTS.map((account) => ({ ...account }));

  DEFAULT_ACCOUNTS.forEach((defaultAccount) => {
    if (!offlineAccounts.some((account) => account.id === defaultAccount.id)) {
      offlineAccounts.push({ ...defaultAccount });
    }
  });
  if (!offlineAccounts.some((account) => account.role === "student")) {
    offlineAccounts.unshift({ ...DEFAULT_ACCOUNTS[0] });
  }
  saveAccounts();
  migrateLegacyProgressToProfiles();
  return offlineAccounts;
}

function migrateLegacyProgressToProfiles() {
  if (localStorage.getItem(LEGACY_PROGRESS_MIGRATED_KEY)) return;
  const legacy = parseStoredJSON(STORAGE_KEY, null);
  const defaultStudent = offlineAccounts.find((account) => account.role === "student");
  if (legacy && defaultStudent && !localStorage.getItem(profileProgressKey(defaultStudent.id))) {
    localStorage.setItem(profileProgressKey(defaultStudent.id), JSON.stringify(normalizeProgress(legacy)));
  }
  localStorage.setItem(LEGACY_PROGRESS_MIGRATED_KEY, "1");
}

function getStudentProfiles() {
  return offlineAccounts.filter((account) => account.role === "student");
}

function getProfile(profileId) {
  return offlineAccounts.find((account) => account.id === profileId) || null;
}

function loadActiveProfile() {
  ensureOfflineAccounts();
  const savedId = localStorage.getItem(SESSION_KEY);
  const saved = getProfile(savedId);
  const fallback = getStudentProfiles()[0] || offlineAccounts[0];
  const profile = saved || fallback;
  localStorage.setItem(SESSION_KEY, profile.id);
  return profile;
}

function activeLearnerProfileId() {
  if (!currentProfile) return getStudentProfiles()[0]?.id || DEFAULT_ACCOUNTS[0].id;
  if (currentProfile.role === "student") return currentProfile.id;

  // Parent: only from their linked children
  if (currentProfile.role === "parent") {
    const linked = getLinkedStudents(currentProfile).map(a => a.id);
    const saved = localStorage.getItem(`${OBSERVED_LEARNER_KEY}:${currentProfile.id}`);
    if (saved && linked.includes(saved)) return saved;
    const fallback = linked[0] || getStudentProfiles()[0]?.id || currentProfile.id;
    localStorage.setItem(`${OBSERVED_LEARNER_KEY}:${currentProfile.id}`, fallback);
    return fallback;
  }

  // Teacher: from students in their classes, else any student
  if (currentProfile.role === "teacher") {
    const classStudents = getTeacherStudents(currentProfile).map(a => a.id);
    const pool = classStudents.length ? classStudents : getStudentProfiles().map(a => a.id);
    const saved = localStorage.getItem(`${OBSERVED_LEARNER_KEY}:${currentProfile.id}`);
    if (saved && pool.includes(saved)) return saved;
    const fallback = pool[0] || currentProfile.id;
    localStorage.setItem(`${OBSERVED_LEARNER_KEY}:${currentProfile.id}`, fallback);
    return fallback;
  }

  const learnerIds = getStudentProfiles().map((account) => account.id);
  const saved = localStorage.getItem(`${OBSERVED_LEARNER_KEY}:${currentProfile.id}`);
  if (saved && learnerIds.includes(saved)) return saved;
  const fallback = learnerIds[0] || currentProfile.id;
  localStorage.setItem(`${OBSERVED_LEARNER_KEY}:${currentProfile.id}`, fallback);
  return fallback;
}

function currentLearnerProfile() {
  return getProfile(activeLearnerProfileId()) || currentProfile;
}

function canEditProgress() {
  return currentProfile?.role === "student";
}

function guardProgressWrite(action = "save progress") {
  if (canEditProgress()) return true;
  const role = ACCOUNT_ROLES[currentProfile?.role]?.label || "Viewer";
  showToast(`${role} view is read-only. Switch to a student account to ${action}.`, "warn");
  return false;
}

function logOut() {
  localStorage.removeItem(SESSION_KEY);
  currentProfile = null;
  showToast("Signed out. See you next time!", "info");
  setTimeout(() => showWelcomeSplash(), 320);
  render();
}

function switchProfile(profileId, silent = false) {
  const next = getProfile(profileId);
  if (!next) return;
  currentProfile = next;
  localStorage.setItem(SESSION_KEY, next.id);
  progress = loadProgress(activeLearnerProfileId());
  state.quizAnswers = {};
  if (canEditProgress()) {
    checkStreak();
    checkBadges();
  }
  if (!silent) showToast(`Signed in as ${next.name} (${ACCOUNT_ROLES[next.role].label}).`, "success");
  render();
}

function selectLearnerForViewer(learnerId) {
  if (!currentProfile || currentProfile.role === "student" || !getProfile(learnerId)) return;
  localStorage.setItem(`${OBSERVED_LEARNER_KEY}:${currentProfile.id}`, learnerId);
  progress = loadProgress(activeLearnerProfileId());
  state.quizAnswers = {};
  showToast(`Viewing ${currentLearnerProfile()?.name || "student"} progress.`, "info");
  render();
}

function createOfflineAccount(name, role, extras = {}) {
  const cleanName = String(name || "").trim().slice(0, 36) || ACCOUNT_ROLES[role]?.label || "Learner";
  const cleanRole = ACCOUNT_ROLES[role] ? role : "student";
  const id = `${cleanRole}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const account = { id, name: cleanName, role: cleanRole };
  if (extras.pin)                account.pin              = String(extras.pin).slice(0, 8);
  if (cleanRole === "student")   account.classCode        = String(extras.classCode  || "").trim().toUpperCase().slice(0, 10);
  if (cleanRole === "teacher")   account.classCodes       = (extras.classCodes || []).map(c => String(c).trim().toUpperCase()).filter(Boolean);
  if (cleanRole === "parent")    account.linkedStudentIds = extras.linkedStudentIds || [];
  offlineAccounts.push(account);
  saveAccounts();
  if (cleanRole === "student") {
    localStorage.setItem(profileProgressKey(id), JSON.stringify(defaultProgress()));
  }
  switchProfile(id);
}

/* ── Account relationship helpers ─────────────────────────────── */
function getFamilyCode(studentId) {
  return studentId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
}

function getStudentsInClass(classCode) {
  return offlineAccounts.filter(a => a.role === "student" && a.classCode === classCode.toUpperCase());
}

function getTeacherStudents(teacherAccount) {
  const codes = teacherAccount?.classCodes || [];
  if (!codes.length) return getStudentProfiles();
  return offlineAccounts.filter(a => a.role === "student" && codes.includes(a.classCode));
}

function getLinkedStudents(parentAccount) {
  return (parentAccount?.linkedStudentIds || []).map(id => getProfile(id)).filter(Boolean);
}

function linkParentToStudent(parentId, familyCode) {
  const code = String(familyCode || "").trim().toUpperCase();
  const student = offlineAccounts.find(a => a.role === "student" && getFamilyCode(a.id) === code);
  if (!student) return null;
  const parent = getProfile(parentId);
  if (!parent) return null;
  parent.linkedStudentIds = [...new Set([...(parent.linkedStudentIds || []), student.id])];
  saveAccounts();
  return student;
}

function unlinkParentFromStudent(parentId, studentId) {
  const parent = getProfile(parentId);
  if (!parent) return;
  parent.linkedStudentIds = (parent.linkedStudentIds || []).filter(id => id !== studentId);
  saveAccounts();
}

function setAccountPin(accountId, pin) {
  const account = getProfile(accountId);
  if (!account) return;
  account.pin = pin ? String(pin).slice(0, 8) : "";
  saveAccounts();
}

function verifyPin(account, entered) {
  if (!account?.pin) return true;
  return String(entered) === String(account.pin);
}

/* ── PIN entry modal ──────────────────────────────────────────── */
function showPinEntry(account, onSuccess) {
  const existing = document.getElementById("pinEntryModal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "pinEntryModal";
  overlay.className = "share-modal-overlay";
  overlay.style.cssText = "display:flex;z-index:9100";

  const roleInfo = ACCOUNT_ROLES[account.role] || ACCOUNT_ROLES.student;
  let entered = "";

  function renderPad() {
    return `
      <div class="pin-modal">
        <div class="pin-modal-avatar account-avatar account-avatar-${account.role}">${roleInfo.label.charAt(0)}</div>
        <h3 class="pin-modal-name">${escapeHTML(account.name)}</h3>
        <p class="pin-modal-role">${escapeHTML(roleInfo.label)}</p>
        <div class="pin-dots">
          ${[0,1,2,3].map(i=>`<span class="pin-dot ${entered.length>i?"filled":""}"></span>`).join("")}
        </div>
        <p class="pin-error" id="pinError" style="visibility:hidden">Wrong PIN — try again</p>
        <div class="pin-pad">
          ${[1,2,3,4,5,6,7,8,9,"","0","⌫"].map(k=>`
            <button class="pin-key ${k===""?"pin-key-empty":""}" data-key="${k}">${k}</button>
          `).join("")}
        </div>
        <button class="secondary-button" id="pinCancelBtn" style="margin-top:12px;width:100%">Cancel</button>
      </div>
    `;
  }

  overlay.innerHTML = renderPad();
  document.body.appendChild(overlay);

  function refresh() {
    overlay.innerHTML = renderPad();
    bindPad();
  }

  function bindPad() {
    overlay.querySelectorAll("[data-key]").forEach(btn => {
      const k = btn.dataset.key;
      if (!k) return;
      btn.addEventListener("click", () => {
        if (k === "⌫") {
          entered = entered.slice(0, -1);
        } else if (entered.length < 4) {
          entered += k;
        }
        if (entered.length === 4) {
          if (verifyPin(account, entered)) {
            overlay.remove();
            onSuccess();
          } else {
            entered = "";
            refresh();
            setTimeout(() => {
              const err = document.querySelector("#pinError");
              if (err) err.style.visibility = "visible";
            }, 10);
            if (navigator.vibrate) navigator.vibrate([80,40,80]);
          }
          return;
        }
        refresh();
      });
    });
    overlay.querySelector("#pinCancelBtn")?.addEventListener("click", () => overlay.remove());
  }

  bindPad();
}

const state = {
  moduleId: "hay",
  view: "learn",
  globalSearch: "",
  quizAnswers: {},
  theme: localStorage.getItem(THEME_KEY) || "liquid",
  timedMode: false,
  timedSecondsLeft: 60,
  timedTimer: null,
  assessmentActive: false,
  assessmentTimer: null,
  locked: null,
  altGame: "main",
};

const params = new URLSearchParams(window.location.search);
if (MODULES.some((module) => module.id === params.get("module"))) {
  state.moduleId = params.get("module");
}
if (["learn", "play", "quiz", "reader", "journal", "flashcard", "glossary"].includes(params.get("view"))) {
  state.view = params.get("view");
}
if (params.get("lock") && MODULES.some((m) => m.id === params.get("lock"))) {
  state.locked = params.get("lock");
  state.moduleId = params.get("lock");
}

currentProfile = loadActiveProfile();
let progress = loadProgress(activeLearnerProfileId());

const els = {
  moduleList: document.getElementById("moduleList"),
  courseProgressText: document.getElementById("courseProgressText"),
  courseProgressBar: document.getElementById("courseProgressBar"),
  moduleHero: document.getElementById("moduleHero"),
  viewHost: document.getElementById("viewHost"),
  accountPanel: document.getElementById("accountPanel"),
  accountMenuButton: document.getElementById("accountMenuButton"),
  globalSearch: document.getElementById("globalSearch"),
  openPdfButton: document.getElementById("openPdfButton"),
  resetProgressButton: document.getElementById("resetProgressButton"),
  aiAdvisorBtn: document.getElementById("aiAdvisorBtn"),
};

function applyTheme() {
  document.body.style.transition = "background 0.50s ease, color 0.35s ease";
  document.body.dataset.theme = state.theme;
  document.querySelectorAll(".theme-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.themeChoice === state.theme);
  });
}

function loadProgress(profileId = activeLearnerProfileId()) {
  return normalizeProgress(parseStoredJSON(profileProgressKey(profileId), null));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function mondayISO() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function checkStreak() {
  const today = todayISO();
  const last = progress.streak.lastDate;
  if (last === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yISO = yesterday.toISOString().slice(0, 10);
  if (last === yISO) {
    progress.streak.count += 1;
  } else if (last !== "") {
    progress.streak.count = 1;
  } else {
    progress.streak.count = 1;
  }
  progress.streak.lastDate = today;
  saveProgress();
}

function checkWeeklyGoal(moduleId) {
  const monday = mondayISO();
  if (progress.weeklyGoal.weekStart !== monday) {
    progress.weeklyGoal.weekStart = monday;
    progress.weeklyGoal.done = [];
  }
  const module = MODULES.find((m) => m.id === moduleId);
  if (module && moduleCompletion(module) === 3 && !progress.weeklyGoal.done.includes(moduleId)) {
    progress.weeklyGoal.done.push(moduleId);
    saveProgress();
  }
}

function saveProgress() {
  localStorage.setItem(profileProgressKey(activeLearnerProfileId()), JSON.stringify(progress));
}

function currentModule() {
  return MODULES.find((module) => module.id === state.moduleId) || MODULES[0];
}

function moduleCompletionFor(module, source = progress) {
  let done = 0;
  if (source.learned?.[module.id]) done += 1;
  if (source.games?.[module.id]) done += 1;
  if ((source.quizScores?.[module.id] || 0) >= 70) done += 1;
  return done;
}

function moduleCompletion(module) {
  return moduleCompletionFor(module, progress);
}

function coursePercentFor(source = progress) {
  const total = MODULES.length * 3;
  const done = MODULES.reduce((sum, module) => sum + moduleCompletionFor(module, source), 0);
  return Math.round((done / total) * 100);
}

function coursePercent() {
  return coursePercentFor(progress);
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
  applyLanguage();
  applyFontScale();
  renderModuleList();
  renderProgress();
  renderAccountWidgets();
  renderHero();
  renderTabs();
  renderView();
  renderStreakAndGoal();
  if (state.locked) {
    const lockBanner = document.getElementById("assignmentBanner");
    if (lockBanner) {
      const m = MODULES.find((mod) => mod.id === state.locked);
      lockBanner.textContent = `📋 ${t("assignmentBanner")}: ${m ? m.title : state.locked}`;
      lockBanner.style.display = "flex";
    }
  }
}

function applyLanguage() {
  const lang = progress.language || "en";
  document.body.dataset.lang = lang;
  document.querySelectorAll("[data-view='learn']").forEach((el) => { if (el.querySelector(".tab-label")) el.querySelector(".tab-label").textContent = t("tabLearn"); });
  document.querySelectorAll("[data-view='play']").forEach((el) => { if (el.querySelector(".tab-label")) el.querySelector(".tab-label").textContent = t("tabPlay"); });
  document.querySelectorAll("[data-view='quiz']").forEach((el) => { if (el.querySelector(".tab-label")) el.querySelector(".tab-label").textContent = t("tabQuiz"); });
  document.querySelectorAll("[data-view='reader']").forEach((el) => { if (el.querySelector(".tab-label")) el.querySelector(".tab-label").textContent = t("tabReader"); });
  document.querySelectorAll("[data-view='journal']").forEach((el) => { if (el.querySelector(".tab-label")) el.querySelector(".tab-label").textContent = t("tabJournal"); });
  document.querySelectorAll("[data-view='flashcard']").forEach((el) => { if (el.querySelector(".tab-label")) el.querySelector(".tab-label").textContent = t("tabFlashcard"); });
  document.querySelectorAll("[data-view='glossary']").forEach((el) => { if (el.querySelector(".tab-label")) el.querySelector(".tab-label").textContent = t("tabGlossary"); });
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === lang);
  });
}

function applyFontScale() {
  document.documentElement.style.setProperty("--font-scale", progress.fontScale ?? 1);
  const slider = document.getElementById("fontScaleSlider");
  if (slider) slider.value = progress.fontScale ?? 1;
}

function renderModuleList() {
  const modules = state.locked ? MODULES.filter((m) => m.id === state.locked) : MODULES;
  els.moduleList.innerHTML = modules.map((module) => {
    const done = moduleCompletion(module) === 3;
    const active = module.id === state.moduleId;
    return `
      <button class="module-button ${active ? "active" : ""} ${done ? "done" : ""}" data-module="${module.id}">
        <span class="module-icon" style="background:${module.color}">${module.icon}</span>
        <span>
          <span class="module-title">${escapeHTML(ml(module, "title"))}</span>
          <span class="module-pages">Pages ${module.pages[0]}-${module.pages[1]} - ${moduleCompletion(module)}/3</span>
        </span>
        <span class="module-check">OK</span>
      </button>
    `;
  }).join("");}


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

function profileStats(profile) {
  const source = loadProgress(profile.id);
  const completed = MODULES.filter((module) => moduleCompletionFor(module, source) === 3).length;
  const scores = MODULES.map((module) => source.quizScores?.[module.id] || 0);
  const attempted = scores.filter((score) => score > 0);
  const avg = attempted.length ? Math.round(attempted.reduce((sum, score) => sum + score, 0) / attempted.length) : 0;
  const needsModule = MODULES.find((module) => moduleCompletionFor(module, source) < 3);
  return {
    progress: source,
    percent: coursePercentFor(source),
    completed,
    avg,
    badges: (source.badges || []).length,
    needsModule,
  };
}

function renderAccountWidgets() {
  const role = ACCOUNT_ROLES[currentProfile?.role] || ACCOUNT_ROLES.student;
  const learner = currentLearnerProfile();
  const isViewer = currentProfile?.role !== "student";
  const learners = getStudentProfiles();
  const learnerPicker = isViewer && learners.length ? `
    <label class="account-learner-picker">
      <span class="small-label">Viewing learner</span>
      <select id="observedLearnerSelect">
        ${learners.map((account) => `<option value="${account.id}" ${account.id === learner?.id ? "selected" : ""}>${escapeHTML(account.name)}</option>`).join("")}
      </select>
    </label>
  ` : "";
  const readonly = isViewer
    ? `<p class="account-note">${role.label} mode is view-only. Student progress is protected.</p>`
    : `<p class="account-note">Progress saves offline on this device.</p>`;

  if (els.accountMenuButton) {
    els.accountMenuButton.innerHTML = `
      <span class="account-avatar account-avatar-${currentProfile?.role || "student"}">${escapeHTML(role.label.charAt(0))}</span>
      <span class="account-chip-copy">
        <strong>${escapeHTML(currentProfile?.name || role.label)}</strong>
        <small>${escapeHTML(role.label)}${isViewer && learner ? ` viewing ${escapeHTML(learner.name)}` : ""}</small>
      </span>
    `;
    els.accountMenuButton.onclick = () => showAccountChooser();
  }

  if (!els.accountPanel) return;
  els.accountPanel.innerHTML = `
    <div class="account-panel-head">
      <span class="account-avatar account-avatar-${currentProfile?.role || "student"}">${escapeHTML(role.label.charAt(0))}</span>
      <div>
        <p class="eyebrow">Offline account</p>
        <h2>${escapeHTML(currentProfile?.name || role.label)}</h2>
      </div>
    </div>
    <div class="account-role-line">
      <span>${escapeHTML(role.label)}</span>
      <strong>${coursePercent()}%</strong>
    </div>
    ${learnerPicker}
    ${readonly}
    <div class="account-actions">
      <button class="secondary-button" id="accountSwitchButton">Switch</button>
      <button class="secondary-button" id="roleDashboardButton">${escapeHTML(role.dashboard)}</button>
    </div>
    <button class="secondary-button" id="logOutSidebarBtn" style="width:100%;margin-top:8px;color:#f31260;border-color:rgba(243,18,96,0.35)">Sign out</button>
  `;
  document.getElementById("accountSwitchButton")?.addEventListener("click", showAccountChooser);
  document.getElementById("roleDashboardButton")?.addEventListener("click", showTeacherDashboard);
  document.getElementById("logOutSidebarBtn")?.addEventListener("click", logOut);
  document.getElementById("observedLearnerSelect")?.addEventListener("change", (event) => {
    selectLearnerForViewer(event.target.value);
  });
}

function renderOfflineLearnerPanel() {
  const learners = getStudentProfiles();
  if (!learners.length) return `<div class="empty-state">No student accounts on this device yet.</div>`;
  return `
    <div class="offline-learner-grid">
      ${learners.map((profile) => {
        const stats = profileStats(profile);
        const active = currentLearnerProfile()?.id === profile.id;
        return `
          <article class="offline-learner-card ${active ? "active" : ""}">
            <div class="offline-learner-top">
              <span class="account-avatar account-avatar-student">S</span>
              <div>
                <h4>${escapeHTML(profile.name)}</h4>
                <p>${stats.completed}/${MODULES.length} modules complete</p>
              </div>
              <strong>${stats.percent}%</strong>
            </div>
            <div class="mini-progress-track"><span style="width:${stats.percent}%"></span></div>
            <div class="offline-learner-meta">
              <span>Quiz avg: ${stats.avg || "-"}${stats.avg ? "%" : ""}</span>
              <span>Badges: ${stats.badges}/${BADGES.length}</span>
            </div>
            <p class="account-note">${stats.needsModule ? `Next: ${escapeHTML(ml(stats.needsModule, "title").split(":")[0])}` : "All modules complete."}</p>
            ${currentProfile?.role !== "student" ? `<button class="secondary-button" data-view-learner="${profile.id}">${active ? "Viewing" : "View progress"}</button>` : ""}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────────
   Account creation wizard
   ───────────────────────────────────────────────────────────────── */
const ROLE_ICONS = { student: "🎓", teacher: "📋", parent: "👪" };

function _splashDismiss(splash) {
  splash.style.opacity = "0";
  splash.style.transition = "opacity 0.28s ease";
  setTimeout(() => splash.remove(), 300);
}

function _loginAndDismiss(splash, accountId) {
  const account = getProfile(accountId);
  if (!account) return;
  if (account.pin) {
    showPinEntry(account, () => {
      switchProfile(accountId, true);
      _splashDismiss(splash);
      showToast(`Welcome back, ${account.name}!`, "success");
      render();
    });
  } else {
    switchProfile(accountId, true);
    _splashDismiss(splash);
    showToast(`Signed in as ${account.name} (${ACCOUNT_ROLES[account.role].label})`, "success");
    render();
  }
}

/* Step: account creation wizard shown inside the splash */
function _showCreationWizard(splash, role, onBack) {
  const info = ACCOUNT_ROLES[role];
  const icon = ROLE_ICONS[role];

  const panel = document.createElement("div");
  panel.className = "welcome-accounts-panel wizard-panel";

  if (role === "student") {
    panel.innerHTML = `
      <div class="welcome-accounts-header">
        <h3>${icon} New ${info.label} account</h3>
        <button class="welcome-back-btn" id="wizBack">← Back</button>
      </div>
      <div class="wizard-fields">
        <div class="wizard-field-group">
          <label>Full name</label>
          <input id="wName" type="text" maxlength="36" placeholder="e.g. Alice Wanjiru" autocomplete="off">
        </div>
        <div class="wizard-field-group">
          <label>Class code <span class="wizard-hint">(e.g. 9A, 9B — ask your teacher)</span></label>
          <input id="wClass" type="text" maxlength="10" placeholder="e.g. 9A" autocomplete="off" style="text-transform:uppercase">
        </div>
        <div class="wizard-field-group">
          <label>Set a PIN <span class="wizard-hint">(4 digits — optional, leave blank to skip)</span></label>
          <input id="wPin" type="password" maxlength="4" pattern="[0-9]{4}" placeholder="••••" inputmode="numeric">
        </div>
      </div>
      <button class="primary-button wizard-submit" id="wSubmit" style="width:100%;margin-top:16px">Create account &amp; sign in</button>
    `;
    panel.querySelector("#wizBack").addEventListener("click", onBack);
    panel.querySelector("#wSubmit").addEventListener("click", () => {
      const name = panel.querySelector("#wName").value.trim();
      if (!name) { panel.querySelector("#wName").focus(); return; }
      const classCode = panel.querySelector("#wClass").value.trim().toUpperCase();
      const pin = panel.querySelector("#wPin").value.trim();
      if (pin && !/^\d{4}$/.test(pin)) { showToast("PIN must be exactly 4 digits", "warn"); return; }
      createOfflineAccount(name, "student", { classCode, pin });
      _splashDismiss(splash);
    });

  } else if (role === "teacher") {
    panel.innerHTML = `
      <div class="welcome-accounts-header">
        <h3>${icon} New ${info.label} account</h3>
        <button class="welcome-back-btn" id="wizBack">← Back</button>
      </div>
      <div class="wizard-fields">
        <div class="wizard-field-group">
          <label>Full name</label>
          <input id="wName" type="text" maxlength="36" placeholder="e.g. Mr. Odhiambo" autocomplete="off">
        </div>
        <div class="wizard-field-group">
          <label>Classes you teach <span class="wizard-hint">(comma-separated, e.g. 9A, 9B)</span></label>
          <input id="wClasses" type="text" maxlength="80" placeholder="9A, 9B" autocomplete="off">
        </div>
        <div class="wizard-field-group">
          <label>Set a PIN <span class="wizard-hint">(4 digits — optional)</span></label>
          <input id="wPin" type="password" maxlength="4" pattern="[0-9]{4}" placeholder="••••" inputmode="numeric">
        </div>
      </div>
      <button class="primary-button wizard-submit" id="wSubmit" style="width:100%;margin-top:16px">Create account &amp; sign in</button>
    `;
    panel.querySelector("#wizBack").addEventListener("click", onBack);
    panel.querySelector("#wSubmit").addEventListener("click", () => {
      const name = panel.querySelector("#wName").value.trim();
      if (!name) { panel.querySelector("#wName").focus(); return; }
      const classCodes = panel.querySelector("#wClasses").value.split(",").map(c=>c.trim().toUpperCase()).filter(Boolean);
      const pin = panel.querySelector("#wPin").value.trim();
      if (pin && !/^\d{4}$/.test(pin)) { showToast("PIN must be exactly 4 digits", "warn"); return; }
      createOfflineAccount(name, "teacher", { classCodes, pin });
      _splashDismiss(splash);
    });

  } else { // parent
    const students = getStudentProfiles();
    panel.innerHTML = `
      <div class="welcome-accounts-header">
        <h3>${icon} New ${info.label} account</h3>
        <button class="welcome-back-btn" id="wizBack">← Back</button>
      </div>
      <div class="wizard-fields">
        <div class="wizard-field-group">
          <label>Your name</label>
          <input id="wName" type="text" maxlength="36" placeholder="e.g. Mrs. Wanjiru" autocomplete="off">
        </div>
        <div class="wizard-field-group">
          <label>Child's family code <span class="wizard-hint">(ask your child for their 6-letter code)</span></label>
          <input id="wFamilyCode" type="text" maxlength="6" placeholder="e.g. AB12CD" autocomplete="off" style="text-transform:uppercase;letter-spacing:0.1em">
          <p class="wizard-hint" style="margin-top:4px">
            ${students.length ? `Or pick from device: <select id="wStudentPick" style="margin-left:4px;background:var(--control);border:1px solid var(--line);border-radius:6px;padding:3px 6px;color:inherit;font-size:0.8rem"><option value="">— select —</option>${students.map(s=>`<option value="${getFamilyCode(s.id)}">${escapeHTML(s.name)} (${getFamilyCode(s.id)})</option>`).join("")}</select>` : "No students on this device yet — enter the family code manually."}
          </p>
        </div>
        <div class="wizard-field-group">
          <label>Set a PIN <span class="wizard-hint">(4 digits — optional)</span></label>
          <input id="wPin" type="password" maxlength="4" pattern="[0-9]{4}" placeholder="••••" inputmode="numeric">
        </div>
      </div>
      <button class="primary-button wizard-submit" id="wSubmit" style="width:100%;margin-top:16px">Create account &amp; sign in</button>
      <p id="wLinkStatus" style="text-align:center;font-size:0.8rem;color:var(--muted);margin-top:8px"></p>
    `;
    panel.querySelector("#wizBack").addEventListener("click", onBack);
    panel.querySelector("#wStudentPick")?.addEventListener("change", e => {
      panel.querySelector("#wFamilyCode").value = e.target.value;
    });
    panel.querySelector("#wSubmit").addEventListener("click", () => {
      const name = panel.querySelector("#wName").value.trim();
      if (!name) { panel.querySelector("#wName").focus(); return; }
      const pin = panel.querySelector("#wPin").value.trim();
      if (pin && !/^\d{4}$/.test(pin)) { showToast("PIN must be exactly 4 digits", "warn"); return; }
      const familyCode = panel.querySelector("#wFamilyCode").value.trim().toUpperCase();
      // Create account first so we have the ID
      const cleanName = name.slice(0, 36);
      const id = `parent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const account = { id, name: cleanName, role: "parent", pin: pin || "", linkedStudentIds: [] };
      offlineAccounts.push(account);
      saveAccounts();
      // Link child if code given
      if (familyCode) {
        const linked = linkParentToStudent(id, familyCode);
        if (!linked) {
          showToast("Family code not found — you can link a child later from your dashboard.", "warn");
        } else {
          showToast(`Linked to ${linked.name}!`, "success");
        }
      }
      switchProfile(id, true);
      _splashDismiss(splash);
    });
  }

  return panel;
}

/* ─────────────────────────────────────────────────────────────────
   Welcome Splash — full login/create screen shown on first visit
   ───────────────────────────────────────────────────────────────── */
function showWelcomeSplash() {
  const splash = document.createElement("div");
  splash.id = "welcomeSplash";
  splash.className = "welcome-splash";

  const roleDescriptions = {
    student: "Learn lessons, play games, take quizzes and save your progress.",
    teacher: "Monitor your classes, view each student's progress and compare results.",
    parent:  "See your child's progress, quiz scores and what to practise next.",
  };

  function buildBrand() {
    return `
      <div class="welcome-brand">
        <img src="mtplogo.png" alt="MTP Logo" onerror="this.style.display='none'">
        <h1>Agriculture &amp; Nutrition</h1>
        <p>Grade 9 · MTP Digital</p>
      </div>
    `;
  }

  function buildAccountsPanel(role) {
    const accounts = offlineAccounts.filter(a => a.role === role);
    const info = ACCOUNT_ROLES[role];
    const icon = ROLE_ICONS[role];

    const accountSubtitle = (a) => {
      if (a.pin) return "🔒 PIN protected";
      if (role === "student") {
        const p = loadProgress(a.id); const done = Object.keys(p.quizScores||{}).length;
        const avg = done ? Math.round(Object.values(p.quizScores).reduce((s,v)=>s+v,0)/done) : 0;
        const cls = a.classCode ? ` · Class ${a.classCode}` : "";
        return done ? `${done} modules · avg ${avg}%${cls}` : `Ready to start${cls}`;
      }
      if (role === "teacher") return (a.classCodes||[]).length ? `Classes: ${a.classCodes.join(", ")}` : info.action;
      if (role === "parent") {
        const linked = getLinkedStudents(a);
        return linked.length ? `Linked: ${linked.map(s=>s.name).join(", ")}` : "No child linked yet";
      }
      return info.action;
    };

    return `
      <div class="welcome-accounts-panel" id="splashAccountsPanel">
        <div class="welcome-accounts-header">
          <h3>${icon} ${escapeHTML(info.label)} accounts</h3>
          <button class="welcome-back-btn" id="splashBackBtn">← Back</button>
        </div>
        <div class="welcome-account-grid">
          ${accounts.map(a => `
            <button class="welcome-account-btn role-${a.role}" data-login-id="${a.id}">
              <span class="account-avatar account-avatar-${a.role}">${escapeHTML(a.name.charAt(0).toUpperCase())}</span>
              <span>
                <span class="welcome-account-name">${escapeHTML(a.name)}</span>
                <span class="welcome-account-sub">${escapeHTML(accountSubtitle(a))}</span>
              </span>
              ${a.pin ? `<span class="pin-lock-badge">🔒</span>` : ""}
            </button>
          `).join("")}
          ${!accounts.length ? `<p class="welcome-empty">No ${info.label.toLowerCase()} accounts yet — create one below.</p>` : ""}
        </div>
        <div class="welcome-create-section">
          <label>New ${escapeHTML(info.label.toLowerCase())} account</label>
          <button class="secondary-button" id="splashOpenWizardBtn" style="width:100%;margin-top:6px">+ Create new ${escapeHTML(info.label.toLowerCase())} account</button>
        </div>
      </div>
    `;
  }

  function renderRoleStep() {
    splash.innerHTML = `
      <div class="welcome-inner">
        ${buildBrand()}
        <p class="welcome-prompt">Who's learning today?</p>
        <div class="welcome-role-cards">
          ${Object.entries(ACCOUNT_ROLES).map(([key, info]) => `
            <button class="role-card role-card-${key}" data-role="${key}">
              <span class="role-card-icon">${ROLE_ICONS[key]}</span>
              <strong>${escapeHTML(info.label)}</strong>
              <p>${escapeHTML(roleDescriptions[key])}</p>
            </button>
          `).join("")}
        </div>
        <p class="welcome-note">🔒 All data stored privately on this device</p>
      </div>
    `;
    splash.querySelectorAll("[data-role]").forEach(btn => {
      btn.addEventListener("click", () => { btn.classList.add("active"); setTimeout(() => renderAccountStep(btn.dataset.role), 120); });
    });
  }

  function renderAccountStep(role) {
    const inner = splash.querySelector(".welcome-inner") || (() => {
      const d = document.createElement("div"); d.className = "welcome-inner"; splash.appendChild(d); return d;
    })();
    inner.innerHTML = buildBrand() + buildAccountsPanel(role) + `<p class="welcome-note">🔒 All data stored privately on this device</p>`;

    inner.querySelectorAll("[data-login-id]").forEach(btn => {
      btn.addEventListener("click", () => _loginAndDismiss(splash, btn.dataset.loginId));
    });
    inner.querySelector("#splashBackBtn")?.addEventListener("click", renderRoleStep);
    inner.querySelector("#splashOpenWizardBtn")?.addEventListener("click", () => renderWizardStep(role));
  }

  function renderWizardStep(role) {
    const inner = splash.querySelector(".welcome-inner");
    if (!inner) return;
    const wizardPanel = _showCreationWizard(splash, role, () => renderAccountStep(role));
    inner.innerHTML = buildBrand();
    inner.appendChild(wizardPanel);
    inner.insertAdjacentHTML("beforeend", `<p class="welcome-note">🔒 All data stored privately on this device</p>`);
  }

  splash.innerHTML = `<div class="welcome-inner"></div>`;
  document.body.appendChild(splash);
  renderRoleStep();
}

/* ─────────────────────────────────────────────────────────────────
   Account Chooser — switch account from sidebar (with PIN gate)
   ───────────────────────────────────────────────────────────────── */
function showAccountChooser() {
  const modal = document.createElement("div");
  modal.className = "share-modal-overlay account-modal-overlay";

  const accountSubLine = (a) => {
    if (a.role === "student") return a.classCode ? `Class ${a.classCode}` : "Student";
    if (a.role === "teacher") return (a.classCodes||[]).length ? `Classes: ${a.classCodes.join(", ")}` : "Teacher";
    if (a.role === "parent") {
      const linked = getLinkedStudents(a);
      return linked.length ? linked.map(s=>s.name).join(", ") : "No child linked";
    }
    return ACCOUNT_ROLES[a.role]?.label || "";
  };

  const grouped = Object.keys(ACCOUNT_ROLES).map(role => {
    const accounts = offlineAccounts.filter(a => a.role === role);
    const info = ACCOUNT_ROLES[role];
    if (!accounts.length) return "";
    return `
      <div style="margin-bottom:14px">
        <p class="small-label" style="margin:0 0 7px">${ROLE_ICONS[role]} ${escapeHTML(info.label)}s</p>
        <div style="display:grid;gap:7px">
          ${accounts.map(a => `
            <button class="account-choice ${a.id === currentProfile?.id ? "active" : ""}" data-login-profile="${a.id}">
              <span class="account-avatar account-avatar-${a.role}">${escapeHTML(a.name.charAt(0).toUpperCase())}</span>
              <span>
                <strong>${escapeHTML(a.name)}</strong>
                <small>${escapeHTML(accountSubLine(a))}${a.pin ? " 🔒" : ""}</small>
              </span>
              ${a.id === currentProfile?.id ? `<span style="margin-left:auto;font-size:0.68rem;color:var(--leaf);font-weight:800;white-space:nowrap">● Active</span>` : ""}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  modal.innerHTML = `
    <div class="share-modal account-modal">
      <div class="account-modal-head">
        <div><p class="eyebrow">Offline accounts</p><h3>Switch account</h3></div>
        <button class="icon-button" id="closeAccountModal" aria-label="Close">×</button>
      </div>
      <div class="account-choice-list">${grouped}</div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);display:flex;gap:10px;flex-wrap:wrap">
        <button class="secondary-button" id="openWelcomeSplashBtn" style="flex:1">+ Add account</button>
        <button class="secondary-button" id="openAccountSettingsBtn" style="flex:1">⚙ My settings</button>
        <button class="secondary-button" id="logOutBtn" style="width:100%;color:#f31260;border-color:rgba(243,18,96,0.35)">Sign out</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#closeAccountModal")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  modal.querySelectorAll("[data-login-profile]").forEach(btn => {
    btn.addEventListener("click", () => {
      const account = getProfile(btn.dataset.loginProfile);
      if (!account) return;
      if (account.pin && account.id !== currentProfile?.id) {
        modal.remove();
        showPinEntry(account, () => { switchProfile(account.id); });
      } else {
        switchProfile(account.id);
        modal.remove();
      }
    });
  });
  modal.querySelector("#openWelcomeSplashBtn")?.addEventListener("click", () => {
    modal.remove();
    showWelcomeSplash();
  });
  modal.querySelector("#openAccountSettingsBtn")?.addEventListener("click", () => {
    modal.remove();
    showAccountSettings();
  });
  modal.querySelector("#logOutBtn")?.addEventListener("click", () => {
    modal.remove();
    logOut();
  });
}

/* ─────────────────────────────────────────────────────────────────
   Account Settings — change PIN, manage class / linked children
   ───────────────────────────────────────────────────────────────── */
function showAccountSettings() {
  const account = currentProfile;
  if (!account) return;
  const role = account.role;

  const linkedSection = role === "parent" ? (() => {
    const linked = getLinkedStudents(account);
    return `
      <div class="wizard-field-group">
        <label>Linked children</label>
        ${linked.length ? linked.map(s=>`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span class="account-avatar account-avatar-student" style="width:28px;height:28px;font-size:0.75rem">${s.name.charAt(0).toUpperCase()}</span>
            <span style="flex:1;font-size:0.85rem">${escapeHTML(s.name)} <small style="color:var(--muted)">(${getFamilyCode(s.id)})</small></span>
            <button class="secondary-button" data-unlink="${s.id}" style="font-size:0.72rem;padding:3px 9px">Unlink</button>
          </div>
        `).join("") : `<p class="wizard-hint">No children linked yet.</p>`}
        <div style="display:flex;gap:8px;margin-top:8px">
          <input id="settLinkCode" type="text" maxlength="6" placeholder="Child's family code" style="flex:1;text-transform:uppercase;letter-spacing:0.08em" autocomplete="off">
          <button class="primary-button" id="settLinkBtn" style="white-space:nowrap">Link child</button>
        </div>
      </div>
    `;
  })() : "";

  const classSection = role === "teacher" ? `
    <div class="wizard-field-group">
      <label>Classes you teach <span class="wizard-hint">(comma-separated)</span></label>
      <input id="settClasses" type="text" maxlength="80" value="${escapeHTML((account.classCodes||[]).join(", "))}" placeholder="9A, 9B">
    </div>
  ` : role === "student" ? `
    <div class="wizard-field-group">
      <label>Class code</label>
      <input id="settClass" type="text" maxlength="10" value="${escapeHTML(account.classCode||"")}" placeholder="e.g. 9A" style="text-transform:uppercase">
      <p class="wizard-hint" style="margin-top:4px">Your family code (give this to your parent): <strong>${getFamilyCode(account.id)}</strong></p>
    </div>
  ` : "";

  const modal = document.createElement("div");
  modal.className = "share-modal-overlay";
  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="share-modal account-modal">
      <div class="account-modal-head">
        <div><p class="eyebrow">Settings</p><h3>⚙ My account</h3></div>
        <button class="icon-button" id="closeSettingsModal" aria-label="Close">×</button>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0 16px;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:16px">
        <span class="account-avatar account-avatar-${role}" style="width:48px;height:48px;font-size:1.2rem">${account.name.charAt(0).toUpperCase()}</span>
        <div>
          <strong style="font-size:1rem">${escapeHTML(account.name)}</strong>
          <p style="margin:2px 0 0;color:var(--muted);font-size:0.78rem">${ROLE_ICONS[role]} ${ACCOUNT_ROLES[role]?.label}</p>
        </div>
      </div>
      <div class="wizard-fields">
        ${classSection}
        ${linkedSection}
        <div class="wizard-field-group">
          <label>${account.pin ? "Change PIN" : "Set a PIN"} <span class="wizard-hint">(4 digits — leave blank to remove)</span></label>
          <input id="settPin" type="password" maxlength="4" pattern="[0-9]{4}" placeholder="••••" inputmode="numeric">
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="primary-button" id="settSaveBtn" style="flex:1">Save changes</button>
        <button class="secondary-button" id="settDeleteBtn" style="color:#f31260;border-color:rgba(243,18,96,0.35)">Delete account</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#closeSettingsModal")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  modal.querySelectorAll("[data-unlink]").forEach(btn => {
    btn.addEventListener("click", () => {
      unlinkParentFromStudent(account.id, btn.dataset.unlink);
      modal.remove(); showAccountSettings();
    });
  });

  modal.querySelector("#settLinkBtn")?.addEventListener("click", () => {
    const code = modal.querySelector("#settLinkCode")?.value.trim().toUpperCase();
    if (!code) return;
    const result = linkParentToStudent(account.id, code);
    if (!result) { showToast("Family code not found. Ask your child for their 6-letter code.", "warn"); return; }
    showToast(`Linked to ${result.name}!`, "success");
    modal.remove(); showAccountSettings();
  });

  modal.querySelector("#settSaveBtn")?.addEventListener("click", () => {
    const pin = modal.querySelector("#settPin")?.value.trim();
    if (pin && !/^\d{4}$/.test(pin)) { showToast("PIN must be exactly 4 digits", "warn"); return; }
    if (modal.querySelector("#settPin")?.value !== "") setAccountPin(account.id, pin);
    if (role === "teacher") {
      const codes = (modal.querySelector("#settClasses")?.value||"").split(",").map(c=>c.trim().toUpperCase()).filter(Boolean);
      account.classCodes = codes; saveAccounts();
    }
    if (role === "student") {
      const cls = (modal.querySelector("#settClass")?.value||"").trim().toUpperCase();
      account.classCode = cls; saveAccounts();
    }
    showToast("Settings saved.", "success");
    modal.remove();
    render();
  });

  modal.querySelector("#settDeleteBtn")?.addEventListener("click", () => {
    if (!confirm(`Delete account "${account.name}"? This cannot be undone.`)) return;
    offlineAccounts = offlineAccounts.filter(a => a.id !== account.id);
    saveAccounts();
    localStorage.removeItem(profileProgressKey(account.id));
    const fallback = getStudentProfiles()[0] || offlineAccounts[0];
    if (fallback) switchProfile(fallback.id, true);
    modal.remove(); showToast("Account deleted.", "info");
    render();
  });
}


function renderHero() {
  const module = currentModule();
  const learnDone = progress.learned[module.id];
  const gameDone  = progress.games[module.id];
  const quizScore = progress.quizScores[module.id] || 0;
  const learner = currentLearnerProfile();
  const rolePill = canEditProgress()
    ? ""
    : `<span class="pill" title="Read-only role view">${escapeHTML(ACCOUNT_ROLES[currentProfile?.role]?.label || "Viewer")} viewing ${escapeHTML(learner?.name || "student")}</span>`;
  els.moduleHero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">MTP Digital &mdash; ${escapeHTML(ml(module, "strand"))}</p>
      <h2>${escapeHTML(ml(module, "title"))}</h2>
      <p>${escapeHTML(ml(module, "summary"))}</p>
      <div class="hero-meta">
        <span class="pill" title="Click the Book tab to read">📖 Pages ${module.pages[0]}–${module.pages[1]}</span>
        <span class="pill ${learnDone ? "pill-done" : ""}" title="Click Learn tab">${learnDone ? "✅" : "📚"} Learn ${learnDone ? "done" : "open"}</span>
        <span class="pill ${gameDone  ? "pill-done" : ""}" title="Click Simulate tab">${gameDone  ? "✅" : "🎮"} Game ${gameDone  ? "done" : "open"}</span>
        <span class="pill ${quizScore >= 70 ? "pill-done" : ""}" title="Click Quiz tab">${quizScore >= 70 ? "✅" : "🏆"} Quiz ${quizScore}%</span>
        ${rolePill}
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

let _rvTimer = null;

function renderView() {
  const module = currentModule();
  if (state.view !== "play") {
    if (window.MTPThreeSim?.disposeAll) window.MTPThreeSim.disposeAll();
    if (window._activeGameCleanup) { window._activeGameCleanup(); window._activeGameCleanup = null; }
  }

  els.viewHost.style.transition = "opacity 0.15s ease, transform 0.15s ease";
  els.viewHost.style.opacity = "0";
  els.viewHost.style.transform = "translateY(15px) scale(0.98)";

  clearTimeout(_rvTimer);
  _rvTimer = setTimeout(() => {
    if (state.view === "play")      renderPlay(module);
    if (state.view === "learn")     renderLearn(module);
    if (state.view === "quiz")      renderQuiz(module);
    if (state.view === "reader")    renderReader(module);
    if (state.view === "journal")   renderJournal(module);
    if (state.view === "flashcard") renderFlashcard(module);
    if (state.view === "glossary")  renderGlossary(module);

    void els.viewHost.offsetWidth;

    els.viewHost.style.transition = "opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
    els.viewHost.style.opacity = "1";
    els.viewHost.style.transform = "translateY(0) scale(1)";
  }, 150);
}

function renderLearn(module) {
  const hasSpeech = !!window.speechSynthesis;
  const speakerBtn = (text) => hasSpeech
    ? `<button class="speak-btn ghost-button" data-speak="${escapeHTML(text)}" title="Listen" aria-label="Listen">🔊</button>`
    : "";
  const videoCard = module.video ? `
    <article class="tool-card video-embed-card" style="animation-delay:0.28s">
      <p class="eyebrow">🎬 Video</p>
      <h3>${t("watchVideo")}</h3>
      <div class="video-thumb" id="videoThumb_${module.id}">
        <button class="primary-button" id="loadVideoBtn">${t("watchVideo")}</button>
      </div>
    </article>` : "";
  const linksCard = (module.links && module.links.length) ? `
    <article class="tool-card" style="animation-delay:0.32s">
      <p class="eyebrow">🔗 ${t("relatedLinks")}</p>
      <div class="activity-strip">
        ${module.links.map((lnk, li) => { const label = (ml(module, "links") || [])[li]?.label ?? lnk.label; return `<a class="activity-chip" href="${escapeHTML(lnk.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`; }).join("")}
      </div>
    </article>` : "";
  els.viewHost.innerHTML = `
    <div class="grid-2">
      <article class="lesson-card" style="animation-delay:0.04s">
        <p class="eyebrow">🎯 Skill targets</p>
        <h3>What to master</h3>
        <ul class="idea-list">
          ${ml(module, "goals").map((goal, i) => `<li><span>${i + 1}</span><p>${escapeHTML(goal)}</p>${speakerBtn(goal)}</li>`).join("")}
        </ul>
      </article>
      <article class="lesson-card" style="animation-delay:0.10s">
        <p class="eyebrow">💡 Core ideas</p>
        <h3>Book focus</h3>
        <ul class="idea-list">
          ${ml(module, "ideas").map((idea, i) => `<li><span>${i + 1}</span><p>${escapeHTML(idea)}</p>${speakerBtn(idea)}</li>`).join("")}
        </ul>
      </article>
    </div>
    <div class="grid-2" style="margin-top:16px">
      <article class="tool-card" style="animation-delay:0.16s">
        <p class="eyebrow">🏫 Activities</p>
        <h3>Classroom moves</h3>
        <p>Use these formats from the textbook to turn the topic into discussion, practical work, and reflection.</p>
        <div class="activity-strip">
          ${ml(module, "activities").map((a) => `<span class="activity-chip">${escapeHTML(a)}</span>`).join("")}
        </div>
      </article>
      <article class="tool-card" style="animation-delay:0.22s">
        <p class="eyebrow">✅ Checkpoint</p>
        <h3>${progress.learned[module.id] ? "Learning marked ✅" : "Mark after review"}</h3>
        <p>Read pages ${module.pages[0]}–${module.pages[1]}, complete the lesson cards, then mark this section before trying the simulation and quiz.</p>
        <button class="primary-button" id="markLearnedButton" ${canEditProgress() ? "" : "disabled"}>${canEditProgress() ? (progress.learned[module.id] ? "🔄 " + t("reviewAgain") : "✅ " + t("markLearned")) : "Read-only view"}</button>
        <button class="secondary-button" id="printSummaryButton" style="margin-top:8px">🖨️ ${t("printSummary")}</button>
      </article>
    </div>
    ${videoCard}${linksCard}
  `;
  if (module.video) {
    document.getElementById("loadVideoBtn")?.addEventListener("click", () => {
      const thumb = document.getElementById(`videoThumb_${module.id}`);
      if (thumb) thumb.innerHTML = `<iframe src="${escapeHTML(module.video)}" width="100%" height="240" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="border-radius:10px"></iframe>`;
    }, { once: true });
  }
}

function renderPlay(module) {
  if (window._activeGameCleanup) { window._activeGameCleanup(); window._activeGameCleanup = null; }
  if (window.MTPThreeSim?.disposeAll) window.MTPThreeSim.disposeAll();
  const altGame = state.altGame || "main";
  els.viewHost.innerHTML = `
    <div class="game-tab-row">
      <button class="game-tab-btn ${altGame === "main" ? "active" : ""}" data-alt-game="main">⚙️ Main Game</button>
      <button class="game-tab-btn ${altGame === "match" ? "active" : ""}" data-alt-game="match">🃏 Term Match</button>
      <button class="game-tab-btn ${altGame === "wordsearch" ? "active" : ""}" data-alt-game="wordsearch">🔤 Word Search</button>
    </div>
    <div id="gameMount"></div>
  `;
  els.viewHost.querySelectorAll("[data-alt-game]").forEach((btn) => {
    btn.addEventListener("click", () => { state.altGame = btn.dataset.altGame; renderPlay(module); });
  });
  const mount = document.getElementById("gameMount");
  if (altGame === "match") { renderMatchingPairs(mount, module); return; }
  if (altGame === "wordsearch") { renderWordSearch(mount, module); return; }
  const games = {
    hayLab: renderHayLab,
    leftoverSort: renderLeftoverSort,
    farmRaider: renderFarmRaider,
    farmLoop: renderFarmLoop,
    gardenPlanner: renderGardenPlanner,
    pestBlaster: renderPestBlaster,
    storageInspector: renderStorageInspector,
    flourFrenzy: renderFlourFrenzy,
    flourMixer: renderFlourMixer,
    cleanupOrder: renderCleanupOrder,
    disinfectMatch: renderDisinfectMatch,
    graftingLab: renderGraftingLab,
    sunDryer: renderSunDryer,
    wordSearch: renderWordSearch,
  };
  const gameFn = games[module.game];
  if (!gameFn) { mount.innerHTML = `<div class="empty-state">Game not available for this module.</div>`; return; }
  gameFn(mount, module);
}

function renderQuiz(module) {
  if (state.timedTimer) { clearInterval(state.timedTimer); state.timedTimer = null; }
  state.quizAnswers[module.id] = state.quizAnswers[module.id] || {};
  const answers = state.quizAnswers[module.id];
  const bestScore = progress.quizScores[module.id] || 0;
  const answered = Object.keys(answers).length;
  const history = (progress.quizHistory[module.id] || []).slice(-5);
  const historyHtml = history.length ? `
    <div style="margin-top:8px">
      <p style="margin:0 0 4px;font-weight:700;font-size:0.82rem">Last attempts:</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${history.map((s) => `<span class="pill ${s >= 70 ? "pill-done" : ""}">${s}%</span>`).join("")}
      </div>
    </div>` : "";
  els.viewHost.innerHTML = `
    <div class="quiz-layout">
      <div class="question-card" style="animation-delay:0.04s">
        <p class="eyebrow">🏆 ${t("tabQuiz")}</p>
        <h3>${escapeHTML(module.title)}</h3>
        <div id="timedQuizBar" class="timed-quiz-bar" style="display:${state.timedMode ? "block" : "none"}">
          <div class="timed-quiz-fill" id="timedQuizFill" style="width:100%"></div>
          <span id="timedQuizLabel">60s</span>
        </div>
        ${(() => {
          const hasSpeech = !!window.speechSynthesis;
          const misses = progress.quizMisses?.[module.id] || {};
          const sortedIndices = module.quiz.map((_, i) => i)
            .sort((a, b) => (misses[b] || 0) - (misses[a] || 0));
          return sortedIndices.map((index) => {
            const item = module.quiz[index];
            const tq = mlq(module, index);
            const speakQ = hasSpeech ? ` <button class="speak-btn ghost-button" data-speak="${escapeHTML(tq.q)}" title="Listen" style="font-size:0.78rem;padding:2px 5px;vertical-align:middle">🔊</button>` : "";
            return `
            <div class="quiz-block" data-question="${index}" style="margin-bottom:20px">
              <p style="font-weight:800;margin-bottom:8px">${index + 1}. ${escapeHTML(tq.q)}${speakQ}</p>
              <div class="quiz-options">
                ${item.o.map((option_en, oi) => `
                  <button class="choice-button ${answers[index] === option_en ? "selected" : ""}" data-answer="${escapeHTML(option_en)}" data-question="${index}">
                    ${escapeHTML(tq.o[oi] ?? option_en)}
                  </button>
                `).join("")}
              </div>
            </div>`;
          }).join("");
        })()}
      </div>
      <aside class="tool-card quiz-side" style="animation-delay:0.10s">
        <div>
          <p class="eyebrow">${t("bestScore")}</p>
          <div class="score-number" id="quizScoreDisplay">${bestScore}%</div>
          <div class="quiz-score-bar" style="margin-top:8px"><span style="width:${bestScore}%"></span></div>
          ${historyHtml}
        </div>
        <div style="padding:12px 14px;border-radius:10px;background:rgba(30,122,69,0.07);border:1px solid rgba(30,122,69,0.15)">
          <p style="margin:0;font-weight:800;font-size:0.88rem">${t("progress")}</p>
          <p class="progress-answered" style="margin:4px 0 0;font-size:0.82rem;color:var(--muted)">${answered} of ${module.quiz.length} ${t("answered")}</p>
          <p style="margin:6px 0 0;font-size:0.80rem;color:var(--muted)">Score ≥70% to earn the quiz badge.</p>
        </div>
        <button class="primary-button" id="submitQuizButton" style="margin-top:4px" ${canEditProgress() ? "" : "disabled"}>${canEditProgress() ? t("submitQuiz") : "Read-only view"}</button>
        <button class="secondary-button" id="clearQuizButton">${t("clearAnswers")}</button>
        <button class="secondary-button ${state.timedMode ? "active" : ""}" id="toggleTimedMode" style="margin-top:4px">⏱ ${t("timedMode")}</button>
        <button class="secondary-button" id="startAssessmentButton" style="margin-top:4px">📋 ${t("startAssessment")}</button>
      </aside>
    </div>
  `;
  if (state.timedMode) startTimedQuiz(module);
}

function startTimedQuiz(_module) {
  if (state.timedTimer) clearInterval(state.timedTimer);
  state.timedSecondsLeft = 60;
  const fill = document.getElementById("timedQuizFill");
  const label = document.getElementById("timedQuizLabel");
  state.timedTimer = setInterval(() => {
    state.timedSecondsLeft -= 1;
    const pct = (state.timedSecondsLeft / 60) * 100;
    if (fill) fill.style.width = `${pct}%`;
    if (label) { label.textContent = `${state.timedSecondsLeft}s`; label.style.color = state.timedSecondsLeft <= 10 ? "#ff4444" : ""; }
    if (state.timedSecondsLeft <= 0) {
      clearInterval(state.timedTimer);
      state.timedTimer = null;
      document.getElementById("submitQuizButton")?.click();
    }
  }, 1000);
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
  const allDone = completed === MODULES.length;
  const certCard = allDone ? `
    <article class="tool-card certificate-ready" style="animation-delay:0.28s">
      <p class="eyebrow">🏆 Achievement</p>
      <h3>${t("certTitle")}</h3>
      <p>You have completed all ${MODULES.length} modules. Download your certificate!</p>
      <button class="primary-button" id="downloadCertButton">🎓 ${t("downloadCert")}</button>
    </article>` : "";
  els.viewHost.innerHTML = `
    <div class="grid-2">
      <article class="journal-card">
        <p class="eyebrow">Portfolio prompt</p>
        <h3>${escapeHTML(ml(module, "title"))}</h3>
        <p>${escapeHTML(ml(module, "journal"))}</p>
        <textarea id="journalText" placeholder="Write your notes here" ${canEditProgress() ? "" : "readonly"}>${escapeHTML(note)}</textarea>
        <div id="journalPromptStrip" class="prompt-strip" style="display:none">
          <p class="eyebrow">💬 ${t("promptsHeading")}</p>
          ${(ml(module, "prompts") || []).map((p) => `<button class="activity-chip prompt-chip" data-prompt="${escapeHTML(p)}">${escapeHTML(p)}</button>`).join("")}
        </div>
        <div class="journal-actions">
          <button class="primary-button" id="saveJournalButton" ${canEditProgress() ? "" : "disabled"}>${canEditProgress() ? t("saveNote") : "Read-only view"}</button>
          <button class="secondary-button" id="exportProgressButton">${t("exportProgress")}</button>
          <button class="secondary-button" id="shareProgressButton">${t("shareProgress")}</button>
        </div>
      </article>
      <div class="journal-side-col">
        <article class="tool-card" style="animation-delay:0.10s">
          <p class="eyebrow">Achievements</p>
          <h3>Badges</h3>
          <div class="badges-grid" id="badgesGrid"></div>
          <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="secondary-button" id="generateReportCardButton">📊 Report card</button>
            <button class="secondary-button" id="teacherViewButton">📋 ${escapeHTML(ACCOUNT_ROLES[currentProfile?.role]?.dashboard || "Progress view")}</button>
          </div>
          <div style="margin-top:14px">
            <p class="eyebrow">Import code</p>
            <div style="display:flex;gap:8px;margin-top:6px">
              <input id="importCodeInput" type="text" placeholder="${t("importPlaceholder")}" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--control);color:inherit;font-size:0.85rem">
              <button class="secondary-button" id="importCodeButton">${t("importBtn")}</button>
            </div>
          </div>
        </article>
      </div>
    </div>
    ${renderAnalyticsCard()}
    ${certCard}
  `;
  const textarea = document.getElementById("journalText");
  const promptStrip = document.getElementById("journalPromptStrip");
  if (textarea && promptStrip && module.prompts?.length) {
    textarea.addEventListener("input", () => {
      promptStrip.style.display = textarea.value.length >= 50 ? "block" : "none";
    });
    if (note.length >= 50) promptStrip.style.display = "block";
  }
  renderBadgesInline();
}

/* ── Flashcard View ──────────────────────────────────────────── */
function renderFlashcard(module) {
  const cards = [
    ...ml(module, "goals").map((g) => ({ front: "Goal", back: g, type: "goal" })),
    ...ml(module, "ideas").map((g) => ({ front: "Core Idea", back: g, type: "idea" })),
    ...(ml(module, "glossary") || []).map((g) => ({ front: g.term, back: g.def, type: "glossary" })),
  ];
  let idx = 0;
  let flipped = false;
  let known = new Set();

  const draw = () => {
    const card = cards[idx];
    const host = document.getElementById("flashcardHost");
    if (!host) return;
    host.innerHTML = `
      <div class="flashcard-scene" id="flashcardScene">
        <div class="flashcard-card ${flipped ? "flipped" : ""}" id="flashcardInner">
          <div class="flashcard-front">
            <p class="eyebrow">${escapeHTML(card.front)}</p>
            <p class="flashcard-text">${card.type === "glossary" ? escapeHTML(card.front) : "Can you recall this " + escapeHTML(card.front.toLowerCase()) + "?"}</p>
            <p class="flip-hint">${t("flipHint")}</p>
          </div>
          <div class="flashcard-back">
            <p class="eyebrow">${escapeHTML(card.front)}</p>
            <p class="flashcard-text">${escapeHTML(card.back)}</p>
            ${window.speechSynthesis ? `<button class="speak-btn ghost-button" data-speak="${escapeHTML(card.back)}" title="Listen" style="margin-top:6px;font-size:0.85rem">🔊 Listen</button>` : ""}
          </div>
        </div>
      </div>
      <div class="flashcard-nav">
        <button class="secondary-button" id="fcPrev" ${idx === 0 ? "disabled" : ""}>← Prev</button>
        <span style="font-weight:700;font-size:0.9rem;color:var(--muted)">${idx + 1} / ${cards.length}${known.size === cards.length ? " — " + t("allKnown") : ""}</span>
        <button class="secondary-button" id="fcNext" ${idx === cards.length - 1 ? "disabled" : ""}>Next →</button>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:8px">
        <button class="primary-button ${known.has(idx) ? "active" : ""}" id="fcKnown">${known.has(idx) ? "✅ " + t("knownBtn") : t("knownBtn")}</button>
      </div>
    `;
    document.getElementById("flashcardScene")?.addEventListener("click", () => {
      flipped = !flipped;
      document.getElementById("flashcardInner")?.classList.toggle("flipped", flipped);
    });
    document.getElementById("fcPrev")?.addEventListener("click", () => { idx = Math.max(0, idx - 1); flipped = false; draw(); });
    document.getElementById("fcNext")?.addEventListener("click", () => { idx = Math.min(cards.length - 1, idx + 1); flipped = false; draw(); });
    document.getElementById("fcKnown")?.addEventListener("click", () => { known.has(idx) ? known.delete(idx) : known.add(idx); draw(); });
  };

  els.viewHost.innerHTML = `
    <article class="tool-card" style="max-width:600px;margin:0 auto">
      <p class="eyebrow">🃏 ${t("tabFlashcard")}</p>
      <h3>${escapeHTML(module.title)}</h3>
      <div id="flashcardHost"></div>
    </article>
  `;
  draw();
}

/* ── Glossary View ───────────────────────────────────────────── */
function renderGlossary(module) {
  const hasSpeech = !!window.speechSynthesis;
  let query = "";
  const allTerms = MODULES.flatMap((m) => (ml(m, "glossary") || []).map((g) => ({ ...g, moduleTitle: ml(m, "title"), color: m.color })));
  const moduleTerms = (ml(module, "glossary") || []).map((g) => ({ ...g, moduleTitle: ml(module, "title"), color: module.color }));

  const draw = (terms) => {
    const host = document.getElementById("glossaryList");
    if (!host) return;
    const filtered = query ? terms.filter((t) => t.term.toLowerCase().includes(query.toLowerCase()) || t.def.toLowerCase().includes(query.toLowerCase())) : terms;
    if (!filtered.length) { host.innerHTML = `<div class="empty-state">No matching terms.</div>`; return; }
    host.innerHTML = filtered.map((item) => `
      <article class="glossary-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span class="module-icon" style="background:${item.color};width:28px;height:28px;font-size:0.75rem">${item.moduleTitle.charAt(0)}</span>
          <strong class="glossary-term">${highlight(item.term, query)}</strong>
          ${hasSpeech ? `<button class="speak-btn ghost-button" data-speak="${escapeHTML(item.term + ". " + item.def)}" title="Listen">🔊</button>` : ""}
        </div>
        <p class="glossary-def">${highlight(item.def, query)}</p>
        <span class="pill" style="font-size:0.75rem">${escapeHTML(item.moduleTitle)}</span>
      </article>
    `).join("");
  };

  els.viewHost.innerHTML = `
    <div style="margin-bottom:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <input id="glossarySearch" type="search" placeholder="${t("searchGlossary")}" style="flex:1;min-width:180px;padding:10px 14px;border-radius:10px;border:1px solid var(--line);background:var(--control);color:inherit;font-size:0.9rem">
      <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;font-weight:700;cursor:pointer">
        <input type="checkbox" id="glossaryAllModules"> All modules
      </label>
    </div>
    <div class="glossary-grid" id="glossaryList"></div>
  `;
  draw(moduleTerms);
  document.getElementById("glossarySearch")?.addEventListener("input", (e) => {
    query = e.target.value;
    const all = document.getElementById("glossaryAllModules")?.checked;
    draw(all ? allTerms : moduleTerms);
  });
  document.getElementById("glossaryAllModules")?.addEventListener("change", (e) => {
    draw(e.target.checked ? allTerms : moduleTerms);
  });
}

/* ── Speech Utility ──────────────────────────────────────────── */
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = (progress?.language === "sw") ? "sw-KE" : "en-KE";
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

/* ── Certificate Generator ───────────────────────────────────── */
function generateCertificate() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 800;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, "#0a3d25"); grad.addColorStop(1, "#1a5c38");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1200, 800);

  ctx.strokeStyle = "rgba(255,215,0,0.6)"; ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, 1152, 752);
  ctx.strokeStyle = "rgba(255,215,0,0.3)"; ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, 1128, 728);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.arc(150 + i * 130, 400, 60, 0, Math.PI * 2); ctx.fill();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 56px 'Nunito', sans-serif";
  ctx.fillText(t("certTitle"), 600, 120);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "26px 'Nunito Sans', sans-serif";
  ctx.fillText(t("certSub"), 600, 200);

  const name = (progress.notes[MODULES[0].id] || "").split("\n")[0].substring(0, 40) || "Student";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px 'Nunito', sans-serif";
  ctx.fillText(escapeHTML(name), 600, 270);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "24px 'Nunito Sans', sans-serif";
  ctx.fillText(t("certBody"), 600, 330);

  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 28px 'Nunito', sans-serif";
  ctx.fillText(t("certCourse"), 600, 380);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "18px 'Nunito Sans', sans-serif";
  const mods = MODULES.map((m) => m.title).join("  •  ");
  ctx.fillText(mods.substring(0, 120), 600, 450);

  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 20px 'Nunito Sans', sans-serif";
  ctx.fillText(new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }), 600, 680);

  ctx.fillStyle = "rgba(255,215,0,0.8)";
  ctx.font = "18px 'Nunito Sans', sans-serif";
  ctx.fillText("MTP Digital — Agriculture & Nutrition Grade 9", 600, 730);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "mtp-certificate.png";
  link.click();
  confettiBurst(window.innerWidth / 2, window.innerHeight / 3, 55);
  showToast("🎓 Certificate downloaded!", "success");
}

/* ── Share / Import Code ─────────────────────────────────────── */
function generateShareCode() {
  try {
    const data = { name: currentLearnerProfile()?.name || currentProfile?.name || "Student", scores: progress.quizScores, learned: progress.learned, games: progress.games };
    return btoa(JSON.stringify(data));
  } catch { return ""; }
}

function importShareCode(code) {
  try {
    const data = JSON.parse(atob(code.trim()));
    if (data.scores) Object.assign(progress.quizScores, data.scores);
    if (data.learned) Object.assign(progress.learned, data.learned);
    if (data.games) Object.assign(progress.games, data.games);
    saveProgress();
    render();
    showToast("✅ Progress imported successfully!", "success");
  } catch {
    showToast("❌ Invalid code. Please check and try again.", "warn");
  }
}

function showShareModal() {
  const code = generateShareCode();
  const modal = document.createElement("div");
  modal.className = "share-modal-overlay";
  modal.innerHTML = `
    <div class="share-modal">
      <h3>${t("shareModalTitle")}</h3>
      <p>${t("shareInstructions")}</p>
      <textarea class="share-code-box" readonly>${code}</textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        <button class="primary-button" id="copyShareCode">${t("copyCode")}</button>
        <button class="secondary-button" id="closeShareModal">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("copyShareCode")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(code).then(() => showToast("📋 Code copied!", "success")).catch(() => {});
  });
  document.getElementById("closeShareModal")?.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

/* ── Timed Assessment ────────────────────────────────────────── */
function showAssessmentOverlay(module) {
  if (state.assessmentActive) return;
  state.assessmentActive = true;
  let assessAnswers = {};
  let secondsLeft = 600;

  const overlay = document.getElementById("assessmentOverlay");
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="assessment-panel">
      <div class="assessment-header">
        <h2>📋 ${t("assessmentTitle")} — ${escapeHTML(ml(module, "title"))}</h2>
        <div class="assessment-timer">
          <span class="eyebrow">${t("assessmentTimer")}</span>
          <div class="score-number" id="assessTimer">10:00</div>
        </div>
      </div>
      <div class="assessment-bar"><div class="assessment-bar-fill" id="assessBarFill" style="width:100%"></div></div>
      <div class="assessment-questions">
        ${module.quiz.map((item, index) => {
          const tq = mlq(module, index);
          return `
          <div class="quiz-block" style="margin-bottom:20px">
            <p style="font-weight:800;margin-bottom:8px">${index + 1}. ${escapeHTML(tq.q)}</p>
            <div class="quiz-options">
              ${item.o.map((option_en, oi) => `
                <button class="choice-button" data-assess-answer="${escapeHTML(option_en)}" data-assess-question="${index}">
                  ${escapeHTML(tq.o[oi] ?? option_en)}
                </button>
              `).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>
      <button class="primary-button" id="assessSubmitBtn" style="margin-top:16px">${t("assessmentSubmit")}</button>
    </div>
  `;
  overlay.style.display = "flex";

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const timerEl = document.getElementById("assessTimer");
  const fillEl = document.getElementById("assessBarFill");

  state.assessmentTimer = setInterval(() => {
    secondsLeft -= 1;
    if (timerEl) { timerEl.textContent = formatTime(secondsLeft); timerEl.style.color = secondsLeft <= 60 ? "#ff4444" : ""; }
    if (fillEl) fillEl.style.width = `${(secondsLeft / 600) * 100}%`;
    if (secondsLeft <= 0) submitAssessment();
  }, 1000);

  const submitAssessment = () => {
    clearInterval(state.assessmentTimer);
    state.assessmentActive = false;
    overlay.style.display = "none";
    const correct = module.quiz.filter((item, i) => assessAnswers[i] === item.a).length;
    const score = Math.round((correct / module.quiz.length) * 100);
    const oldBest = progress.quizScores[module.id] || 0;
    progress.quizScores[module.id] = Math.max(oldBest, score);
    progress.quizHistory[module.id] = progress.quizHistory[module.id] || [];
    progress.quizHistory[module.id].push(score);
    saveProgress();
    showToast(`📋 Assessment complete — ${score}%`, score >= 70 ? "success" : "info");
    renderProgress(); renderHero(); renderModuleList();
  };

  overlay.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-assess-answer]");
    if (btn) {
      const q = Number(btn.dataset.assessQuestion);
      assessAnswers[q] = btn.dataset.assessAnswer;
      btn.closest(".quiz-options")?.querySelectorAll("[data-assess-answer]").forEach((b) => b.classList.toggle("selected", b === btn));
    }
    if (e.target.id === "assessSubmitBtn") submitAssessment();
  });
}

/* ── Word Search Game ────────────────────────────────────────── */
function generateWordGrid(words, size = 12) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (const word of words) {
    const w = word.toUpperCase().replace(/\s+/g, "");
    let attempts = 0;
    while (attempts < 80) {
      attempts++;
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const endR = row + dr * (w.length - 1);
      const endC = col + dc * (w.length - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
      let fits = true;
      for (let i = 0; i < w.length; i++) {
        const ch = grid[row + dr * i][col + dc * i];
        if (ch && ch !== w[i]) { fits = false; break; }
      }
      if (!fits) continue;
      const cells = [];
      for (let i = 0; i < w.length; i++) {
        grid[row + dr * i][col + dc * i] = w[i];
        cells.push(`${row + dr * i},${col + dc * i}`);
      }
      placed.push({ word: w, cells });
      break;
    }
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
  }
  return { grid, placed };
}

function renderWordSearch(mount, module) {
  const words = (module.glossary || []).map((g) => g.term.toUpperCase().split(" ")[0]).filter((w) => w.length >= 3 && w.length <= 10).slice(0, 8);
  if (!words.length) { mount.innerHTML = `<div class="empty-state">No glossary words available for word search.</div>`; return; }
  const SIZE = 12;
  const { grid, placed } = generateWordGrid(words, SIZE);
  const found = new Set();
  let startCell = null;
  let selectedCells = new Set();

  const draw = () => {
    const gridEl = document.getElementById("wsGrid");
    if (!gridEl) return;
    gridEl.innerHTML = grid.map((row, r) =>
      row.map((ch, c) => {
        const key = `${r},${c}`;
        const isFound = [...found].some((w) => placed.find((p) => p.word === w)?.cells.includes(key));
        const isSel = selectedCells.has(key);
        return `<button class="ws-cell ${isFound ? "ws-found" : ""} ${isSel ? "ws-selecting" : ""}" data-cell="${key}">${ch}</button>`;
      }).join("")
    ).join("");
    document.getElementById("wsFoundCount").textContent = `${found.size} / ${placed.length}`;
    document.getElementById("wsWordList").innerHTML = placed.map((p) =>
      `<span class="activity-chip ${found.has(p.word) ? "ws-word-done" : ""}">${p.word}</span>`
    ).join("");
  };

  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card">
        <p class="eyebrow">🔤 Word Search</p>
        <h3>${escapeHTML(module.title)}</h3>
        <div class="ws-grid" id="wsGrid" style="grid-template-columns:repeat(${SIZE},1fr)"></div>
        <p style="font-size:0.8rem;color:var(--muted);margin-top:8px">Click a start letter, then click the end letter to select a word.</p>
      </article>
      <article class="tool-card result-panel">
        <div id="wsThreeStage" style="width:100%;height:160px;border-radius:10px;overflow:hidden;margin-bottom:10px"></div>
        <p class="eyebrow">Found: <span id="wsFoundCount">0 / ${placed.length}</span></p>
        <div id="wsWordList" class="activity-strip" style="flex-wrap:wrap"></div>
        <button class="secondary-button" id="wsReset" style="margin-top:12px">New puzzle</button>
      </article>
    </div>
  `;
  draw();
  const wsStage = document.getElementById("wsThreeStage");
  if (wsStage && window.MTPThreeSim?.mountWordSearchScene) {
    window.MTPThreeSim.mountWordSearchScene(wsStage);
  }

  mount.addEventListener("click", (e) => {
    if (e.target.id === "wsReset") { renderWordSearch(mount, module); return; }
    const cell = e.target.closest("[data-cell]");
    if (!cell) return;
    const key = cell.dataset.cell;
    if (!startCell) {
      startCell = key;
      selectedCells = new Set([key]);
    } else {
      const [r1, c1] = startCell.split(",").map(Number);
      const [r2, c2] = key.split(",").map(Number);
      const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
      const cells = [];
      let r = r1, c = c1;
      while (true) {
        cells.push(`${r},${c}`);
        if (r === r2 && c === c2) break;
        r += dr; c += dc;
        if (cells.length > SIZE + 1) break;
      }
      const selectedWord = cells.map((cellKey) => { const [rr, cc] = cellKey.split(",").map(Number); return grid[rr][cc]; }).join("");
      const match = placed.find((p) => p.word === selectedWord.toUpperCase() || p.word === [...selectedWord].reverse().join("").toUpperCase());
      if (match) {
        found.add(match.word);
        showToast(`✅ Found: ${match.word}`, "success");
        if (found.size === placed.length) {
          completeGame(module.id);
          confettiBurst(mount.getBoundingClientRect().left + mount.offsetWidth / 2, mount.getBoundingClientRect().top + 100, 35);
        }
      }
      startCell = null;
      selectedCells = new Set();
    }
    draw();
  });
}

function renderHayLab(mount, _module) {
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
        <div id="hayThreeStage" style="width:100%;height:280px;border-radius:12px;overflow:hidden"></div>
        <ul class="feedback-list" id="hayFeedback"></ul>
        <button class="primary-button" id="saveHayButton">Save game result</button>
      </article>
    </div>
  `;
  let hayThreeCtrl = null;
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
    if (hayThreeCtrl) {
      hayThreeCtrl.update({ moisture, storage, weather });
    }
    document.getElementById("hayFeedback").innerHTML = feedback.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    document.getElementById("saveHayButton").dataset.score = score;
  };
  if (mount._gameAC) mount._gameAC.abort();
  const _hayAC = new AbortController();
  mount._gameAC = _hayAC;
  mount.addEventListener("input",  update, { signal: _hayAC.signal });
  mount.addEventListener("change", update, { signal: _hayAC.signal });
  const hayStage = document.getElementById("hayThreeStage");
  if (window.MTPThreeSim?.mountHayScene) {
    hayThreeCtrl = window.MTPThreeSim.mountHayScene(hayStage, { moisture: 18, storage: "raised", weather: "hot" });
  }
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
      <div id="leftoverThreeStage" style="width:100%;height:180px;border-radius:12px;overflow:hidden;margin-bottom:14px"></div>
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
  const leftoverStage = document.getElementById("leftoverThreeStage");
  if (leftoverStage && window.MTPThreeSim?.mountLeftoverSortScene) {
    window.MTPThreeSim.mountLeftoverSortScene(leftoverStage);
  }
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
        <div id="farmLoopThreeStage" style="width:100%;height:260px;border-radius:12px;overflow:hidden"></div>
        <ul class="feedback-list" id="farmLoopFeedback"></ul>
      </article>
    </div>
  `;
  let farmLoopThreeCtrl = null;
  const farmLoopStage = document.getElementById("farmLoopThreeStage");
  if (window.MTPThreeSim?.mountFarmLoopScene) {
    farmLoopThreeCtrl = window.MTPThreeSim.mountFarmLoopScene(farmLoopStage, { count: 0 });
  }
  const draw = () => {
    document.getElementById("farmSequence").innerHTML = sequence.map((item, index) => `
      <li class="sequence-item"><span class="step-index">${index + 1}</span><span>${escapeHTML(item)}</span><button class="ghost-button" data-remove-loop="${index}">Remove</button></li>
    `).join("");
    if (farmLoopThreeCtrl) farmLoopThreeCtrl.update({ count: sequence.length });
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

function renderGardenPlanner(mount, _module) {
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

function renderStorageInspector(mount, _module) {
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
        <div id="storageThreeStage" style="width:100%;height:280px;border-radius:12px;overflow:hidden"></div>
        <button class="primary-button" id="saveStoragePlan">Save inspection</button>
      </article>
    </div>
  `;
  let storageThreeCtrl = null;
  const update = () => {
    const score = checks.reduce((sum, [id, , value]) => sum + (document.querySelector(`[data-storage="${id}"]`)?.checked ? value : 0), 0);
    document.getElementById("storageScore").textContent = `${score}%`;
    document.getElementById("storageMeter").style.width = `${score}%`;
    if (storageThreeCtrl) storageThreeCtrl.update({ score });
    document.getElementById("saveStoragePlan").dataset.score = score;
  };
  if (mount._gameAC) mount._gameAC.abort();
  const _storageAC = new AbortController();
  mount._gameAC = _storageAC;
  mount.addEventListener("change", update, { signal: _storageAC.signal });
  const storageStage = document.getElementById("storageThreeStage");
  if (window.MTPThreeSim?.mountStorageScene) {
    storageThreeCtrl = window.MTPThreeSim.mountStorageScene(storageStage, { score: 0 });
  }
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

function renderFlourMixer(mount, _module) {
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
        <div id="flourThreeStage" style="width:100%;height:280px;border-radius:12px;overflow:hidden"></div>
        <ul class="feedback-list" id="flourFeedback"></ul>
        <button class="primary-button" id="saveFlourMix">Save mixture</button>
      </article>
    </div>
  `;
  let flourThreeCtrl = null;
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
    if (flourThreeCtrl) flourThreeCtrl.update({ type });
    document.getElementById("flourFeedback").innerHTML = [
      `${productLabel(product)} needs ${expected.toLowerCase()}.`,
      type === expected ? "The consistency matches the book process." : "Adjust the liquid-to-flour balance.",
    ].map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    document.getElementById("saveFlourMix").dataset.score = score;
  };
  if (mount._gameAC) mount._gameAC.abort();
  const _flourAC = new AbortController();
  mount._gameAC = _flourAC;
  mount.addEventListener("input",  update, { signal: _flourAC.signal });
  mount.addEventListener("change", update, { signal: _flourAC.signal });
  const flourStage = document.getElementById("flourThreeStage");
  if (window.MTPThreeSim?.mountFlourScene) {
    flourThreeCtrl = window.MTPThreeSim.mountFlourScene(flourStage, { type: "Dough" });
  }
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
    bin:   ["Wear gloves", "Empty the bin", "Wash with warm soapy water", "Rinse with clean water", "Disinfect", "Dry and line the bin"],
    sink:  ["Wear gloves", "Rinse loose dirt", "Sprinkle baking soda", "Scrub basin, tap, and drain", "Rinse with warm then cold water", "Dry with a clean cloth"],
    drain: ["Wear gloves", "Remove litter and leaves", "Pour warm soapy water", "Scrub with stiff brush", "Rinse with clean water", "Flush with hot then cold water"],
  };
  let facility = "bin";
  let order = shuffle([...procedures[facility]]);

  // Set layout ONCE so the Three.js canvas isn't destroyed on every reorder
  mount.innerHTML = `
    <div class="game-board">
      <article class="tool-card">
        <p class="eyebrow">Cleanup sequence</p>
        <h3>Put the steps in order</h3>
        <div class="field-row">
          <label for="facilitySelect">Facility</label>
          <select id="facilitySelect">
            <option value="bin">Waste bin</option>
            <option value="sink">Kitchen sink</option>
            <option value="drain">Open drain</option>
          </select>
        </div>
        <ol class="sequence-list" id="cleanupSeqList"></ol>
      </article>
      <article class="tool-card result-panel">
        <p class="eyebrow">Hygiene check</p>
        <div id="cleanupThreeStage" style="width:100%;height:260px;border-radius:12px;overflow:hidden"></div>
        <button class="primary-button" id="checkCleanup">Check order</button>
        <ul class="feedback-list" id="cleanupFeedback"></ul>
      </article>
    </div>
  `;

  let cleanupThreeCtrl = null;
  const cleanupStage = document.getElementById("cleanupThreeStage");
  if (window.MTPThreeSim?.mountCleanupScene) {
    cleanupThreeCtrl = window.MTPThreeSim.mountCleanupScene(cleanupStage, { facility, score: 0 });
  }

  const drawSequence = () => {
    document.getElementById("cleanupSeqList").innerHTML = order.map((step, index) => `
      <li class="sequence-item">
        <span class="step-index">${index + 1}</span>
        <span>${escapeHTML(step)}</span>
        <span class="step-tools">
          <button data-move="up"   data-index="${index}" title="Move up">Up</button>
          <button data-move="down" data-index="${index}" title="Move down">Dn</button>
        </span>
      </li>`).join("");
  };

  if (mount._gameAC) mount._gameAC.abort();
  const _cleanupAC = new AbortController();
  mount._gameAC = _cleanupAC;
  const _sig = _cleanupAC.signal;

  mount.addEventListener("click", (event) => {
    const move = event.target.closest("[data-move]");
    if (move) {
      const index = Number(move.dataset.index);
      const dir   = move.dataset.move === "up" ? -1 : 1;
      const next  = index + dir;
      if (next >= 0 && next < order.length) {
        [order[index], order[next]] = [order[next], order[index]];
        drawSequence();
      }
    }
    if (event.target.id === "checkCleanup") {
      const correct = procedures[facility].filter((step, i) => order[i] === step).length;
      const pct = Math.round((correct / order.length) * 100);
      document.getElementById("cleanupFeedback").innerHTML = `<li>${correct} of ${order.length} steps are in the correct place.</li>`;
      if (cleanupThreeCtrl) cleanupThreeCtrl.update({ facility, score: pct });
      if (correct === order.length) completeGame(module.id);
    }
  }, { signal: _sig });

  mount.addEventListener("change", (event) => {
    if (event.target.id === "facilitySelect") {
      facility = event.target.value;
      order = shuffle([...procedures[facility]]);
      drawSequence();
      if (cleanupThreeCtrl) cleanupThreeCtrl.update({ facility, score: 0 });
    }
  }, { signal: _sig });

  drawSequence();
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
        <div id="disinfectThreeStage" style="width:100%;height:260px;border-radius:12px;overflow:hidden"></div>
        <button class="primary-button" id="checkDisinfect">Check matches</button>
        <ul class="feedback-list" id="disinfectFeedback"></ul>
      </article>
    </div>
  `;
  let disinfectThreeCtrl = null;
  const disinfectStage = document.getElementById("disinfectThreeStage");
  if (window.MTPThreeSim?.mountDisinfectScene) {
    disinfectThreeCtrl = window.MTPThreeSim.mountDisinfectScene(disinfectStage, { correct: 0 });
  }

  if (mount._gameAC) mount._gameAC.abort();
  const _disinfAC = new AbortController();
  mount._gameAC = _disinfAC;
  const _dsig = _disinfAC.signal;

  mount.addEventListener("change", (event) => {
    if (event.target.dataset.disinfect) picks[event.target.dataset.disinfect] = event.target.value;
  }, { signal: _dsig });
  mount.addEventListener("click", (event) => {
    if (event.target.id === "checkDisinfect") {
      const correct = scenarios.filter(([id, , answer]) => picks[id] === answer).length;
      if (disinfectThreeCtrl) disinfectThreeCtrl.update({ correct });
      document.getElementById("disinfectFeedback").innerHTML = `<li>${correct} of ${scenarios.length} methods match the safest situations.</li>`;
      if (correct >= 4) completeGame(module.id);
    }
  }, { signal: _dsig });
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
        <div id="graftThreeStage" style="width:100%;height:260px;border-radius:12px;overflow:hidden"></div>
        <ul class="feedback-list" id="graftFeedback"></ul>
      </article>
    </div>
  `;
  let graftThreeCtrl = null;
  const graftStage = document.getElementById("graftThreeStage");
  if (window.MTPThreeSim?.mountGraftingScene) {
    graftThreeCtrl = window.MTPThreeSim.mountGraftingScene(graftStage, { count: 0 });
  }
  const draw = () => {
    document.getElementById("graftSequence").innerHTML = steps.map((step, index) => `<li class="sequence-item"><span class="step-index">${index + 1}</span><span>${escapeHTML(step)}</span><button class="ghost-button" data-remove-graft="${index}">Remove</button></li>`).join("");
    if (graftThreeCtrl) graftThreeCtrl.update({ count: steps.length });
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

function renderSunDryer(mount, _module) {
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
        <div id="dryerThreeStage" style="width:100%;height:260px;border-radius:12px;overflow:hidden"></div>
        <ul class="feedback-list" id="dryerFeedback"></ul>
        <button class="primary-button" id="saveDryer">Save dryer</button>
      </article>
    </div>
  `;
  let dryerThreeCtrl = null;
  const dryerStage = document.getElementById("dryerThreeStage");
  if (window.MTPThreeSim?.mountSunDryerScene) {
    dryerThreeCtrl = window.MTPThreeSim.mountSunDryerScene(dryerStage, { score: 0, temp: 24 });
  }
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
    if (dryerThreeCtrl) dryerThreeCtrl.update({ score, temp });
    document.getElementById("dryerFeedback").innerHTML = [
      `Estimated inside temperature: ${temp} C.`,
      `Estimated moisture remaining: ${moisture}%.`,
      score >= 80 ? "The dryer is ready for safe vegetable preservation." : "Add structure, sunlight, hygiene, and turning checks.",
    ].map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    document.getElementById("saveDryer").dataset.score = score;
  };
  if (mount._gameAC) mount._gameAC.abort();
  const _dryerAC = new AbortController();
  mount._gameAC = _dryerAC;
  mount.addEventListener("input",  update, { signal: _dryerAC.signal });
  mount.addEventListener("change", update, { signal: _dryerAC.signal });
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

/* ── Canvas Game: Pest Blaster (Storage module) ──────────────── */
function renderPestBlaster(mount, module) {
  const W = 520, H = 360;

  const PEST_TUT = [
    {
      art: `<div class='vt-scene'>
  <span style='position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font-size:2.6rem;z-index:2'>🏚️</span>
  <div class='vt-ring-anim' style='width:68px;height:68px;border:2.5px solid rgba(220,60,60,0.85)'></div>
  <span class='vt-march-anim' style='font-size:1.7rem;top:12%;right:5%;animation-delay:0s'>🐀</span>
  <span class='vt-march-anim' style='font-size:1.5rem;top:60%;right:9%;animation-delay:0.65s'>🐛</span>
  <span class='vt-march-anim' style='font-size:1.6rem;top:34%;right:1%;animation-delay:1.25s'>🍄</span>
  <div style='position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.64rem;color:rgba(255,200,60,0.88)'>REAL FARM THREAT — pests destroy stored grain</div>
</div>`,
      title: "Protect Your Grain Store",
      desc: "Just like real farmers, defend the granary! Rats eat grain, caterpillars destroy crops, and fungi spread rot. Stop all three from reaching your store."
    },
    {
      art: `<div class='vt-scene'>
  <span style='position:absolute;left:44%;top:60%;font-size:2.4rem'>🐛</span>
  <span class='vt-cursor-anim' style='font-size:2rem;left:52%;top:50%'>🔫</span>
  <span class='vt-burst-anim' style='font-size:1.7rem;top:28%;left:48%;animation-delay:1.0s'>💦</span>
  <div style='position:absolute;right:8%;top:12%;font-size:0.72rem;color:rgba(100,255,160,0.95);line-height:1.55'>🖱️ hover to aim<br>🖱️ click to spray</div>
  <div style='position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.64rem;color:rgba(100,255,160,0.9)'>backpack sprayer — your real pest-control tool</div>
</div>`,
      title: "Use Your Spray Gun",
      desc: "Move your mouse to aim the pesticide nozzle. Click to spray — exactly like a real backpack sprayer! Some pests need multiple sprays to neutralise."
    },
    {
      art: `<div class='vt-scene'>
  <span style='position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-size:2.4rem;z-index:2'>🏚️</span>
  <div style='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:70px;height:70px;border-radius:50%;border:3px solid rgba(220,60,60,0.92);animation:vt-ring-expand 1.2s infinite'></div>
  <span style='position:absolute;right:14%;top:38%;font-size:1.4rem' class='vt-glow-anim'>🐀</span>
  <span style='position:absolute;right:14%;top:22%;font-size:1.3rem'>🚫</span>
  <div style='position:absolute;right:10%;top:58%;font-size:0.65rem;color:rgba(255,100,100,0.95);text-align:right'>❤️❤️❤️<br>3 lives</div>
  <div style='position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.64rem;color:rgba(255,100,100,0.95)'>the red ring = farm perimeter — your last line of defence!</div>
</div>`,
      title: "Guard the Farm Perimeter",
      desc: "The red ring is the granary's outer wall. Any pest crossing it steals one life ❤️. Lose all 3 lives and the harvest is ruined — the granary falls!"
    }
  ];

  mount.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="canvas-game-wrap" style="position:relative;aspect-ratio:520/360">
        <div id="pestThreeStage" style="position:absolute;inset:0"></div>
        <div class="game-overlay" id="pestOverlay">
          <div style="font-size:2.8rem">🌾</div>
          <h2>Pest Blaster</h2>
          <div class="tutorial-steps">
            <div class="tut-step"><span class="tut-num">1</span>Rats 🐀, caterpillars 🐛 &amp; fungi 🍄 march toward your grain store — just like on a real farm</div>
            <div class="tut-step"><span class="tut-num">2</span><strong>Hover</strong> to aim your spray gun · <strong>Click</strong> to spray pesticide on each pest</div>
            <div class="tut-step"><span class="tut-num">3</span>Stop every pest <strong>before it crosses the red danger ring</strong> — each breach costs one ❤️</div>
            <div class="tut-step"><span class="tut-num">4</span>Score <strong>500 points</strong> across all waves to save the harvest!</div>
          </div>
          <button class="primary-button" id="pestStart" style="min-width:160px">Play Now</button>
        </div>
      </div>
      <div class="canvas-hud">
        <div><span class="eyebrow">Score</span><div class="score-number" id="pestScore">0</div></div>
        <div><span class="eyebrow">Lives</span><div id="pestLives" style="font-size:1.3rem;letter-spacing:2px">❤️❤️❤️</div></div>
        <div><span class="eyebrow">Wave</span><div class="score-number" id="pestWave">1</div></div>
        <ul class="feedback-list" id="pestFeedback" style="margin:0 0 0 auto"></ul>
      </div>
    </div>
  `;

  const pestStage = document.getElementById("pestThreeStage");
  let gameCtrl = null;
  if (window.MTPThreeSim?.mountPestBlaster3D) {
    gameCtrl = window.MTPThreeSim.mountPestBlaster3D(pestStage);
  }
  const overlay = document.getElementById("pestOverlay");

  let animId = null, gameActive = false;
  let pests = [], particles = [], score = 0, lives = 3, wave = 1;
  let spawnTimer = 0, lastTime = 0;

  const TYPES = [
    { emoji: "🐀", r: 16, spd: 58,  pts: 20 },
    { emoji: "🐛", r: 10, spd: 90,  pts: 15 },
    { emoji: "🍄", r: 20, spd: 32,  pts: 10 },
  ];

  function spawnPest() {
    const t = TYPES[Math.floor(Math.random() * Math.min(1 + Math.floor(wave / 2), 3))];
    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (edge === 0) { x = 30 + Math.random() * (W - 60); y = -22; }
    else if (edge === 1) { x = W + 22; y = 30 + Math.random() * (H - 60); }
    else if (edge === 2) { x = 30 + Math.random() * (W - 60); y = H + 22; }
    else { x = -22; y = 30 + Math.random() * (H - 60); }
    const tx = W / 2, ty = H * 0.41;
    const dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy);
    const spd = t.spd * (0.55 + Math.random() * 0.35) * (1 + wave * 0.08);
    pests.push({ x, y, vx: (dx / dist) * spd, vy: (dy / dist) * spd, r: t.r, emoji: t.emoji, pts: t.pts, hp: 1 + Math.floor(wave / 3), alpha: 1, wobble: Math.random() * 6 });
  }

  function burstAt(x, y, pts) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      particles.push({ x, y, vx: Math.cos(a) * (2 + Math.random() * 4), vy: Math.sin(a) * (2 + Math.random() * 4) - 2, r: 3 + Math.random() * 4, life: 44, max: 44, txt: null });
    }
    if (pts > 0) particles.push({ x, y, vx: 0, vy: -2.5, r: 0, life: 55, max: 55, txt: `+${pts}` });
  }

  function loseLife() {
    lives--;
    shakeElement(pestStage?.parentElement);
    document.getElementById("pestLives").textContent = "❤️".repeat(Math.max(0, lives));
    if (lives <= 0) endGame(false);
  }

  function endGame(won) {
    gameActive = false;
    if (animId) cancelAnimationFrame(animId);
    window._activeGameCleanup = null;
    overlay.innerHTML = won
      ? `<div style="font-size:3rem">🏆</div><h2 style="color:#ffd700">Granary Saved!</h2><p>Final score: ${score}</p><button class="primary-button" id="pestStart">Play Again</button>`
      : `<div style="font-size:3rem">💀</div><h2 style="color:#ff6b6b">Granary Overrun!</h2><p>Score: ${score} — Storage hygiene matters!</p><button class="primary-button" id="pestStart">Try Again</button>`;
    overlay.style.display = "flex";
    if (won) {
      completeGame(module.id);
      const r = pestStage?.getBoundingClientRect();
      confettiBurst(r ? r.left + r.width / 2 : W / 2, r ? r.top + r.height / 2 : H / 2, 40);
    }
    document.getElementById("pestStart").addEventListener("click", startGame, { once: true });
  }

  function loop(ts) {
    if (!gameActive) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.05); lastTime = ts;
    spawnTimer -= dt;
    if (spawnTimer <= 0) { spawnPest(); spawnTimer = Math.max(0.35, 2.2 - wave * 0.24) * (0.6 + Math.random() * 0.8); }
    pests = pests.filter(p => p.alpha > 0.02);
    pests.forEach(p => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.wobble += 0.1;
      if (Math.hypot(p.x - W / 2, p.y - H * 0.41) < 52) { burstAt(p.x, p.y, 0); p.alpha = 0; loseLife(); }
    });
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= 1; });
    if (gameCtrl) gameCtrl.syncState({ pests, particles });
    if (score > 0 && score >= wave * 150 && !pests.length) { wave++; document.getElementById("pestWave").textContent = wave; popScoreEl(document.getElementById("pestWave")); }
    if (score >= 500 && lives > 0) { endGame(true); return; }
    if (gameActive) animId = requestAnimationFrame(loop);
  }

  function startGame() {
    overlay.style.display = "none";
    pests = []; particles = []; score = 0; lives = 3; wave = 1; spawnTimer = 0; lastTime = performance.now();
    document.getElementById("pestScore").textContent = 0;
    document.getElementById("pestLives").textContent = "❤️❤️❤️";
    document.getElementById("pestWave").textContent = 1;
    document.getElementById("pestFeedback").innerHTML = "";
    gameActive = true;
    showGameHint(pestStage, "🔫 Hover to aim your spray gun · Click to spray pests!");
    window._activeGameCleanup = () => { gameActive = false; if (animId) cancelAnimationFrame(animId); };
    animId = requestAnimationFrame(loop);
  }

  pestStage.addEventListener("click", (e) => {
    if (!gameActive || !gameCtrl) return;
    const gc = gameCtrl.getClickGameCoords(e);
    if (!gc) return;
    const mx = gc.x, my = gc.y;
    let hit = false;
    pests.forEach(p => {
      if (p.alpha <= 0) return;
      if (Math.hypot(mx - p.x, my - p.y) < p.r * 3.0) {
        hit = true; p.hp--;
        if (p.hp <= 0) {
          burstAt(p.x, p.y, p.pts); score += p.pts; p.alpha = 0;
          const el = document.getElementById("pestScore");
          el.textContent = score; popScoreEl(el);
        }
      }
    });
    if (!hit) particles.push({ x: mx, y: my, vx: 0, vy: -1, r: 14, life: 18, max: 18, txt: null });
  });

  document.getElementById("pestStart").addEventListener("click", () => {
    overlay.style.display = "none";
    showVisualTutorial(pestStage, PEST_TUT, startGame);
  }, { once: true });
}

/* ── Canvas Game: Farm Raider (Integrated Farming module) ─────── */
function renderFarmRaider(mount, module) {
  const W = 520, H = 380;
  const RESOURCES = [
    { id: "crop",    label: "Crop Field",     emoji: "🌾", color: "#4d934d", x: 80,  y: 80  },
    { id: "feed",    label: "Animal Feed",    emoji: "🐄", color: "#9a6820", x: 430, y: 95  },
    { id: "manure",  label: "Manure",         emoji: "💩", color: "#7a4010", x: 440, y: 290 },
    { id: "compost", label: "Compost",        emoji: "♻️", color: "#226b8f", x: 90,  y: 295 },
    { id: "pond",    label: "Fish Pond",      emoji: "🐟", color: "#1565c0", x: 260, y: 310 },
    { id: "food",    label: "Household Food", emoji: "🍽️", color: "#e65100", x: 260, y: 60  },
  ];

  const RAID_TUT = [
    {
      art: `<div class='vt-scene'>
  <div style='position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;padding:9px;gap:5px'>
    <div style='background:rgba(77,147,77,0.28);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.35rem' class='vt-glow-anim'>🌾</div>
    <div style='background:rgba(154,104,32,0.28);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.35rem' class='vt-glow-anim'>🐄</div>
    <div style='background:rgba(34,107,143,0.28);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.35rem' class='vt-glow-anim'>♻️</div>
    <div style='background:rgba(230,81,0,0.28);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.35rem' class='vt-glow-anim'>🍽️</div>
  </div>
  <div style='position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.64rem;color:rgba(255,200,60,0.88)'>real integrated farm — everything is connected</div>
</div>`,
      title: "An Integrated Farm",
      desc: "A real farm links ALL resources: crops feed animals 🐄, animals make manure 💩, manure enriches compost ♻️, compost grows crops 🌾 — a full cycle! Collect all 6 to complete it."
    },
    {
      art: `<div class='vt-scene'>
  <div style='position:absolute;bottom:22px;left:5%;right:5%;height:5px;background:rgba(196,168,112,0.45);border-radius:3px'></div>
  <span class='vt-drive-anim' style='font-size:2.8rem;top:21%'>🚜</span>
  <div style='position:absolute;right:7%;top:14%;text-align:right;line-height:1.7'>
    <div style='font-size:0.64rem;color:rgba(255,215,0,0.92)'>🖱️ Mouse = steer</div>
    <div style='font-size:0.64rem;color:rgba(100,200,255,0.88)'>AUTO → nearest resource</div>
  </div>
  <div style='position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.64rem;color:rgba(100,255,160,0.9)'>drive OVER a glowing pillar → loads into trailer</div>
</div>`,
      title: "Drive & Load the Trailer",
      desc: "Your tractor auto-drives to the nearest resource pillar. Move your mouse over the field to steer manually. Drive through a resource to collect it — it loads into the trailer behind!"
    },
    {
      art: `<div class='vt-scene' style='display:flex;align-items:center;justify-content:center'>
  <div style='text-align:center'>
    <div style='font-size:0.7rem;color:rgba(255,215,0,0.85);margin-bottom:5px;letter-spacing:1px'>🚜 TRAILER FILLING UP</div>
    <div style='font-size:1.45rem;letter-spacing:5px' class='vt-glow-anim'>🌾 🐄 💩</div>
    <div style='font-size:0.95rem;margin:4px 0;color:rgba(255,215,0,0.65)'>⟲  integrated cycle ⟲</div>
    <div style='font-size:1.45rem;letter-spacing:5px' class='vt-glow-anim'>♻️ 🐟 🍽️</div>
    <div style='margin-top:9px;font-size:0.68rem;color:#ffd700;font-weight:800;letter-spacing:1.5px'>COLLECT ALL 6 — CLOSE THE LOOP!</div>
  </div>
</div>`,
      title: "Close the Farming Cycle",
      desc: "Collect all 6 resources and watch the trailer load up — just like a real farm collecting its harvest! All 6 must be gathered to complete the integrated farming cycle."
    }
  ];

  const player = { x: 260, y: 190, vx: 0, vy: 0, angle: 0 };
  let collected = new Set(), particles = [];
  let animId = null, gameActive = false, lastTime = 0;

  mount.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="canvas-game-wrap" style="position:relative;aspect-ratio:520/380">
        <div id="raidThreeStage" style="position:absolute;inset:0"></div>
        <div class="game-overlay" id="raidOverlay">
          <div style="font-size:2.8rem">🚜</div>
          <h2>Farm Raider</h2>
          <div class="tutorial-steps">
            <div class="tut-step"><span class="tut-num">1</span>Real farms need ALL resources connected — crops 🌾, livestock 🐄, manure 💩, compost ♻️, fish 🐟 &amp; food 🍽️</div>
            <div class="tut-step"><span class="tut-num">2</span>Tractor <strong>auto-drives</strong> to the nearest resource · <strong>Move mouse</strong> over the field to steer manually</div>
            <div class="tut-step"><span class="tut-num">3</span>Drive <strong>through each glowing pillar</strong> to collect it — watch the trailer fill up!</div>
            <div class="tut-step"><span class="tut-num">4</span>Gather all <strong>6 resources</strong> to complete the integrated farming cycle!</div>
          </div>
          <button class="primary-button" id="raidStart" style="min-width:160px">Play Now</button>
        </div>
      </div>
      <div class="canvas-hud">
        <div><span class="eyebrow">Collected</span><div class="score-number" id="raidCount">0 / 6</div></div>
        <div id="raidChips" style="display:flex;gap:6px;flex-wrap:wrap;flex:1"></div>
        <button class="secondary-button" id="raidReset">Reset</button>
      </div>
    </div>
  `;

  let gameCtrl = null;
  const raidStage = document.getElementById("raidThreeStage");
  if (window.MTPThreeSim?.mountFarmRaider3D) {
    gameCtrl = window.MTPThreeSim.mountFarmRaider3D(raidStage, RESOURCES);
  }
  const overlay = document.getElementById("raidOverlay");

  let mouseGamePos = null, mouseOnStage = false;

  raidStage.addEventListener("mousemove", (e) => {
    if (!gameActive || !gameCtrl) return;
    const gc = gameCtrl.getClickGameCoords(e);
    if (gc) mouseGamePos = gc;
    mouseOnStage = true;
  });
  raidStage.addEventListener("mouseleave", () => { mouseOnStage = false; });
  raidStage.addEventListener("touchmove", (e) => {
    if (!gameActive || !gameCtrl) return;
    e.preventDefault();
    const gc = gameCtrl.getClickGameCoords(e.touches[0]);
    if (gc) { mouseGamePos = gc; mouseOnStage = true; }
  }, { passive: false });
  raidStage.addEventListener("touchend", () => { mouseOnStage = false; });

  function updateChips() {
    document.getElementById("raidChips").innerHTML = RESOURCES.map(r =>
      `<span class="activity-chip" style="${collected.has(r.id) ? `background:${r.color};color:#fff;border-color:${r.color}` : ""}">${r.emoji} ${collected.has(r.id) ? "✓" : r.label}</span>`
    ).join("");
    const el = document.getElementById("raidCount"); el.textContent = `${collected.size} / 6`; popScoreEl(el);
  }

  function updatePlayer(dt) {
    let ax = 0, ay = 0;
    // Mouse/touch overrides auto-drive; otherwise navigate to nearest uncollected resource
    let target = mouseOnStage && mouseGamePos ? mouseGamePos : null;
    if (!target) {
      let minD = Infinity;
      RESOURCES.forEach(r => {
        if (collected.has(r.id)) return;
        const d = Math.hypot(player.x - r.x, player.y - r.y);
        if (d < minD) { minD = d; target = { x: r.x, y: r.y }; }
      });
    }
    if (target) {
      const dx = target.x - player.x, dy = target.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d > 8) { ax = dx / d; ay = dy / d; }
    }
    if (ax || ay) {
      const ta = Math.atan2(ay, ax);
      let da = ta - player.angle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      player.angle += da * 4 * dt;
      player.vx += ax * 160 * dt; player.vy += ay * 160 * dt;
      if (Math.random() > 0.72) particles.push({ x: player.x - Math.cos(player.angle) * 14, y: player.y - Math.sin(player.angle) * 14, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30 - 18, r: 5, color: "rgba(120,120,120,0.45)", life: 22, max: 22 });
    }
    player.vx *= 0.84; player.vy *= 0.84;
    player.x = Math.max(14, Math.min(W - 14, player.x + player.vx * dt));
    player.y = Math.max(14, Math.min(H - 14, player.y + player.vy * dt));
    RESOURCES.forEach(r => {
      if (collected.has(r.id)) return;
      if (Math.hypot(player.x - r.x, player.y - r.y) < 40) {
        collected.add(r.id);
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          particles.push({ x: r.x, y: r.y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, r: 5, color: r.color, life: 38, max: 38 });
        }
        updateChips();
        if (collected.size === 6) setTimeout(() => endGame(true), 500);
      }
    });
  }

  function endGame(won) {
    gameActive = false; if (animId) cancelAnimationFrame(animId); window._activeGameCleanup = null;
    overlay.innerHTML = won
      ? `<div style="font-size:3rem">🏆</div><h2 style="color:#ffd700">Loop Complete!</h2><p>All 6 resources collected — the farm is fully integrated!</p><button class="primary-button" id="raidStart">Play Again</button>`
      : `<div style="font-size:3rem">🚜</div><h2>Nice try!</h2><p>Collected ${collected.size}/6 resources.</p><button class="primary-button" id="raidStart">Try Again</button>`;
    overlay.style.display = "flex";
    if (won) {
      completeGame(module.id);
      const r = raidStage?.getBoundingClientRect();
      confettiBurst(r ? r.left + r.width / 2 : W / 2, r ? r.top + r.height / 3 : H / 3, 55);
    }
    document.getElementById("raidStart").addEventListener("click", startGame, { once: true });
  }

  function loop(ts) {
    if (!gameActive) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.05); lastTime = ts;
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.x += p.vx / 28; p.y += p.vy / 28; p.life--; });
    updatePlayer(dt);
    if (gameCtrl) gameCtrl.syncState({ player, collected, particles });
    animId = requestAnimationFrame(loop);
  }

  function startGame() {
    overlay.style.display = "none";
    Object.assign(player, { x: 260, y: 190, vx: 0, vy: 0, angle: 0 });
    collected = new Set(); particles = []; lastTime = performance.now();
    mouseGamePos = null; mouseOnStage = false; gameActive = true;
    updateChips();
    showGameHint(raidStage, "🚜 Tractor auto-drives · Move mouse to steer · Drive through pillars to collect!");
    window._activeGameCleanup = () => { gameActive = false; if (animId) cancelAnimationFrame(animId); };
    animId = requestAnimationFrame(loop);
  }

  document.getElementById("raidStart").addEventListener("click", () => {
    overlay.style.display = "none";
    showVisualTutorial(raidStage, RAID_TUT, startGame);
  }, { once: true });
  document.getElementById("raidReset").addEventListener("click", () => {
    if (animId) cancelAnimationFrame(animId); gameActive = false;
    overlay.innerHTML = `<div style="font-size:3.2rem">🚜</div><h2>Farm Raider</h2><p>Move your mouse over the field to steer the tractor!</p><button class="primary-button" id="raidStart" style="min-width:160px">Start Game</button>`;
    overlay.style.display = "flex";
    document.getElementById("raidStart").addEventListener("click", startGame, { once: true });
  });

  updateChips();
}

/* ── Canvas Game: Flour Frenzy (Flour Mixtures module) ───────── */
function renderFlourFrenzy(mount, module) {
  const W = 520, H = 360;
  const PRODUCTS = [
    { label: "Chapati",  type: "dough",        emoji: "🫓", color: "#e65100" },
    { label: "Pancakes", type: "thin_batter",   emoji: "🥞", color: "#f9a825" },
    { label: "Mandazi",  type: "dough",        emoji: "🍩", color: "#6d4c41" },
    { label: "Coating",  type: "thick_batter",  emoji: "🍟", color: "#1565c0" },
    { label: "Bread",    type: "dough",        emoji: "🍞", color: "#4e342e" },
  ];
  const TYPES = { dough: "Dough", thin_batter: "Thin Batter", thick_batter: "Thick Batter" };
  const T_COL  = { dough: "#e65100", thin_batter: "#f9a825", thick_batter: "#1565c0" };

  const FRENZY_TUT = [
    {
      art: `<div class='vt-scene'>
  <div style='position:absolute;left:6%;right:6%;top:54%;height:28px;background:rgba(55,55,55,0.9);border-radius:4px;display:flex;align-items:center;overflow:hidden'>
    <div class='vt-belt-anim' style='font-size:1.8rem;padding:0 10px;flex-shrink:0'>🫓</div>
    <div class='vt-belt-anim' style='font-size:1.8rem;padding:0 10px;flex-shrink:0;animation-delay:0.9s'>🥞</div>
    <div class='vt-belt-anim' style='font-size:1.8rem;padding:0 10px;flex-shrink:0;animation-delay:1.7s'>🍟</div>
  </div>
  <div style='position:absolute;left:10%;top:16%;font-size:1.9rem'>🌾</div>
  <div style='position:absolute;left:40%;top:12%;font-size:0.9rem;color:rgba(255,255,255,0.5)'>→→</div>
  <div style='position:absolute;right:10%;top:16%;font-size:1.8rem'>🏭</div>
  <div style='position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.64rem;color:rgba(255,200,60,0.88)'>grain → mill → packaged products on conveyor belt</div>
</div>`,
      title: "Welcome to the Flour Mill",
      desc: "In a real flour mill, grain is milled into different flour types, which go into different products. Your job as quality sorter: classify each product before it falls off the belt!"
    },
    {
      art: `<div class='vt-scene' style='display:flex;align-items:center;justify-content:center'>
  <div style='display:flex;flex-direction:column;gap:5px;width:90%'>
    <div style='display:flex;align-items:center;gap:8px;background:rgba(230,81,0,0.2);border:1.5px solid rgba(230,81,0,0.65);border-radius:8px;padding:5px 10px'>
      <span style='font-size:1.5rem'>🫓🍩🍞</span>
      <div><div style='font-size:0.68rem;font-weight:800;color:#e65100'>DOUGH — stiff &amp; kneaded</div><div style='font-size:0.58rem;color:rgba(255,255,255,0.58)'>chapati, mandazi, bread</div></div>
    </div>
    <div style='display:flex;align-items:center;gap:8px;background:rgba(249,168,37,0.2);border:1.5px solid rgba(249,168,37,0.65);border-radius:8px;padding:5px 10px'>
      <span style='font-size:1.5rem'>🥞</span>
      <div><div style='font-size:0.68rem;font-weight:800;color:#f9a825'>THIN BATTER — pourable &amp; smooth</div><div style='font-size:0.58rem;color:rgba(255,255,255,0.58)'>pancakes</div></div>
    </div>
    <div style='display:flex;align-items:center;gap:8px;background:rgba(21,101,192,0.2);border:1.5px solid rgba(21,101,192,0.65);border-radius:8px;padding:5px 10px'>
      <span style='font-size:1.5rem'>🍟</span>
      <div><div style='font-size:0.68rem;font-weight:800;color:#6ab3f5'>THICK BATTER — coats &amp; fries</div><div style='font-size:0.58rem;color:rgba(255,255,255,0.58)'>coating &amp; frying</div></div>
    </div>
  </div>
</div>`,
      title: "3 Real Flour Mixtures",
      desc: "Dough is stiff — you knead it for baking. Thin Batter is pourable — for pancakes. Thick Batter coats food before frying. Memorise which product uses which!"
    },
    {
      art: `<div class='vt-scene' style='display:flex;align-items:center;justify-content:center'>
  <div style='display:flex;flex-direction:column;gap:9px;width:88%;align-items:center'>
    <div style='font-size:2.1rem;border:2px solid rgba(255,255,255,0.28);border-radius:10px;padding:4px 16px;background:rgba(255,255,255,0.05)'>🥞</div>
    <div style='font-size:0.68rem;color:rgba(255,200,60,0.9)'>↓ identify &amp; click the right type ↓</div>
    <div style='display:flex;gap:6px'>
      <div style='padding:5px 10px;border-radius:7px;font-size:0.62rem;background:rgba(230,81,0,0.25);border:1px solid rgba(230,81,0,0.5);color:#e65100'>Dough</div>
      <div class='vt-btn-flash' style='padding:5px 10px;border-radius:7px;font-size:0.62rem;font-weight:800;border:2px solid #f9a825;color:#f9a825'>✓ Thin Batter</div>
      <div style='padding:5px 10px;border-radius:7px;font-size:0.62rem;background:rgba(21,101,192,0.25);border:1px solid rgba(21,101,192,0.5);color:#6ab3f5'>Thick Batter</div>
    </div>
    <div style='font-size:0.59rem;color:rgba(255,255,255,0.48)'>streak bonus: 2× → 3× → 5× points!</div>
  </div>
</div>`,
      title: "Sort It Before It Falls!",
      desc: "See a product on the belt? Click its mixture type FAST. Wrong answer turns it red and costs your streak. Chain correct answers for up to 5× bonus points — race the belt!"
    }
  ];

  let items = [], score = 0, streak = 0, timeLeft = 60, gameActive = false, animId = null, lastTime = 0, spawnTimer = 0;

  mount.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="canvas-game-wrap" style="position:relative;aspect-ratio:520/360">
        <div id="frenzyThreeStage" style="position:absolute;inset:0"></div>
        <div class="game-overlay" id="frenzyOverlay">
          <div style="font-size:2.8rem">🏭</div>
          <h2>Flour Frenzy</h2>
          <div class="tutorial-steps">
            <div class="tut-step"><span class="tut-num">1</span>You're a quality sorter in a real flour mill — products roll in on the conveyor belt from the right</div>
            <div class="tut-step"><span class="tut-num">2</span><strong>Dough</strong> = stiff &amp; kneaded (chapati 🫓, bread 🍞) · <strong>Thin Batter</strong> = pourable (pancakes 🥞) · <strong>Thick Batter</strong> = frying coat (🍟)</div>
            <div class="tut-step"><span class="tut-num">3</span>Click the <strong>correct mixture type</strong> button before each product falls off the belt!</div>
            <div class="tut-step"><span class="tut-num">4</span>Build a <strong>correct streak</strong> for up to 5× bonus — score <strong>80 points</strong> in 60 seconds!</div>
          </div>
          <button class="primary-button" id="frenzyStart" style="min-width:160px">Play Now</button>
        </div>
      </div>
      <div class="canvas-hud">
        <div><span class="eyebrow">Score</span><div class="score-number" id="frenzyScore">0</div></div>
        <div><span class="eyebrow">Streak</span><div class="score-number" id="frenzyStreak">0🔥</div></div>
        <div><span class="eyebrow">Time</span><div class="score-number" id="frenzyTime">60s</div></div>
        <div style="display:flex;gap:8px;margin-left:auto;flex-wrap:wrap" id="frenzyBtns"></div>
      </div>
    </div>
  `;

  document.getElementById("frenzyBtns").innerHTML = Object.entries(TYPES).map(([t, l]) =>
    `<button class="secondary-button frenzy-ans" data-type="${t}" style="border-left:4px solid ${T_COL[t]}">${l}</button>`
  ).join("");

  const frenzyStage = document.getElementById("frenzyThreeStage");
  let gameCtrl = null;
  if (window.MTPThreeSim?.mountFlourFrenzy3D) {
    gameCtrl = window.MTPThreeSim.mountFlourFrenzy3D(frenzyStage, PRODUCTS);
  }
  const overlay = document.getElementById("frenzyOverlay");

  function spawnItem() {
    const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    items.push({ ...p, x: W + 44, y: H * 0.52 + (Math.random() - 0.5) * 38, spd: 42 + score * 0.08, answered: null, shakeT: 0 });
  }

  function checkAnswer(type) {
    if (!gameActive) return;
    const item = items.filter(i => !i.answered && i.x > 30 && i.x < W - 30).sort((a, b) => a.x - b.x)[0];
    if (!item) return;
    if (item.type === type) {
      item.answered = "correct"; streak++; score += 10 + streak * 2;
      const se = document.getElementById("frenzyScore"); se.textContent = score; popScoreEl(se);
      const ste = document.getElementById("frenzyStreak"); ste.textContent = `${streak}🔥`; popScoreEl(ste);
    } else {
      item.answered = "wrong"; item.shakeT = 0.3; streak = 0;
      document.getElementById("frenzyStreak").textContent = "0🔥";
      shakeElement(document.getElementById("frenzyBtns"));
    }
  }

  function loop(ts) {
    if (!gameActive) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.05); lastTime = ts;
    timeLeft -= dt;
    const te = document.getElementById("frenzyTime"); te.textContent = `${Math.max(0, Math.ceil(timeLeft))}s`;
    if (timeLeft <= 5) te.style.color = "#ff4444"; else te.style.color = "";
    if (timeLeft <= 0) { endGame(); return; }
    spawnTimer -= dt;
    if (spawnTimer <= 0) { spawnItem(); spawnTimer = Math.max(0.7, 2.5 - score * 0.002); }
    items.forEach(i => {
      i.x -= i.spd * dt;
      if (i.shakeT > 0) i.shakeT -= dt;
      if (i.x < -60 && !i.answered) { streak = 0; document.getElementById("frenzyStreak").textContent = "0🔥"; }
    });
    items = items.filter(i => i.x > -80);
    if (gameCtrl) gameCtrl.syncState({ items });
    animId = requestAnimationFrame(loop);
  }

  function endGame() {
    gameActive = false; if (animId) cancelAnimationFrame(animId); window._activeGameCleanup = null;
    const won = score >= 80;
    overlay.innerHTML = won
      ? `<div style="font-size:3rem">🏆</div><h2 style="color:#ffd700">Shift Complete!</h2><p>Score: ${score} — Great flour mix knowledge!</p><button class="primary-button" id="frenzyStart">Play Again</button>`
      : `<div style="font-size:3rem">⏰</div><h2>Time's Up!</h2><p>Score: ${score} — Review batter vs dough differences.</p><button class="primary-button" id="frenzyStart">Try Again</button>`;
    overlay.style.display = "flex";
    if (won) {
      completeGame(module.id);
      const r = frenzyStage?.getBoundingClientRect();
      confettiBurst(r ? r.left + r.width / 2 : W / 2, r ? r.top + r.height / 2 : H / 2, 40);
    }
    document.getElementById("frenzyStart").addEventListener("click", startGame, { once: true });
  }

  function startGame() {
    overlay.style.display = "none";
    items = []; score = 0; streak = 0; timeLeft = 60; spawnTimer = 0; lastTime = performance.now();
    document.getElementById("frenzyScore").textContent = 0;
    document.getElementById("frenzyStreak").textContent = "0🔥";
    document.getElementById("frenzyTime").textContent = "60s";
    document.getElementById("frenzyTime").style.color = "";
    gameActive = true;
    showGameHint(frenzyStage, "🏭 Spot the product · Click its mixture type: Dough · Thin Batter · Thick Batter");
    window._activeGameCleanup = () => { gameActive = false; if (animId) cancelAnimationFrame(animId); };
    animId = requestAnimationFrame(loop);
  }

  mount.addEventListener("click", (e) => {
    const btn = e.target.closest(".frenzy-ans");
    if (btn) checkAnswer(btn.dataset.type);
  });
  document.getElementById("frenzyStart").addEventListener("click", () => {
    overlay.style.display = "none";
    showVisualTutorial(frenzyStage, FRENZY_TUT, startGame);
  }, { once: true });
}

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function completeGame(moduleId) {
  if (!guardProgressWrite("save game progress")) return;
  if (!progress.games[moduleId]) {
    progress.games[moduleId] = true;
    saveProgress();
    checkWeeklyGoal(moduleId);
    checkBadges();
    showToast("🎉 " + t("gameComplete"), "success");
    triggerCelebration(document.getElementById("gameMount"));
  } else {
    progress.games[moduleId] = true;
    saveProgress();
    showToast("✅ " + t("scoreSaved"), "info");
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
    state.altGame = "main";
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
    if (!guardProgressWrite("mark modules learned")) return;
    progress.learned[state.moduleId] = true;
    saveProgress();
    checkWeeklyGoal(state.moduleId);
    checkBadges();
    showToast("📚 " + t("learnedToast"), "success");
    render();
  }
  if (event.target.id === "submitQuizButton") {
    if (!guardProgressWrite("save quiz scores")) return;
    if (state.timedTimer) { clearInterval(state.timedTimer); state.timedTimer = null; }
    const module = currentModule();
    const answers = state.quizAnswers[module.id] || {};
    const correct = module.quiz.filter((item, index) => answers[index] === item.a).length;
    const score = Math.round((correct / module.quiz.length) * 100);
    const oldBest = progress.quizScores[module.id] || 0;
    progress.quizScores[module.id] = Math.max(oldBest, score);
    progress.quizHistory[module.id] = progress.quizHistory[module.id] || [];
    progress.quizHistory[module.id].push(score);
    saveProgress();
    checkWeeklyGoal(module.id);
    const ideas = ml(module, "ideas") || [];
    if (!progress.quizMisses) progress.quizMisses = {};
    if (!progress.quizMisses[module.id]) progress.quizMisses[module.id] = {};
    document.querySelectorAll(".quiz-block").forEach((block) => {
      const index = Number(block.dataset.question);
      const isWrong = answers[index] !== module.quiz[index].a;
      block.querySelectorAll(".choice-button").forEach((button) => {
        button.classList.toggle("correct", button.dataset.answer === module.quiz[index].a);
        button.classList.toggle("wrong", button.classList.contains("selected") && button.dataset.answer !== module.quiz[index].a);
      });
      if (isWrong) {
        progress.quizMisses[module.id][index] = (progress.quizMisses[module.id][index] || 0) + 1;
        if (!block.querySelector(".quiz-hint")) {
          const hint = ideas[index % ideas.length];
          if (hint) {
            const el = document.createElement("p");
            el.className = "quiz-hint";
            el.style.cssText = "margin-top:8px;padding:8px 10px;border-radius:7px;background:rgba(30,122,69,0.07);border-left:3px solid var(--leaf);font-size:0.82rem;color:var(--muted)";
            el.innerHTML = `💡 <em>Hint:</em> ${escapeHTML(hint)}`;
            block.appendChild(el);
          }
        }
      }
    });
    saveProgress();
    const scoreEl = document.getElementById("quizScoreDisplay");
    const scoreBar = document.querySelector(".quiz-score-bar span");
    if (scoreEl) animateValue(scoreEl, progress.quizScores[module.id], 700, "%");
    if (scoreBar) { scoreBar.style.transition = "width 0.7s cubic-bezier(0.34,1.56,0.64,1)"; scoreBar.style.width = `${progress.quizScores[module.id]}%`; }
    checkBadges();
    if (score >= 70) showToast(`🏆 ${score}% — ${t("badgeEarned")}`, "success");
    else if (score >= 40) showToast(`📝 ${score}% — ${t("keepPractising")}`, "info");
    else showToast(`🔄 ${score}% — ${t("reviewNotes")}`, "warn");
    renderModuleList();
    renderProgress();
    renderHero();
  }
  if (event.target.id === "clearQuizButton") {
    state.quizAnswers[state.moduleId] = {};
    renderQuiz(currentModule());
  }
  if (event.target.id === "toggleTimedMode") {
    if (state.timedTimer) { clearInterval(state.timedTimer); state.timedTimer = null; }
    state.timedMode = !state.timedMode;
    renderQuiz(currentModule());
  }
  if (event.target.id === "startAssessmentButton") {
    showAssessmentOverlay(currentModule());
  }
  if (event.target.id === "saveJournalButton") {
    if (!guardProgressWrite("save notes")) return;
    progress.notes[state.moduleId] = document.getElementById("journalText")?.value || "";
    saveProgress();
    checkBadges();
    showToast("💾 " + t("noteSaved"), "info");
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
  if (event.target.id === "shareProgressButton") showShareModal();
  if (event.target.id === "downloadCertButton") generateCertificate();
  if (event.target.id === "generateReportCardButton") generateReportCard();
  if (event.target.id === "teacherViewButton") showTeacherDashboard();
  if (event.target.id === "printSummaryButton") {
    document.body.classList.add("printing-module");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-module"), 1000);
  }
  if (event.target.id === "importCodeButton") {
    if (!guardProgressWrite("import progress")) return;
    const code = document.getElementById("importCodeInput")?.value || "";
    if (code) importShareCode(code);
  }
  const speakBtn = event.target.closest(".speak-btn[data-speak]");
  if (speakBtn) speakText(speakBtn.dataset.speak);
  const promptChip = event.target.closest(".prompt-chip[data-prompt]");
  if (promptChip) {
    const ta = document.getElementById("journalText");
    if (ta) { ta.value += (ta.value ? "\n\n" : "") + promptChip.dataset.prompt + "\n"; ta.dispatchEvent(new Event("input")); }
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
  // Update only this question's button states in-place — no full re-render
  answer.closest(".quiz-options")?.querySelectorAll(".choice-button").forEach((btn) => {
    btn.classList.toggle("selected", btn === answer);
  });
  const answered = Object.keys(state.quizAnswers[module.id]).length;
  const progressEl = document.querySelector(".quiz-side .progress-answered");
  if (progressEl) progressEl.textContent = `${answered} of ${module.quiz.length} answered`;
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

els.aiAdvisorBtn?.addEventListener("click", () => showAIPanel());

els.resetProgressButton.addEventListener("click", () => {
  if (!guardProgressWrite("reset progress")) return;
  if (!confirm(t("progressReset"))) return;
  progress = defaultProgress();
  state.quizAnswers = {};
  saveProgress();
  render();
});

document.addEventListener("click", (event) => {
  const langBtn = event.target.closest("[data-lang-btn]");
  if (langBtn) {
    progress.language = langBtn.dataset.langBtn;
    saveProgress();
    checkBadges();
    render();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "fontScaleSlider") {
    progress.fontScale = Number(event.target.value);
    saveProgress();
    applyFontScale();
  }
});

function initOfflineIndicator() {
  const banner = document.getElementById("offlineBanner");
  if (!banner) return;
  const update = () => {
    banner.style.display = navigator.onLine ? "none" : "flex";
    banner.textContent = navigator.onLine ? "" : t("offlineBanner");
    if (navigator.onLine) showToast("🌐 " + t("onlineBanner"), "success");
  };
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  if (!navigator.onLine) { banner.style.display = "flex"; banner.textContent = t("offlineBanner"); }
}

function renderStreakAndGoal() {
  const streakEl = document.getElementById("streakChip");
  if (streakEl && progress.streak.count > 0) {
    streakEl.textContent = `🔥 ${progress.streak.count} ${t("streakLabel")}`;
    streakEl.style.display = "inline-flex";
  } else if (streakEl) {
    streakEl.style.display = "none";
  }
  const goalEl = document.getElementById("weeklyGoalRing");
  if (!goalEl) return;
  const done = (progress.weeklyGoal.done || []).length;
  const target = progress.weeklyGoal.target || 3;
  const pct = Math.min(done / target, 1);
  const r = 22, circ = 2 * Math.PI * r;
  goalEl.innerHTML = `
    <svg width="60" height="60" viewBox="0 0 60 60" aria-label="${done}/${target} ${t("weeklyLabel")}">
      <circle cx="30" cy="30" r="${r}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5"/>
      <circle cx="30" cy="30" r="${r}" fill="none" stroke="var(--leaf)" stroke-width="5"
        stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - pct)}"
        stroke-linecap="round" transform="rotate(-90 30 30)"/>
      <text x="30" y="34" text-anchor="middle" font-size="11" font-weight="800" fill="white">${done}/${target}</text>
    </svg>
    <span style="font-size:0.75rem;color:var(--muted)">${t("weeklyLabel")}</span>
  `;
}

if (canEditProgress()) {
  checkStreak();
  checkBadges();
}
initOfflineIndicator();
initNotifications();
render();
if (SHOULD_PROMPT_LOGIN) setTimeout(() => showWelcomeSplash(), 650);
