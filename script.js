// 初始化元素
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 音频频谱分析器
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256; // 频谱精度（数值越小，频谱点越少）
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

// 圆形频谱参数
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = Math.min(centerX, centerY) * 0.8;

// 绘制频谱
function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // 清空画布
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制圆形频谱
    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const amplitude = dataArray[i] / 255 * radius;
        
        const x = centerX + Math.cos(angle) * (radius + amplitude);
        const y = centerY + Math.sin(angle) * (radius + amplitude);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = `hsl(${Date.now()/50 % 360}, 100%, 50%)`; // 动态颜色
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 处理自动播放限制
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = '暂停音乐';
    } else {
        audio.pause();
        playBtn.textContent = '点击播放音乐';
    }
});

// 首次加载自动尝试播放（部分浏览器需要用户交互）
document.addEventListener('click', function initPlay() {
    audio.play().catch(() => {
        playBtn.click(); // 如果自动播放失败，让用户手动点击
    });
    document.removeEventListener('click', initPlay);
});