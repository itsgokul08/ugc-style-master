"""Synthesize the 20s soundtrack for the Spotify promo.

120 BPM so every scene cut lands on a beat. Everything is generated from scratch with
numpy (no samples): supersaw pad with sidechain pumping, plucky arp with ping-pong
delay, kick/clap/hats, sub bass, and SFX (whooshes, UI clicks, pops, counter ticks,
impact, shimmer) timed to the picture.

Usage: python3 scripts/make_audio.py  ->  public/soundtrack.wav
"""

import os
import wave

import numpy as np

SR = 48000
DUR = 20.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(7)

t_all = np.arange(N) / SR


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    octave = int(name[-1])
    semis = names[name[:-1]] + 12 * (octave + 1)
    return 440.0 * 2 ** ((semis - 69) / 12)


def place(buf, sig, at, gain=1.0):
    """Mix mono or stereo `sig` into stereo `buf` starting at time `at`."""
    i = int(at * SR)
    if i >= len(buf):
        return
    if sig.ndim == 1:
        sig = np.stack([sig, sig], axis=1)
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n] * gain


def fft_filter(x, lo=None, hi=None, order=2):
    """Zero-phase-ish spectral shelf filter (smooth Butterworth-like magnitude)."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if hi is not None:
        g *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo is not None:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * g, n)


def sweep_noise(dur, f0, f1, width=0.6, curve=1.0):
    """Noise through a band-pass whose center glides f0 -> f1 (log). STFT overlap-add."""
    n = int(dur * SR)
    win, hop = 2048, 512
    noise = rng.standard_normal(n + win)
    out = np.zeros(n + win)
    w = np.hanning(win)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    lf = np.log(np.maximum(freqs, 1))
    frames = (n) // hop + 1
    for k in range(frames):
        a = k * hop
        seg = noise[a:a + win] * w
        p = (k / max(1, frames - 1)) ** curve
        fc = f0 * (f1 / f0) ** p
        mask = np.exp(-((lf - np.log(fc)) ** 2) / (2 * width ** 2))
        out[a:a + win] += np.fft.irfft(np.fft.rfft(seg) * mask, win) * w
    return out[:n] / (np.max(np.abs(out[:n])) + 1e-9)


def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = max(1, min(na, n))
    e[:na] = np.linspace(0, 1, na)
    nd = max(1, min(nd, n - na))
    e[na:na + nd] = np.linspace(1, s, nd)
    if nr > 0 and nr < n:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ---------------------------------------------------------------- timeline
CHORDS = [
    (0, 2, ['A3', 'C4', 'E4', 'G4'], 'A1'),
    (2, 4, ['F3', 'A3', 'C4', 'E4'], 'F1'),
    (4, 6, ['C4', 'E4', 'G4', 'D5'], 'C2'),
    (6, 8, ['G3', 'B3', 'D4', 'A4'], 'G1'),
    (8, 10, ['A3', 'C4', 'E4', 'G4'], 'A1'),
    (10, 12, ['F3', 'A3', 'C4', 'E4'], 'F1'),
    (12, 14, ['C4', 'E4', 'G4', 'D5'], 'C2'),
    (14, 16, ['G3', 'B3', 'D4', 'A4'], 'G1'),
    (16, 17, ['F3', 'A3', 'C4', 'G4'], 'F1'),
    (17, 20, ['C3', 'G3', 'B3', 'D4', 'E4'], 'C2'),
]

KICKS_SOFT = [1.0, 1.5, 2.0, 2.5]
KICKS = [3.0 + i * BEAT for i in range(int((16.5 - 3.0) / BEAT))]
KICK_TIMES = KICKS_SOFT + KICKS + [17.0, 18.0, 19.0]


def sidechain_curve():
    g = np.ones(N)
    for k in KICKS + [17.0]:
        i = int(k * SR)
        n = int(0.42 * SR)
        n = min(n, N - i)
        tt = np.arange(n) / SR
        g[i:i + n] = np.minimum(g[i:i + n], 1 - 0.62 * np.exp(-tt / 0.11))
    return g


# ---------------------------------------------------------------- instruments
def pad():
    out = np.zeros((N, 2))
    # Filter cutoff automation
    cutoff = np.interp(t_all, [0, 2.9, 3.0, 10.4, 11.0, 16.0, 16.95, 17.0, 20], [380, 1500, 2400, 2400, 3200, 2600, 5200, 3400, 1800])
    for start, end, notes, _ in CHORDS:
        a, b = int(start * SR), int(min(DUR, end + 0.25) * SR)
        n = b - a
        tt = np.arange(n) / SR
        fc = cutoff[a:b]
        env = np.minimum(1, tt / 0.06) * np.clip((end + 0.25 - start - tt) / 0.25, 0, 1)
        for ni, nm in enumerate(notes):
            f = note(nm)
            for vi, (det, pan) in enumerate([(-0.11, 0.2), (0.0, 0.5), (0.12, 0.8)]):
                fv = f * 2 ** (det / 12)
                ph = rng.uniform(0, 2 * np.pi)
                sig = np.zeros(n)
                for h in range(1, 28):
                    fh = fv * h
                    if fh > 16000:
                        break
                    w = (1 / h) / np.sqrt(1 + (fh / fc) ** 4)
                    sig += w * np.sin(2 * np.pi * fh * tt + ph * h)
                sig *= env * 0.06
                out[a:b, 0] += sig * (1 - pan)
                out[a:b, 1] += sig * pan
    out *= sidechain_curve()[:, None]
    # intro swell
    out *= np.interp(t_all, [0, 0.6, 20], [0.0, 1.0, 1.0])[:, None]
    return out


def bass():
    out = np.zeros(N)
    for start, end, _, root in CHORDS:
        f = note(root) * 2  # octave 2
        if start < 3:
            continue
        if start >= 17:
            n = int((DUR - start) * SR)
            tt = np.arange(n) / SR
            sig = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)
            out[int(start * SR):int(start * SR) + n] += np.tanh(sig * 1.4) * np.exp(-tt / 1.6) * 0.42
            continue
        # driving 8ths, skipping the downbeat (kick owns it)
        tcur = start
        while tcur < min(end, 16.5) - 1e-6:
            if abs((tcur / BEAT) - round(tcur / BEAT)) > 1e-6:  # offbeat 8th
                n = int(0.23 * SR)
                tt = np.arange(n) / SR
                sig = np.sin(2 * np.pi * f * tt) + 0.45 * np.sin(4 * np.pi * f * tt + 0.3) + 0.2 * np.sin(6 * np.pi * f * tt)
                e = np.minimum(1, tt / 0.004) * np.exp(-tt / 0.12)
                place_mono(out, np.tanh(sig * 1.8) * e * 0.36, tcur)
            tcur += BEAT / 2
    return out


def place_mono(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n] * gain


def kick(power=1.0, length=0.45):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = 46 + 120 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt / (0.16 * power))
    click = rng.standard_normal(n) * np.exp(-tt / 0.003) * 0.35
    click = fft_filter(click, lo=1500, hi=9000)
    return np.tanh((body + click) * 1.6) * 0.95


def clap():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    e = np.zeros(n)
    for off in [0, 0.011, 0.022]:
        i = int(off * SR)
        e[i:] += np.exp(-(tt[: n - i]) / 0.012)
    e += 0.5 * np.exp(-tt / 0.12)
    sig = fft_filter(noise * e, lo=900, hi=6000)
    return sig / (np.max(np.abs(sig)) + 1e-9) * 0.5


def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    tt = np.arange(n) / SR
    sig = fft_filter(rng.standard_normal(n), lo=7000, hi=16000) * np.exp(-tt / (0.07 if open_ else 0.015))
    return sig / (np.max(np.abs(sig)) + 1e-9) * (0.22 if open_ else 0.14)


def pluck(f, length=0.5, bright=1.0):
    n = int(length * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for h in range(1, 12):
        sig += (1 / h ** 1.3) * np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (6 + h * 3.5 / bright))
    return sig * np.minimum(1, tt / 0.002) * 0.22


def arp():
    out = np.zeros((N, 2))
    step = BEAT / 2
    k = 0
    for start, end, notes, _ in CHORDS:
        if start >= 16:
            break
        tones = [note(nm) * 2 for nm in notes[:3]] + [note(notes[0]) * 4]
        seq = [0, 1, 2, 3, 2, 1, 3, 2]
        tcur = max(start, 0.5)
        while tcur < end - 1e-6:
            f = tones[seq[k % len(seq)]]
            g = 0.9 if tcur < 3 else 0.5
            p = pluck(f, 0.45, 1.2)
            pan = 0.3 if k % 2 else 0.7
            place(out, np.stack([p * (1 - pan), p * pan], axis=1), tcur, g)
            k += 1
            tcur += step
    # ping-pong dotted-8th delay
    d = int(0.375 * SR)
    wet = np.zeros_like(out)
    src = out.copy()
    for rep in range(1, 5):
        g = 0.38 ** rep
        shifted = np.zeros_like(out)
        shifted[d * rep:] = src[:-d * rep]
        if rep % 2:
            shifted = shifted[:, ::-1]
        wet += shifted * g
    return out + fft_filter_st(wet, hi=4500)


def fft_filter_st(x, lo=None, hi=None):
    return np.stack([fft_filter(x[:, 0], lo, hi), fft_filter(x[:, 1], lo, hi)], axis=1)


def whoosh(dur, f0=300, f1=6000, gain=0.5, curve=1.0):
    sig = sweep_noise(dur, f0, f1, 0.55, curve)
    tt = np.arange(len(sig)) / SR
    e = (tt / dur) ** 2.2
    e *= np.clip((dur - tt) / 0.02, 0, 1)
    return sig * e * gain


def ui_click():
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt / 0.004) * 0.5
    s += fft_filter(rng.standard_normal(n), lo=2000, hi=10000) * np.exp(-tt / 0.003) * 0.4
    return s


def pop(f0=900, f1=1700, length=0.09, gain=0.32):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = f0 + (f1 - f0) * (1 - np.exp(-tt / 0.02))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.minimum(1, tt / 0.002) * np.exp(-tt / 0.03) * gain


def tick(f=3200):
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.005) * 0.18


def chime(freqs, length=1.6, gain=0.18):
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for i, f in enumerate(freqs):
        s += np.sin(2 * np.pi * f * tt + i) * np.exp(-tt / (0.5 + 0.1 * i))
        s += 0.3 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.15)
    return s * np.minimum(1, tt / 0.003) * gain / len(freqs) * 2


def impact():
    n = int(2.6 * SR)
    tt = np.arange(n) / SR
    f = 34 + 40 * np.exp(-tt / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.9)
    crash = fft_filter(rng.standard_normal(n), lo=3000, hi=14000) * np.exp(-tt / 0.7)
    crash /= np.max(np.abs(crash)) + 1e-9
    body = fft_filter(rng.standard_normal(n), lo=80, hi=900) * np.exp(-tt / 0.18)
    body /= np.max(np.abs(body)) + 1e-9
    return np.tanh(sub * 1.3) * 0.9 + crash * 0.22 + body * 0.35


def riser(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 220 * 2 ** (tt / dur * 2.5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = sum(np.sin(ph * h) / h for h in range(1, 7))
    e = (tt / dur) ** 2.5
    return tone * e * 0.1 + whoosh(dur, 200, 9000, 0.35, 1.4)


def reverb(x, rt=2.2, mix=0.25):
    n_ir = int(rt * SR)
    tt = np.arange(n_ir) / SR
    decay = np.exp(-tt * 6.9 / rt)
    out = np.zeros_like(x)
    size = 1 << int(np.ceil(np.log2(len(x) + n_ir)))
    for ch in range(2):
        ir = rng.standard_normal(n_ir) * decay
        ir = fft_filter(ir, lo=200, hi=6000)
        ir /= np.sqrt(np.sum(ir ** 2))
        y = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[: len(x)]
        out[:, ch] = y
    return out * mix


# ---------------------------------------------------------------- arrangement
def build():
    music = np.zeros((N, 2))
    music += pad()
    music += arp() * 0.8
    b = bass()
    music += np.stack([b, b], axis=1)

    drums = np.zeros((N, 2))
    for k in KICKS_SOFT:
        place(drums, fft_filter(kick(0.8), hi=500), k, 0.45)
    for k in KICKS:
        place(drums, kick(), k, 0.9)
    for k in [18.0, 19.0]:
        place(drums, kick(1.2), k, 0.55)
    for i in range(int((16.0 - 3.0) / BEAT)):
        tb = 3.0 + i * BEAT
        if i % 2 == 1:
            c = clap()
            place(drums, np.stack([c * 0.9, c], axis=1), tb, 0.75)
    for i in range(int((16.5 - 3.0) / (BEAT / 2))):
        th = 3.0 + i * BEAT / 2
        if i % 2 == 1:
            h = hat(open_=True)
            place(drums, np.stack([h * 0.7, h], axis=1), th, 0.9)
    for i in range(int((16.0 - 6.0) / (BEAT / 4))):
        th = 6.0 + i * BEAT / 4
        if i % 4 in (1, 3):
            h = hat()
            place(drums, np.stack([h, h * 0.7], axis=1), th, 0.55 + 0.25 * (i % 8 == 3))

    sfx = np.zeros((N, 2))
    # transitions
    place(sfx, whoosh(0.5, 400, 7000, 0.55), 2.5)
    place(sfx, whoosh(0.45, 300, 5000, 0.45), 5.55)
    place(sfx, whoosh(0.75, 150, 9000, 0.7, 1.3), 10.25)
    place(sfx, whoosh(0.45, 2500, 300, 0.45), 14.05)
    place(sfx, riser(1.5), 15.5)
    # hook: the dot pop
    place(sfx, pop(300, 900, 0.18, 0.4), 0.05)
    # moods: card landings and word swaps
    for at in [3.12, 3.75, 4.25, 4.75]:
        place(sfx, pop(700, 1400, 0.1, 0.25), at)
        place(sfx, whoosh(0.18, 2000, 6000, 0.18), at - 0.16)
    # product: click and chip pops
    place(sfx, ui_click(), 8.5, 1.2)
    place(sfx, whoosh(0.5, 3500, 400, 0.3), 8.6)  # camera pulls back
    for i, at in enumerate([8.85, 8.97, 9.09, 9.21]):
        place(sfx, pop(1000 + i * 120, 1800 + i * 160, 0.09, 0.22), at)
    # DJ: sparkle entrance
    place(sfx, chime([note('E6'), note('G6'), note('B6'), note('D7')], 1.4, 0.22), 11.08)
    for i, at in enumerate([11.7, 11.86, 12.02]):  # DJ callouts
        place(sfx, pop(800 + i * 150, 1500 + i * 200, 0.1, 0.2), at)
    # stats: counter ticks that slow down
    tt_ = 14.88
    gap = 0.03
    while tt_ < 16.1:
        place(sfx, tick(2800 + rng.uniform(-200, 200)), tt_, 0.7)
        tt_ += gap
        gap *= 1.07
    # outro
    imp = impact()
    place(sfx, np.stack([imp, imp], axis=1), 17.0, 0.95)
    place(sfx, whoosh(0.4, 600, 4000, 0.28), 17.75)
    place(sfx, chime([note('C6'), note('E6'), note('G6'), note('B6')], 1.6, 0.2), 18.55)
    place(sfx, chime([note('G6'), note('C7'), note('E7')], 1.2, 0.16), 19.35)

    wet = reverb(music * 0.6 + sfx * 0.5, rt=2.4, mix=0.32)
    mix = music + drums + sfx + wet
    # gentle master glue + limiter
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    fade = np.clip((DUR - t_all) / 0.5, 0, 1)
    mix *= fade[:, None]
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 10 ** (-1.0 / 20)
    return mix


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(here, '..', 'public', 'soundtrack.wav')
    mix = build()
    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('wrote', os.path.normpath(out_path))


if __name__ == '__main__':
    main()
