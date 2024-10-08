let synth;
let effect;
const data = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
let html = '';

const masterVolume = new Tone.Volume(0).toDestination();

setSynth('PolySynth');
setEffect('None');

document.getElementById('synthSelector').addEventListener('change', function() {
    setSynth(this.value);
});

document.getElementById('effectSelector').addEventListener('change', function() {
    setEffect(this.value);
});

document.getElementById('volumeControl').addEventListener('input', function() {
    const volume = (parseInt(this.value) - 50) / 2; // 볼륨 값을 Tone.Volume에 맞게 조정
    masterVolume.volume.value = volume;
});

document.getElementById('reverbDecay').addEventListener('input', function() {
    if (effect && effect instanceof Tone.Reverb) {
        effect.decay = parseFloat(this.value);
        effect.generate();
    }
});

document.getElementById('delayTime').addEventListener('input', function() {
    if (effect && effect instanceof Tone.FeedbackDelay) {
        effect.delayTime.value = parseFloat(this.value) / 1000;
    }
});

document.getElementById('chorusDepth').addEventListener('input', function() {
    if (effect && effect instanceof Tone.Chorus) {
        effect.depth.value = parseFloat(this.value);
    }
});

document.getElementById('distortion').addEventListener('input', function() {
    if (effect && effect instanceof Tone.Distortion) {
        effect.distortion = parseFloat(this.value);
    }
});

function setSynth(synthType) {
    if (synth) synth.disconnect();

    switch (synthType) {
        case 'FMSynth':
            synth = new Tone.FMSynth();
            break;
        case 'AMSynth':
            synth = new Tone.AMSynth();
            break;
        case 'MonoSynth':
            synth = new Tone.MonoSynth();
            break;
        case 'PluckSynth':
            synth = new Tone.PluckSynth();
            break;
        case 'MembraneSynth':
            synth = new Tone.MembraneSynth();
            break;
        case 'NoiseSynth':
            synth = new Tone.NoiseSynth();
            break;
        default:
            synth = new Tone.PolySynth(Tone.Synth);
            break;
    }
    synth.connect(masterVolume);
    applyEffects();
}


function setEffect(effectType) {
    if (effect) {
        effect.disconnect();
        effect.dispose();
    }

    document.getElementById('effectControls').style.display = (effectType === 'None') ? 'none' : 'block';

    switch (effectType) {
        case 'Reverb':
            effect = new Tone.Reverb({
                decay: parseFloat(document.getElementById('reverbDecay').value),
                wet: 0.5
            });
            effect.generate();
            break;
        case 'Delay':
            effect = new Tone.FeedbackDelay({
                delayTime: parseFloat(document.getElementById('delayTime').value) / 1000,
                feedback: 0.5,
                wet: 0.5
            });
            break;
        case 'Chorus':
            effect = new Tone.Chorus({
                depth: parseFloat(document.getElementById('chorusDepth').value),
                wet: 0.5
            });
            break;
        case 'Distortion':
            effect = new Tone.Distortion({
                distortion: parseFloat(document.getElementById('distortion').value),
                wet: 0.5
            });
            break;
        default:
            effect = null;
            break;
    }
    applyEffects();
}

function applyEffects() {
    if (synth) {
        if (effect) {
            synth.chain(effect, masterVolume);
        } else {
            synth.connect(masterVolume);
        }
    }
}


for (var octave = 0; octave < 2; octave++) {
    for (var i = 0; i < data.length; i++) {
        var note = data[i];
        var hasSharp = (['E', 'B'].indexOf(note) == -1);

        html += `<div class='whitenote' 
                    onmousedown='noteDown(this, false, event)' 
                    onmouseup='noteUp(this,false)' 
                    onmouseleave='noteUp(this,false)' 
                    data-note='${note + (octave+4)}'>`;

        if (hasSharp) {
            html += `<div class='blacknote' 
                        onmousedown='noteDown(this, true, event)' 
                        onmouseup='noteUp(this, true)' 
                        onmouseleave='noteUp(this,true)' 
                        data-note='${note + '#' + (octave+4)}'></div>`;
        }

        html += `</div>`;
    }
}

document.getElementById('container').innerHTML = html;

function noteUp(elem, isSharp) {
    elem.style.background = isSharp ? '#777' : '';
}

function noteDown(elem, isSharp, event) {
    var note = elem.dataset.note;
    elem.style.background = isSharp ? 'black' : '#ccc';
    synth.triggerAttackRelease(note, "16n");
    event.stopPropagation();
}

const keyMap = {
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4',
    'k': 'C5',
    'o': 'C#5',
    'l': 'D5',
    'p': 'D#5',
    ';': 'E5',
    '1': 'F5',
    '2': 'F#5',
    '3': 'G5',
    '4': 'G#5',
    '5': 'A5',
    '6': 'A#5',
    '7': 'B5'
    // 필요에 따라 더 추가 가능
};

// 현재 눌린 키를 추적하여 반복 방지
const pressedKeys = new Set();

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (keyMap[key] && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        const note = keyMap[key];
        synth.triggerAttackRelease(note, "16n");

        // 해당 노트의 HTML 요소 활성화
        const noteElem = document.querySelector(`[data-note='${note}']`);
        if (noteElem) {
            noteElem.style.background = note.includes('#') ? 'grey' : '#ccc';
        }
    }
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (keyMap[key] && pressedKeys.has(key)) {
        pressedKeys.delete(key);
        const note = keyMap[key];

        // 해당 노트의 HTML 요소 비활성화
        const noteElem = document.querySelector(`[data-note='${note}']`);
        if (noteElem) {
            noteElem.style.background = note.includes('#') ? 'black' : 'white';
        }
    }
});
