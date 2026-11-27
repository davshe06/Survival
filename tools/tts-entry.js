// Build: npm i mespeak@2.0.2 esbuild && npx esbuild tools/tts-entry.js --bundle --minify --format=iife --outfile=js/tts-worker.js
// Offline speech for turn-by-turn (eSpeak via meSpeak). Runs in a Web Worker: text in, WAV bytes out.
const m = require('mespeak');
m.loadConfig(require('mespeak/src/mespeak_config.json'));
m.loadVoice(require('mespeak/voices/en/en-us.json'));
self.onmessage = e => {
  const { id, text, speed, pitch } = e.data;
  try {
    const a = m.speak(text, { rawdata: 'array', speed: speed || 158, pitch: pitch || 48, wordgap: 1 });
    const buf = new Uint8Array(a).buffer; self.postMessage({ id, wav: buf }, [buf]);
  } catch (err) { self.postMessage({ id, error: String(err) }); }
};
