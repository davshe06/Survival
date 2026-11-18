/* More field tools: step-by-step first-aid flowcharts, lightning distance timer, storm countdown checklists,
   Spanish emergency phrases, printable field binder. */
(function () {
  'use strict';
  const { route, setTitle, store, esc, toast, view, $, TOOL_LIST } = window.FG;

  // ======================= First-aid flowcharts =======================
  // Each chart is a set of nodes. A question node has q + yes/no targets; an action node has do[] (+ optional next).
  // Wording follows American Red Cross / American Heart Association lay-rescuer guidance.
  const CALL = '📞 Call 911 (put the phone on speaker). No signal? Try anyway, since 911 can use any carrier. Or send someone, or use <a href="#/tools/share">Text my location</a>.';
  const FLOW = [
    { id: 'collapse', icon: '🧍', title: 'Someone collapsed / won’t respond', link: 'firstaid/cpr', nodes: {
      start: { q: 'Is it safe to reach them? (traffic, live wires, fire, smoke, fast water, gas smell)', yes: 'resp', no: 'unsafe' },
      unsafe: { do: ['Don’t become a second casualty. Make it safe only if you can (turn off engine/power, upwind of smoke).', CALL, 'Tell responders exactly what the hazard is.'] },
      resp: { q: 'Tap their shoulders and shout “Are you OK?” Do they respond?', yes: 'awake', no: 'breath' },
      awake: { do: ['Keep them still and talk to them. Ask what happened and what hurts.', 'Look for severe bleeding, and stop it first.', 'Call 911 for chest pain, trouble breathing, confusion, stroke signs, a seizure, a bad fall or head injury.', 'Diabetic and acting drunk or confused? If they can swallow safely, give sugar (juice, soda, glucose tabs, candy).'], also: ['bleeding', 'stroke', 'chest'] },
      breath: { do: ['Shout for help. ' + CALL, 'Look at the chest and face for up to 10 seconds.'], next: 'breathing' },
      breathing: { q: 'Are they breathing normally? (Occasional gasps do NOT count as breathing.)', yes: 'recovery', no: 'cpr' },
      cpr: { danger: 1, do: ['Start CPR now: heel of hand on the center of the chest, push hard and fast, 2–2.4 in deep at 100–120 per minute. Let the chest come all the way back up.', 'If trained: 30 compressions then 2 breaths. If not: hands‑only, nonstop compressions.', 'Drowning or a child, and you’re alone: give 2 minutes of CPR before leaving to call.', 'Send someone for an AED. Turn it on and follow its voice.', 'Don’t stop until help takes over, an AED tells you to, or they start breathing.'], tool: ['#/tools/cpr', '❤️ Open CPR metronome'] },
      recovery: { do: ['Roll them onto their side (recovery position): top knee bent, head tilted back, mouth pointing down so vomit drains.', 'Suspected neck/back injury and breathing fine? Leave them as found unless they vomit or you must leave them.', 'Re‑check breathing every minute. If it stops, start CPR.', 'Look for a cause: injuries, medical ID bracelet, heat or cold, overdose (give naloxone/Narcan if you have it).'], tool: ['#/tools/cpr', '❤️ CPR metronome (if needed)'] }
    } },
    { id: 'bleeding', icon: '🩸', title: 'Severe bleeding', link: 'firstaid/bleeding', nodes: {
      start: { q: 'Is blood spurting, pooling on the ground, soaking through clothing or bandages, or is part of a limb missing?', yes: 'where', no: 'minor' },
      minor: { do: ['Press firmly with a clean cloth or gauze for 5–10 minutes without peeking.', 'Rinse well with clean water, then cover with a clean dressing.', 'Watch for infection over the next days: spreading redness, heat, pus, red streaks, fever.'], also: [], art: 'firstaid/wounds' },
      where: { q: 'Is the wound on an arm or a leg (and not at the armpit or groin)?', yes: 'tq', no: 'pack' },
      tq: { danger: 1, do: ['Tourniquet 2–3 inches above the wound (not on a joint). If in doubt, go high and tight on the limb.', 'Tighten (windlass) until the bleeding STOPS. It will hurt. That’s expected.', 'Write the time on it or on their forehead (“TK 14:32”). Never loosen it once it’s on.', 'No tourniquet? Press hard with both hands or a knee, or improvise: a 1½‑inch or wider strap (belt, folded cloth), tied around, with a stick twisted to tighten. Thin cord or wire does not work.', CALL, 'Keep them warm and lying down (shock).'], tool: ['#/tools/timer', '⏱️ Log tourniquet time'] },
      pack: { danger: 1, do: ['Neck, armpit, groin or torso: pack the wound. Stuff gauze or the cleanest cloth you have deep into the wound with your fingers, right onto the bleeding.', 'Then press down hard with both hands for at least 3 minutes (10 minutes if plain cloth). Don’t lift to look.', 'Neck: never wrap anything tightly around the neck.', 'Chest wound that sucks or bubbles: cover it with a chest seal or plastic taped down. If breathing gets worse, lift one edge to let air out.', CALL, 'Keep them warm and lying down (shock).'] }
    } },
    { id: 'choking', icon: '😮‍💨', title: 'Choking', link: 'firstaid/choking', nodes: {
      start: { q: 'Can they cough hard, talk, or breathe?', yes: 'cough', no: 'infant' },
      cough: { do: ['Let them cough. Stay with them and encourage it. Don’t slap their back while they’re coughing well.', 'If coughing becomes weak or silent, or their lips turn blue, go back and answer “No”.', 'Call 911 if it doesn’t clear soon.'] },
      infant: { q: 'Is it a baby under 1 year old?', yes: 'baby', no: 'adult' },
      baby: { danger: 1, do: ['Lay the baby face down along your forearm, head lower than the chest, supporting the jaw.', 'Give 5 firm back blows between the shoulder blades with the heel of your hand.', 'Turn face up. Give 5 chest thrusts with 2 fingers on the center of the chest, just below the nipple line.', 'Repeat 5 and 5 until the object comes out or the baby becomes unresponsive.', 'Unresponsive: ' + CALL + ' Start infant CPR. Look in the mouth before breaths and remove the object only if you can see it.'] },
      adult: { danger: 1, do: ['Stand behind them. Give 5 back blows between the shoulder blades with the heel of your hand.', 'Then 5 abdominal thrusts: fist just above the belly button, other hand over it, quick inward‑upward pulls.', 'Pregnant or too large to reach around: do chest thrusts (hands on the center of the breastbone) instead.', 'Repeat 5 and 5 until it comes out.', 'Alone? Thrust your own belly hard over the back of a chair or a counter edge.', 'If they become unresponsive: lower them to the ground, ' + CALL + ' Start CPR. Look in the mouth before breaths and remove the object only if you can see it.'] }
    } },
    { id: 'allergy', icon: '🐝', title: 'Allergic reaction', link: 'firstaid/allergy', nodes: {
      start: { q: 'Any trouble breathing, wheezing, throat tightness, hoarse voice, swollen lips/tongue, OR hives plus dizziness, fainting or vomiting?', yes: 'ana', no: 'mild' },
      ana: { danger: 1, do: ['This is anaphylaxis. It can kill within minutes.', 'Use an epinephrine auto‑injector (EpiPen/Auvi‑Q) NOW: outer thigh, through clothing if needed. Hold for the time on the label.', CALL, 'Lie them flat with legs raised. If breathing is hard, let them sit up. Don’t let them stand or walk.', 'No better in 5–15 minutes, or symptoms return: give a second dose if you have one.', 'Antihistamine pills alone are NOT enough for anaphylaxis. Still go to the ER, because symptoms can come back hours later.', 'Stops breathing: start CPR.'] },
      mild: { do: ['Remove the trigger. Scrape a bee stinger out sideways with a card or nail. Rinse off plant oils.', 'Give an antihistamine (diphenhydramine/Benadryl or cetirizine) per the label. A cool compress helps.', 'Watch them closely for at least an hour. Any breathing or throat symptoms means it is anaphylaxis.'], next2: ['ana', 'It’s getting worse → treat as anaphylaxis'] }
    } },
    { id: 'snakebite', icon: '🐍', title: 'Snakebite', link: 'wildlife/snakes', nodes: {
      start: { do: ['Step back out of striking range (a snake can strike about half its body length). Don’t try to catch or kill it. A photo from a safe distance helps.', 'Keep the person calm and still. Remove rings, watches and tight clothing near the bite before swelling starts.', 'Keep the bitten limb at about heart level. A loose splint helps keep it still.', 'Mark the edge of the swelling with a pen and the time, every 15–30 minutes.', 'Get to a hospital, and call 911. Antivenom is the only real treatment. Carry them if you can rather than letting them walk.', '🚫 NO tourniquet, cutting, sucking, suction kits, ice, electric shock or alcohol.'], next: 'severe' },
      severe: { q: 'Trouble breathing, swelling of the face or throat, fainting, or confusion?', yes: 'sev', no: 'wait' },
      sev: { danger: 1, do: [CALL, 'Lay them down. Possible allergic reaction to venom: use epinephrine if you have it.', 'Stops breathing: start CPR.'], tool: ['#/tools/cpr', '❤️ CPR metronome'] },
      wait: { do: ['Keep going to the hospital, even if it looks mild. Copperhead and cottonmouth bites can worsen over hours, and coral snake symptoms can be delayed up to 12 hours.', 'Note the time of the bite and the snake’s appearance for the doctors.'] }
    } },
    { id: 'heat', icon: '🌡️', title: 'Overheated', link: 'firstaid/heat', nodes: {
      start: { q: 'Confused, slurring, acting strange, collapsed, or having a seizure? (They may or may not still be sweating.)', yes: 'stroke', no: 'exh' },
      stroke: { danger: 1, do: ['Heat stroke: a life‑threatening emergency. ' + CALL, 'COOL FIRST, then transport. Best: immerse them in cold water up to the neck (creek, tub, tarp lined with water and ice).', 'Otherwise soak them with water and fan hard. Put ice or cold packs at the neck, armpits and groin. Swap in cold wet towels.', 'Keep cooling until they are thinking clearly or help arrives.', 'Don’t give drinks unless they are fully awake and can swallow.'] },
      exh: { q: 'Heavy sweating, weakness, headache, dizziness, nausea, cramps or a fast pulse?', yes: 'exhaust', no: 'prevent' },
      exhaust: { do: ['Heat exhaustion. Stop all activity. Move to shade, A/C or a breeze.', 'Lie down with legs raised. Loosen or remove extra clothing.', 'Cool with wet cloths and fanning.', 'Sip cool water or a sports drink: ½ to 1 cup every 15 minutes.', 'Not better in 30–60 minutes, vomiting, or getting confused: get medical help. Confusion means heat stroke.'], next2: ['stroke', 'They’re confused → heat stroke'] },
      prevent: { do: ['Keep it from getting worse: rest in the shade during the hottest hours (11am–4pm), drink before you’re thirsty, and add salt or electrolytes.', 'Check on the old, the very young, and anyone on heart or psych medicines. They overheat sooner.'], art: 'weather/heatwave' }
    } },
    { id: 'cold', icon: '🥶', title: 'Too cold (hypothermia)', link: 'firstaid/cold', nodes: {
      start: { q: 'Confused, very sleepy, slurring, stumbling, OR shivering has STOPPED while they’re still cold?', yes: 'severe', no: 'mild' },
      severe: { danger: 1, do: ['Moderate to severe hypothermia. ' + CALL, 'Handle gently. Rough movement can trigger a dangerous heart rhythm. Keep them lying flat. Don’t let them walk.', 'Get them out of wind and wet. Cut off wet clothing rather than pulling it off.', 'Make a “burrito”: insulation under them (pads, branches, packs), sleeping bag or blankets around them, then a plastic sheet or emergency blanket as the outer layer.', 'Put warm (not hot) water bottles or heat packs on the chest, armpits and back, wrapped in cloth.', 'Don’t rub arms or legs. No alcohol. Warm sweet drinks only if fully awake and able to swallow.', 'No breathing or pulse after checking for a full minute: start CPR.'] },
      mild: { do: ['Mild hypothermia: shivering, clumsy hands, still thinking clearly.', 'Get out of wind and rain. Change into dry clothes. Put on a hat, and get insulation under them.', 'Give warm, sweet drinks and high‑calorie food. Then light exercise or body heat in a shared sleeping bag.', 'Watch closely. Getting worse means the “Yes” branch.'], next2: ['severe', 'Getting worse → severe hypothermia'] }
    } },
    { id: 'stroke', icon: '🧠', title: 'Stroke signs (BE FAST)', link: 'firstaid/illness', nodes: {
      start: { danger: 1, do: ['<b>B</b>alance: sudden loss of balance or coordination. <b>E</b>yes: sudden vision loss or double vision.', '<b>F</b>ace: ask them to smile. Does one side droop? <b>A</b>rms: raise both arms. Does one drift down? <b>S</b>peech: slurred or strange?', '<b>T</b>ime: any one of these → ' + CALL, 'Note the exact time they were last known to be normal. Hospitals decide treatment by this.', 'Nothing by mouth (no food, drink or aspirin). Swallowing may be affected.', 'If they vomit or become drowsy, roll them onto their side.'] }
    } },
    { id: 'chest', icon: '💔', title: 'Chest pain (heart attack)', link: 'firstaid/illness', nodes: {
      start: { danger: 1, do: ['Warning signs: pressure, squeezing or pain in the chest, or pain in the arm, jaw, neck or back, with shortness of breath, cold sweat, nausea or lightheadedness. Women, diabetics and older adults often have only shortness of breath, nausea or unusual tiredness.', CALL, 'Sit them down and keep them calm. Loosen tight clothing.', 'Have them chew one 325 mg aspirin (or four 81 mg) unless allergic, bleeding, or told by a doctor not to.', 'If they have prescribed nitroglycerin, help them take it.', 'Unresponsive and not breathing normally: start CPR and send for an AED.'], tool: ['#/tools/cpr', '❤️ CPR metronome'] }
    } },
    { id: 'burns', icon: '🔥', title: 'Burns', link: 'firstaid/burns', nodes: {
      start: { q: 'Bigger than the person’s palm, on the face, hands, feet, groin or a joint, deep (white, leathery, charred), electrical, chemical, or did they breathe smoke?', yes: 'bad', no: 'minor' },
      bad: { danger: 1, do: ['Electrical: shut off the power before touching them. Then check breathing, because CPR may be needed.', 'Chemical: brush off powder, then flush with lots of running water for 20+ minutes.', 'Cool the burn with cool (not ice‑cold) running water for 20 minutes. For very large burns or small children, cool for less time and keep the rest of the body warm.', 'Remove rings, watches and clothing near the burn unless they’re stuck to it.', 'Cover loosely with plastic wrap or a clean, dry, non‑fluffy cloth.', CALL + ' Smoke inhaled, hoarse voice or soot around the mouth: go to the ER even if they seem fine.'] },
      minor: { do: ['Cool under cool running water for 20 minutes. No ice, butter, oil or toothpaste.', 'Don’t pop blisters. Cover loosely with a clean non‑stick dressing.', 'Aloe or plain petroleum jelly once cooled. Ibuprofen or acetaminophen for pain.', 'Watch for infection: spreading redness, pus, fever.'] }
    } },
    { id: 'seizure', icon: '⚡', title: 'Seizure', link: 'firstaid/illness', nodes: {
      start: { do: ['Note the time it starts. Move hard or sharp things away and cushion their head.', 'Don’t hold them down. Put NOTHING in their mouth; they can’t swallow their tongue.', 'When the jerking stops, roll them onto their side and check breathing.', 'They will be confused and sleepy for a while. Stay with them and talk calmly.'], next: 'call' },
      call: { q: 'Longer than 5 minutes, another seizure right after, first seizure ever, injured, pregnant, diabetic, happened in water, or not waking up?', yes: 'emerg', no: 'ok' },
      emerg: { danger: 1, do: [CALL, 'Keep them on their side. Not breathing normally once the seizure stops: start CPR.'] },
      ok: { do: ['Someone with known epilepsy who wakes up normally may not need the ER. Follow their seizure plan, and stay until they’re fully alert.'] }
    } }
  ];
  TOOL_LIST.unshift({ id: 'triage', href: '#/triage', icon: '🚑', title: 'First aid step by step', sum: 'Answer yes/no and get told exactly what to do', k: 'first aid flowchart triage emergency what to do steps decision bleeding cpr choking stroke heart attack seizure burn heat cold allergy' });
  window.FG.FLOW = FLOW;

  route(/^\/triage$/, () => {
    setTitle('First aid step by step', '#/');
    view.innerHTML = `<div class="box danger small"><b>Life‑threatening?</b> Call 911 first, or have someone else call while you start.</div>
      <div class="list">${FLOW.map(f => `<a class="row" href="#/triage/${f.id}"><span class="i">${f.icon}</span><span class="t"><b>${esc(f.title)}</b></span><span class="chev">›</span></a>`).join('')}</div>
      <p class="small muted">Follows American Red Cross and American Heart Association lay‑rescuer guidance. These are not a substitute for training. Take a CPR / Stop the Bleed class.</p>`;
  });
  route(/^\/triage\/([\w-]+)$/, (m, q) => {
    const f = FLOW.find(x => x.id === m[1]); if (!f) return (location.hash = '#/triage');
    setTitle(f.title, '#/triage');
    const path = (q.get('p') || 'start').split('.'), id = path[path.length - 1], n = f.nodes[id] || f.nodes.start;
    const go = (to, ans) => `#/triage/${f.id}?p=${path.concat(to).join('.')}`;
    const trail = path.slice(0, -1).map((k, i) => { const nd = f.nodes[k], nx = path[i + 1]; return nd.q ? `<div class="small muted">✓ ${esc(nd.q.replace(/<[^>]+>/g, ''))} <b>${nd.yes === nx ? 'Yes' : 'No'}</b></div>` : ''; }).join('');
    const also = (n.also || []).map(a => { const t = FLOW.find(x => x.id === a); return t ? `<a class="btn" href="#/triage/${a}">${t.icon} ${esc(t.title)}</a>` : ''; }).join('');
    view.innerHTML = `${trail ? `<div class="card" style="padding:10px 14px">${trail}</div>` : ''}
      ${n.q ? `<div class="card flowq"><p class="big" style="margin:4px 0 14px">${n.q}</p><div class="flowbtns"><a class="btn pri" href="${go(n.yes)}">Yes</a><a class="btn" href="${go(n.no)}">No</a></div></div>`
        : `<div class="box ${n.danger ? 'danger' : 'info'}"><ol class="steps">${n.do.map(x => `<li>${x}</li>`).join('')}</ol></div>
        <div class="btnrow">${n.tool ? `<a class="btn pri" href="${n.tool[0]}">${n.tool[1]}</a>` : ''}${n.next ? `<a class="btn pri" href="${go(n.next)}">Next ›</a>` : ''}${n.next2 ? `<a class="btn" href="${go(n.next2[0])}">${esc(n.next2[1])}</a>` : ''}${also}</div>`}
      <div class="btnrow">${path.length > 1 ? `<a class="btn" href="#/triage/${f.id}?p=${path.slice(0, -1).join('.')}">‹ Back</a><a class="btn" href="#/triage/${f.id}">Start over</a>` : ''}<a class="btn" href="#/a/${n.art || f.link}">📖 Full guide</a></div>`;
  });

  // ======================= Lightning distance =======================
  route(/^\/tools\/lightning$/, () => {
    setTitle('Lightning distance', '#/tools');
    let flashAt = 0, lastThunder = store.get('lastThunder', 0), int = null;
    view.innerHTML = `<div class="card" style="text-align:center"><p class="small muted" style="margin-top:0">Tap when you SEE the flash, then tap again when you HEAR the thunder.</p>
        <button class="btn red" id="lgBtn" style="width:100%;min-height:110px;font-size:1.4rem">⚡ Flash!</button>
        <p class="big" id="lgOut" style="margin:14px 0 4px">&nbsp;</p><p class="small" id="lgAdv"></p></div>
      <div class="card"><h3>30‑minute all clear</h3><p class="big mono" id="lgClr">—</p><p class="small muted">Wait 30 minutes after the LAST thunder before going back outside. Every new rumble restarts the clock.</p>
        <div class="btnrow"><button class="btn" id="lgHeard">🔊 I just heard thunder</button></div></div>
      <div class="card"><h3>Recent strikes</h3><div id="lgList" class="small"></div></div>
      <div class="box info small">Sound travels about 1 mile every 5 seconds (1 km every 3 s). If you can hear thunder at all, you are close enough to be struck. <a href="#/a/weather/lightning">Lightning safety ›</a></div>`;
    const list = () => { const l = store.get('strikes', []).filter(s => Date.now() - s.t < 3 * 36e5); $('#lgList').innerHTML = l.length ? l.map((s, i) => { const prev = l[i + 1]; const trend = prev ? (s.mi < prev.mi - 0.3 ? ' ⬇️ closer' : s.mi > prev.mi + 0.3 ? ' ⬆️ moving away' : '') : ''; return `<div style="padding:4px 0;border-bottom:1px solid var(--line)">${new Date(s.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · <b>${s.mi.toFixed(1)} mi</b> (${(s.mi * 1.609).toFixed(1)} km)${trend}</div>`; }).join('') : '<span class="muted">None yet.</span>'; };
    const clr = () => { if (!lastThunder) return; const left = lastThunder + 30 * 6e4 - Date.now(); $('#lgClr').textContent = left > 0 ? Math.floor(left / 6e4) + ':' + String(Math.floor(left % 6e4 / 1e3)).padStart(2, '0') + ' to go' : '✅ 30 min since last thunder'; };
    const thunder = () => { lastThunder = Date.now(); store.set('lastThunder', lastThunder); clr(); };
    $('#lgBtn').onclick = () => {
      if (!flashAt) { flashAt = performance.now(); $('#lgBtn').textContent = '🔊 Thunder!'; $('#lgBtn').classList.remove('red'); $('#lgBtn').classList.add('pri'); $('#lgOut').textContent = 'Counting…'; return; }
      const sec = (performance.now() - flashAt) / 1000, mi = sec / 4.7; flashAt = 0;
      $('#lgBtn').textContent = '⚡ Flash!'; $('#lgBtn').classList.add('red'); $('#lgBtn').classList.remove('pri');
      $('#lgOut').textContent = `${sec.toFixed(1)} s → ${mi.toFixed(1)} mi (${(mi * 1.609).toFixed(1)} km)`;
      $('#lgAdv').innerHTML = mi < 6 ? '<b style="color:var(--danger)">Within striking range. Get inside a building or a hard‑topped car now.</b> Away from shelter: off ridges and away from lone trees, water and metal fences. Spread a group 50 ft apart.' : 'Storm is still distant. Keep timing; head for shelter if the times get shorter.';
      const l = store.get('strikes', []); l.unshift({ t: Date.now(), mi }); store.set('strikes', l.slice(0, 30)); thunder(); list();
    };
    $('#lgHeard').onclick = thunder;
    list(); clr(); int = setInterval(clr, 1000);
    return () => clearInterval(int);
  });
})();
