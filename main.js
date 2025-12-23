const steps = [
    { icon: '🚀', type: 'init', title: 'App Initialization', desc: 'Load config, create supervisor, initialize services (Camera, YOLO, TTS, Vosk)' },
    { icon: '🎤', type: 'listen', title: 'Listening Mode', desc: 'Vosk processes microphone audio, waiting for trigger words' },
    { icon: '🗣️', type: 'voice', title: 'Voice Command Detected', desc: 'Trigger word recognized: "start", "detect", "see", or "look"' },
    { icon: '📸', type: 'process', title: 'Capture & Process', desc: 'Camera captures frame, YOLO detects objects (confidence > 0.5)' },
    { icon: '🔊', type: 'speak', title: 'Generate Description', desc: 'Group objects, create natural language, speak via TTS' },
    { icon: '✓', type: 'complete', title: 'Return to Listening', desc: '3-second cooldown activated, back to listening mode' }
];

const objects = [
    { name: 'Person', x: 50, y: 80, w: 90, h: 180 },
    { name: 'Laptop', x: 220, y: 200, w: 120, h: 80 },
    { name: 'Cup', x: 350, y: 230, w: 50, h: 60 }
];

const flowContainer = document.getElementById('flowSteps');
const sceneStage = document.getElementById('sceneStage');
const statusText = document.getElementById('statusText');

function createFlowSteps() {
    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'flow-step';
        stepDiv.id = `step-${index}`;
        stepDiv.innerHTML = `
<div class="step-icon ${step.type}">
    ${step.icon}
</div>
<div class="step-content ${step.type}">
    <div class="step-title">${step.title}</div>
    <div class="step-desc">${step.desc}</div>
</div>
`;
        flowContainer.appendChild(stepDiv);
    });
}

function activateStep(index) {
    document.querySelectorAll('.flow-step').forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });
}

function showInitScreen() {
    sceneStage.innerHTML = `
<div class="init-screen active">
    <div class="init-icon">⚙️</div>
    <div class="init-text">Initializing VisionX...</div>
    <div class="init-progress">
        <div class="init-progress-bar"></div>
    </div>
</div>
`;
    statusText.textContent = 'Initializing...';
}

function showListeningScreen() {
    sceneStage.innerHTML = `
<div class="listening-screen active">
    <div class="mic-icon-large">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
        </svg>
    </div>
    <div class="listening-text">Listening...</div>
    <div class="trigger-words">Say: "start", "detect", "see", or "look"</div>
</div>
`;
    statusText.textContent = 'Listening for voice command';
}

function showVoiceCommandScreen() {
    sceneStage.innerHTML = `
<div class="voice-command-screen active">
    <div class="voice-wave">
        <div class="voice-circle"></div>
        <div class="voice-circle"></div>
        <div class="voice-circle"></div>
    </div>
    <div class="voice-text">"START"</div>
    <div class="trigger-words">Command recognized!</div>
</div>
`;
    statusText.textContent = 'Voice command detected';
}

function showDetectionScreen() {
    sceneStage.innerHTML = `
<div class="detection-screen active">
    <div class="camera-flash" id="cameraFlash"></div>
    <div id="detectionsContainer"></div>
</div>
`;
    statusText.textContent = 'Detecting objects...';

    const flash = document.getElementById('cameraFlash');
    flash.classList.add('active');

    setTimeout(() => {
        flash.classList.remove('active');
        const container = document.getElementById('detectionsContainer');

        objects.forEach((obj, i) => {
            setTimeout(() => {
                const box = document.createElement('div');
                box.className = 'detection-box';
                box.style.left = obj.x + 'px';
                box.style.top = obj.y + 'px';
                box.style.width = obj.w + 'px';
                box.style.height = obj.h + 'px';
                box.style.animation = 'boxDraw 0.5s ease forwards';

                const label = document.createElement('span');
                label.className = 'detection-label';
                label.textContent = obj.name;

                box.appendChild(label);
                container.appendChild(box);
            }, i * 300);
        });
    }, 300);
}

function showSpeakScreen() {
    const existingContent = sceneStage.innerHTML;
    sceneStage.innerHTML = existingContent + `
<div class="audio-wave active">
<div class="wave-bar"></div>
<div class="wave-bar"></div>
<div class="wave-bar"></div>
<div class="wave-bar"></div>
<div class="wave-bar"></div>
</div>
<div class="result-text active">
🔊 "I see a person, a laptop, and a cup"
</div>
`;
    statusText.textContent = 'Speaking result...';
}

function showCompleteScreen() {
    sceneStage.innerHTML = `
<div class="complete-screen active">
    <div class="complete-icon">✓</div>
    <div class="complete-text">Detection Complete</div>
    <div class="cooldown-timer">3-second cooldown active</div>
</div>
`;
    statusText.textContent = 'Ready for next command';
}

async function runCycle() {
    activateStep(0);
    showInitScreen();
    await sleep(2500);

    activateStep(1);
    showListeningScreen();
    await sleep(2500);

    activateStep(2);
    showVoiceCommandScreen();
    await sleep(2000);

    activateStep(3);
    showDetectionScreen();
    await sleep(2000);

    activateStep(4);
    showSpeakScreen();
    await sleep(2500);

    activateStep(5);
    showCompleteScreen();
    await sleep(2500);

    // Loop again
    runCycle();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Create steps on load
createFlowSteps();

// Scroll-triggered animation
const processSection = document.getElementById('processSection');
let animationStarted = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !animationStarted) {
            animationStarted = true;
            runCycle();
        }
    });
}, { threshold: 0.5 }); // Trigger when 50% visible

observer.observe(processSection);

// Vanta background (as before)
VANTA.NET({
    el: "#header",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x60a5fa,
    // backgroundColor: 0x111A2D,
    // backgroundColor: 0x10192D,
    backgroundColor: 0x10182C,
    backgroundAlpha: 1.0,
    points: 10.00,
    maxDistance: 22.00,
    spacing: 20.00,
    showDots: true
});
