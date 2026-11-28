"""Pre-record the turn-by-turn voice prompts (no street names) with Piper (en_US-joe-medium, CC0)
into one MP3 sprite: data/voice.mp3 + data/voice.json {key: [start, end, text]}.
At run time the app joins clips, e.g. "In 500 feet," + "turn left." or "At the light," + "turn left now."
Usage: python3 tools/build-voice.py <model.onnx>   (pip install piper-tts lameenc; model config <model>.onnx.json)"""
import sys, json, io, wave, lameenc
from piper import PiperVoice
from piper.config import SynthesisConfig
v = PiperVoice.load(sys.argv[1]); cfg = SynthesisConfig(length_scale=0.95)
P = {}
# distances
for ft in range(100, 900, 100): P[f'ft{ft}'] = f'In {ft} feet,'
P['mi0.25'] = 'In a quarter mile,'; P['mi0.5'] = 'In half a mile,'; P['mi0.75'] = 'In three quarters of a mile,'; P['mi1'] = 'In 1 mile,'
for h in range(3, 21): x = h / 2; P[f'mi{x:g}'] = f'In {x:g} miles,'
for x in (12, 15, 20, 25, 30, 40, 50): P[f'mi{x}'] = f'In {x} miles,'
for mt in range(50, 1000, 50): P[f'm{mt}'] = f'In {mt} meters,'
P['km1'] = 'In 1 kilometer,'
for h in range(3, 21): x = h / 2; P[f'km{x:g}'] = f'In {x:g} kilometers,'
for x in (12, 15, 20, 25, 30, 40, 50): P[f'km{x}'] = f'In {x} kilometers,'
# actions: plain ("turn left."), now ("turn left now."), then ("then turn left.")
A = {'turn_left': 'turn left', 'turn_right': 'turn right', 'bear_left': 'take a slight left', 'bear_right': 'take a slight right',
     'sharp_left': 'make a sharp left', 'sharp_right': 'make a sharp right', 'uturn': 'make a U-turn',
     'keep_left': 'keep left', 'keep_right': 'keep right', 'straight': 'continue straight',
     'exit_left': 'take the exit on the left', 'exit_right': 'take the exit on the right', 'exit': 'take the exit',
     'ramp_left': 'take the ramp on the left', 'ramp_right': 'take the ramp on the right', 'merge': 'merge onto the highway',
     'leave_road': 'leave the road and continue to your destination',
     'dest_left': 'your destination is on the left', 'dest_right': 'your destination is on the right', 'dest_ahead': 'your destination is ahead'}
for k, t in A.items():
    P[k] = t[0].upper() + t[1:] + '.'
    if not k.startswith('dest') and k != 'leave_road': P[k + '_now'] = t[0].upper() + t[1:] + ' now.'
    P['then_' + k] = 'Then ' + t + '.'
P.update({'at_light': 'At the traffic light,', 'arrived': 'You have reached your destination.', 'arrive_dest': 'You have reached your destination.',
  'start': 'Starting route.', 'to_road': 'Drive to the road.', 'rerouting': 'Recalculating your route.', 'new_route': 'New route.', 'route_updated': 'Route updated.',
  'voice_on': 'Voice guidance on.', 'taking_back': 'Switching to back roads.', 'taking_fast': 'Switching to the fastest route.',
  'detouring': 'Finding a way around the road ahead.', 'detours_cleared': 'Back to the usual route.', 'longer': 'This way is longer.',
  'faster': 'This way is faster.', 'same': 'About the same time.', 'continue': 'Continue on the route.', 'gps_weak': 'GPS signal is weak.'})
SR = 22050
mp3 = bytearray(); idx = {}
import numpy as np
OUT_SR = 16000
def enc(pcm):
    x = np.frombuffer(pcm, np.int16).astype(np.float32); n = int(len(x) * OUT_SR / SR)
    y = np.interp(np.arange(n) * SR / OUT_SR, np.arange(len(x)), x).astype(np.int16)  # 22.05 -> 16 kHz (speech band is below 8 kHz)
    e = lameenc.Encoder(); e.set_bit_rate(24); e.set_in_sample_rate(OUT_SR); e.set_channels(1); e.set_quality(2)
    return e.encode(y.tobytes()) + e.flush()
# 10 s of near-silence (tiny dither, inaudible) for the lock-screen / Dynamic Island keep-alive track
import random; random.seed(1)
data = enc(np.array([random.randint(-2, 2) for _ in range(SR * 10)], np.int16).tobytes()); idx['silence'] = [len(mp3), len(mp3) + len(data), '']; mp3 += data
for k, t in P.items():
    b = io.BytesIO()
    with wave.open(b, 'wb') as w: v.synthesize_wav(t, w, syn_config=cfg)
    b.seek(0)
    with wave.open(b) as w: pcm = w.readframes(w.getnframes())
    # trim leading/trailing near-silence, keep a short natural pause
    import array; a = array.array('h', pcm); th = 300
    s = next((i for i, x in enumerate(a) if abs(x) > th), 0); e = len(a) - next((i for i, x in enumerate(reversed(a)) if abs(x) > th), 0)
    a = a[max(0, s - int(SR * .09)):min(len(a), e + int(SR * (.12 if t.endswith(',') else .06)))]
    data = enc(a.tobytes()); idx[k] = [len(mp3), len(mp3) + len(data), t]; mp3 += data
open('data/voice.mp3', 'wb').write(mp3); json.dump(idx, open('data/voice.json', 'w'), separators=(',', ':'))
print(len(P), 'clips', len(mp3) // 1024, 'KB')
