const canvas = document.getElementById('canvas1');
const audio1 = document.getElementById('audio1');
const playPauseButton = document.getElementById('playPauseButton');
const fileUpload = document.getElementById('fileupload');
const fileUploadLabel = document.getElementById('fileUploadLabel');
const micButton = document.getElementById('micButton');

const controlPanel = document.getElementById('control-panel');
const controls = document.querySelectorAll('.control');
const contentItems = document.querySelectorAll('.content-item');

const startColorControl = document.getElementById('start-color-control');
const endColorControl = document.getElementById('end-color-control');
const blurControl = document.getElementById('blur-control');
const opacityControl = document.getElementById('opacity-control');

const startColorContent = document.getElementById('start-color-content');
const endColorContent = document.getElementById('end-color-content');
const blurContent = document.getElementById('blur-content');
const opacityContent = document.getElementById('opacity-content');

const startColorPreview = document.getElementById('start-color-preview');
const endColorPreview = document.getElementById('end-color-preview');
const startColorPalette = document.getElementById('start-color-palette');
const endColorPalette = document.getElementById('end-color-palette');

const blurSlider = document.getElementById('blur-slider');
const opacitySlider = document.getElementById('opacity-slider');


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

let audioContext;
let audioSource;
let micSource;
let analyser;
let animationId;
let isPlaying = false;

const settings = {
    startColor: '#D4E3FE',
    endColor: '#0433FF',
    blur: 7,
    opacity: 1
};

// 컬러 프리뷰 초기 색상 설정
startColorPreview.style.backgroundColor = settings.startColor;
endColorPreview.style.backgroundColor = settings.endColor;

// 슬라이더 초기 값 설정
blurSlider.value = settings.blur;
opacitySlider.value = settings.opacity * 100; // 0 ~ 1 사이 값을 0 ~ 100으로 변환

applySettings();

// 색상 배열 정의 (업데이트된 부분)
const colorArray = [
    '#000000', '#0433FF', '#1A0A53', '#942192', '#791A3E', '#5C0000', '#EE4D31', '#FEBB25', '#005819',
    '#444444', '#53D5FD', '#8231FE', '#A048FE', '#D357FE', '#E4001D', '#FB7D56', '#FECC5A', '#459D34',
    '#929292', '#00FDFF', '#74A7FE', '#B18CFE', '#FF40FF', '#E63B7A', '#F6A680', '#FFF76B', '#79ED61',
    '#ffffff', '#BAF6FC', '#D4E3FE', '#D9CAFE', '#F1C9FE', '#F4A4C0', '#FFC4AB', '#FFE4A8', '#CCE8B5'
];

function generatePalette(paletteElement, colorArray) {
    paletteElement.innerHTML = ''; // 기존 내용 초기화
    colorArray.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.classList.add('color-option');
        colorOption.style.backgroundColor = color;
        paletteElement.appendChild(colorOption);
    });
}

// 팔레트 생성
generatePalette(startColorPalette, colorArray);
generatePalette(endColorPalette, colorArray);

// 컨트롤 클릭 이벤트 추가
controls.forEach(control => {
    control.addEventListener('click', () => {
        // 모든 콘텐츠 아이템 숨기기
        contentItems.forEach(item => {
            item.classList.remove('active');
        });

        // 컨트롤 패널 확장 상태 토글
        if (controlPanel.classList.contains('expanded')) {
            controlPanel.classList.remove('expanded');
        } else {
            controlPanel.classList.add('expanded');

            // 클릭한 컨트롤에 해당하는 콘텐츠 아이템 찾기
            switch (control.id) {
                case 'start-color-control':
                    startColorContent.classList.add('active');
                    break;
                case 'end-color-control':
                    endColorContent.classList.add('active');
                    break;
                case 'blur-control':
                    blurContent.classList.add('active');
                    break;
                case 'opacity-control':
                    opacityContent.classList.add('active');
                    break;
            }
        }
    });
});

// 시작 색상 팔레트 클릭 이벤트
startColorPalette.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-option')) {
        const color = e.target.style.backgroundColor;
        settings.startColor = rgbToHex(color);
        startColorPreview.style.backgroundColor = settings.startColor;
        applySettings();
        // 팔레트 닫기
        controlPanel.classList.remove('expanded');
        startColorContent.classList.remove('active');
    }
});

// 끝 색상 팔레트 클릭 이벤트
endColorPalette.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-option')) {
        const color = e.target.style.backgroundColor;
        settings.endColor = rgbToHex(color);
        endColorPreview.style.backgroundColor = settings.endColor;
        applySettings();
        // 팔레트 닫기
        controlPanel.classList.remove('expanded');
        endColorContent.classList.remove('active');
    }
});

// 슬라이더 변경 이벤트
blurSlider.addEventListener('input', () => {
    settings.blur = blurSlider.value;
    applySettings();
});

opacitySlider.addEventListener('input', () => {
    settings.opacity = opacitySlider.value;
    applySettings();
});

function applySettings() {
    canvas.style.filter = `blur(${settings.blur}px)`;
}

// RGB 문자열을 HEX로 변환
function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g).map(Number);
    return '#' + rgbValues.map(val => {
        const hex = val.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// HEX를 RGB 객체로 변환
function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

// 색상 보간 함수
function interpolateColor(color1, color2, factor) {
    const result = {
        r: Math.round(color1.r + factor * (color2.r - color1.r)),
        g: Math.round(color1.g + factor * (color2.g - color1.g)),
        b: Math.round(color1.b + factor * (color2.b - color1.b))
    };
    return result;
}

// 비주얼라이저 그리기 함수
function drawVisualizer() {
    if (!analyser) {
        console.error('AnalyserNode가 초기화되지 않았습니다.');
        return;
    }

    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = (canvas.width / 2) / bufferLength;

    function animate() {
        if (!isPlaying) {
            cancelAnimationFrame(animationId);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        const startRGB = hexToRgb(settings.startColor);
        const endRGB = hexToRgb(settings.endColor);

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 2;

            // 색상 보간
            const factor = i / bufferLength;
            const color = interpolateColor(startRGB, endRGB, factor);

            // 막대 색상 설정
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${settings.opacity})`;

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(i + Math.PI * 2 / bufferLength);
            ctx.fillRect(0, 0, barWidth, barHeight);
            ctx.restore();
        }
        animationId = requestAnimationFrame(animate);
    }
    animate()

}

// AudioContext 생성 함수
function createAudioContext() {
    if (!audioContext) {
        audioContext = new(window.AudioContext || window.webkitAudioContext)();
    }
}

// 재생/일시정지 버튼 기능
playPauseButton.addEventListener('click', function() {
    if (audio1.paused) {
        // AudioContext 상태가 Suspended인 경우 resume
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        audio1.play()
            .then(() => {
                playPauseButton.textContent = 'Pause';
                isPlaying = true;

                if (!audioSource) {
                    audioSource = audioContext.createMediaElementSource(audio1);
                    analyser = audioContext.createAnalyser();
                    audioSource.connect(analyser);
                    analyser.connect(audioContext.destination);
                }

                drawVisualizer();
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                alert('오디오를 재생할 수 없습니다.');
            });
    } else {
        audio1.pause();
        playPauseButton.textContent = 'Play';
        isPlaying = false;
    }
});


window.addEventListener('load', function() {
    // 자동 재생을 제거하고, 사용자 상호작용 시 재생하도록 합니다.
    // AudioContext 초기화는 이미 playPauseButton 클릭 시 이루어지므로 여기서는 생략합니다.
    createAudioContext();
});

// 파일 업로드로 재생 및 시각화
fileUpload.addEventListener('change', function() {
    const files = this.files;
    if (files.length === 0) return;
    const file = files[0];

    createAudioContext();

    const fileURL = URL.createObjectURL(file);
    audio1.src = fileURL;
    audio1.load();
    audio1.play()
        .then(() => {
            playPauseButton.textContent = 'Pause';
            isPlaying = true;

            // MediaElementSource는 한 번만 생성되므로, 이미 생성된 경우 연결을 다시 하지 않습니다.
            if (!audioSource) {
                audioSource = audioContext.createMediaElementSource(audio1);
                analyser = audioContext.createAnalyser();
                audioSource.connect(analyser);
                analyser.connect(audioContext.destination);
            } else {
                // 기존에 생성된 audioSource를 재사용할 경우, analyser가 이미 연결되어 있어야 합니다.
                if (!analyser) {
                    analyser = audioContext.createAnalyser();
                    audioSource.connect(analyser);
                    analyser.connect(audioContext.destination);
                }
            }

            drawVisualizer();
        })
        .catch(error => {
            console.error('Error playing uploaded audio:', error);
            playPauseButton.textContent = 'Play';
        });
});


// 마이크로 음성 입력 받아 분석 및 시각화
micButton.addEventListener('click', function() {
    createAudioContext();
    // 마이크 사용 시 기존 오디오 소스와 연결 해제
    if (audioSource) {
        audioSource.disconnect();
        audioSource = null;
    }

    // 오디오가 재생 중이면 일시정지
    if (audio1 && !audio1.paused) {
        audio1.pause();
        playPauseButton.textContent = 'Play';
        isPlaying = false;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            micSource = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            micSource.connect(analyser);
            analyser.connect(audioContext.destination);

            isPlaying = true;
            drawVisualizer();
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            alert('마이크 접근을 허용하지 않았습니다.');
        });
});

// 오디오 종료 시 처리
audio1.addEventListener('ended', function() {
    playPauseButton.textContent = 'Play';
    isPlaying = false;
});

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


// 초기 설정 적용
applySettings();