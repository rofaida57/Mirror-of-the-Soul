document.addEventListener('DOMContentLoaded', () => {
    // --- عناصر DOM ---
    const startScreen = document.getElementById('start-screen');
    const mainGameScreen = document.getElementById('main-game-screen');
    const finalPuzzleScreen = document.getElementById('final-puzzle-screen');
    const activationSymbol = document.getElementById('activation-symbol');
    const startHint = document.getElementById('start-hint');
    const canvas = document.getElementById('memory-canvas');
    const ctx = canvas.getContext('2d');
    const mirror = document.getElementById('mirror');
    const memoryText = document.getElementById('memory-text');
    const foundMemoriesCounter = document.querySelector('#found-memories-counter span');
    const assemblyMirror = document.getElementById('assembly-mirror');
    const assemblyArea = document.getElementById('assembly-area');
    const finalMessage = document.getElementById('final-message');

    // --- متغيرات الحالة ---
    let audioContext;
    let isPressing = false;
    let pressTimer;
    let memories = [];
    let memoryNodes = [];
    let foundMemoryCount = 0;
    const totalMemories = 5;
    let animationId;

    // --- بيانات اللعبة ---
    const memoryContents = [
        { text: "كان يوماً مشمساً... والضحكة تملأ المكان.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop" },
        { text: "هذا المكان... كان ملاذاً آمناً.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=250&h=250&fit=crop" },
        { text: "الوجه الذي لا يُنسى... دائماً في الأفكار.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&h=250&fit=crop" },
        { text: "رسالة لم تُرسل... كلمات اختفت مع الريح.", image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=250&h=250&fit=crop" },
        { text: "النهاية ليست سوى بداية جديدة...", image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=250&h=250&fit=crop" }
    ];
    const correctAssemblyOrder = [2, 0, 4, 1, 3]; // الترتيب الصحيح للغز النهائي
    let playerAssemblyOrder = [];

    // --- وظائف مساعدة (الصوت، الشاشة الكاملة) ---
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playTone(frequency, duration, type = 'sine') {
        initAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }

    function enterFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log(`Fullscreen error: ${err.message}`);
            });
        }
    }

    // --- منطق شاشة البداية ---
    activationSymbol.addEventListener('mousedown', startActivation);
    activationSymbol.addEventListener('touchstart', startActivation);
    activationSymbol.addEventListener('mouseup', endActivation);
    activationSymbol.addEventListener('touchend', endActivation);
    activationSymbol.addEventListener('mouseleave', endActivation);

    function startActivation(e) {
        e.preventDefault();
        if (isPressing) return;
        isPressing = true;
        activationSymbol.classList.add('activating');
        startHint.style.opacity = '0';
        
        playTone(110, 300); // نغمة بداية منخفضة
        
        pressTimer = setTimeout(() => {
            activationSymbol.classList.add('activated');
            playTone(220, 500); // نغمة تأكيد
            setTimeout(() => {
                enterFullscreen();
                startMainGame();
            }, 1000);
        }, 3000);
    }

    function endActivation() {
        if (!isPressing) return;
        isPressing = false;
        clearTimeout(pressTimer);
        activationSymbol.classList.remove('activating', 'activated');
        startHint.style.opacity = '0.5';
        playTone(100, 100); // نغمة إلغاء
    }

    // --- منطق الشاشة الرئيسية (نسيج الذكريات) ---
    function startMainGame() {
        startScreen.classList.remove('active');
        mainGameScreen.classList.add('active');
        setupCanvas();
        generateMemoryWeb();
        animate();
    }

    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function generateMemoryWeb() {
        memoryNodes = [];
        memories = [];
        const nodeCount = 60;
        
        // إنشاء عقد الشبكة
        for (let i = 0; i < nodeCount; i++) {
            memoryNodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 2 + Math.random() * 2,
                pulsePhase: Math.random() * Math.PI * 2,
                isMemory: false,
                memoryId: null
            });
        }

        // إخفاء الذكريات في العقد
        const memoryIndices = [];
        while (memoryIndices.length < totalMemories) {
            const idx = Math.floor(Math.random() * nodeCount);
            if (!memoryIndices.includes(idx)) {
                memoryIndices.push(idx);
                memoryNodes[idx].isMemory = true;
                memoryNodes[idx].memoryId = memoryIndices.length - 1;
                memories.push({
                    id: memoryIndices.length - 1,
                    nodeId: idx,
                    discovered: false,
                    content: memoryContents[memoryIndices.length - 1]
                });
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // رسم الاتصالات
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < memoryNodes.length; i++) {
            for (let j = i + 1; j < memoryNodes.length; j++) {
                const dx = memoryNodes[i].x - memoryNodes[j].x;
                const dy = memoryNodes[i].y - memoryNodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(memoryNodes[i].x, memoryNodes[i].y);
                    ctx.lineTo(memoryNodes[j].x, memoryNodes[j].y);
                    ctx.globalAlpha = 1 - (dist / 150);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }

        // رسم العقد
        for (const node of memoryNodes) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            
            if (node.isMemory) {
                const memory = memories[node.memoryId];
                if (memory.discovered) {
                    ctx.fillStyle = '#f6e05e'; // لون ذهبي للمكتشفة
                } else {
                    // تأثير نبض للذكريات المخفية
                    const pulse = Math.sin(Date.now() / 500 + node.pulsePhase) * 0.5 + 0.5;
                    ctx.fillStyle = `rgba(160, 100, 255, ${0.4 + pulse * 0.4})`;
                }
            } else {
                ctx.fillStyle = 'rgba(150, 200, 255, 0.6)';
            }
            
            ctx.fill();
        }
        animationId = requestAnimationFrame(animate);
    }

    // اكتشاف الذكريات
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (const node of memoryNodes) {
            if (node.isMemory && !memories[node.memoryId].discovered) {
                const dx = node.x - x;
                const dy = node.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 15) {
                    discoverMemory(memories[node.memoryId]);
                    break;
                }
            }
        }
    });

    function discoverMemory(memory) {
        memory.discovered = true;
        foundMemoryCount++;
        foundMemoriesCounter.textContent = foundMemoryCount;
        
        // عرض الذكرى في المرآة
        mirror.style.backgroundImage = `url(${memory.content.image})`;
        mirror.classList.add('showing-memory');
        
        // عرض النص
        memoryText.textContent = '';
        memoryText.style.opacity = '1';
        let i = 0;
        const typeWriter = () => {
            if (i < memory.content.text.length) {
                memoryText.textContent += memory.content.text.charAt(i);
                i++;
                playTone(250 + Math.random() * 100, 50, 'triangle'); // أصوات كتابة
                setTimeout(typeWriter, 80 + Math.random() * 80);
            } else {
                setTimeout(() => {
                    memoryText.style.opacity = '0';
                    mirror.classList.remove('showing-memory');
                    mirror.style.backgroundImage = '';
                    
                    if (foundMemoryCount === totalMemories) {
                        setTimeout(startFinalPuzzle, 1500);
                    }
                }, 4000);
            }
        };
        typeWriter();

        // صوت اكتشاف الذكرى
        playTone(440, 200);
        setTimeout(() => playTone(550, 300), 150);
    }

    // --- منطق اللغز النهائي (تركيب الروح) ---
    function startFinalPuzzle() {
        cancelAnimationFrame(animationId);
        mainGameScreen.classList.remove('active');
        finalPuzzleScreen.classList.add('active');
        
        // إنشاء الكرات والأماكن
        assemblyArea.innerHTML = '';
        playerAssemblyOrder = [];
        
        memories.forEach((memory, index) => {
            // إنشاء الكرة
            const orb = document.createElement('div');
            orb.className = 'memory-orb';
            orb.draggable = true;
            orb.dataset.memoryId = memory.id;
            orb.style.background = `radial-gradient(circle at 30% 30%, hsl(${index * 70}, 70%, 70%), hsl(${index * 70}, 70%, 40%))`;
            assemblyArea.appendChild(orb);
            
            // إنشاء المكان في المرآة
            const slot = document.createElement('div');
            slot.className = 'orb-slot';
            const angle = (index / totalMemories) * Math.PI * 2 - Math.PI / 2;
            const radius = 100;
            slot.style.left = `${150 + Math.cos(angle) * radius}px`;
            slot.style.top = `${150 + Math.sin(angle) * radius}px`;
            slot.dataset.slotId = index;
            assemblyMirror.appendChild(slot);
        });
        
        setupDragAndDrop();
    }

    function setupDragAndDrop() {
        const orbs = document.querySelectorAll('.memory-orb');
        const slots = document.querySelectorAll('.orb-slot');
        
        orbs.forEach(orb => {
            orb.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', orb.dataset.memoryId);
                orb.classList.add('dragging');
                playTone(300, 50);
            });
            
            orb.addEventListener('dragend', () => {
                orb.classList.remove('dragging');
            });
        });
        
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.style.borderColor = '#f6e05e';
            });
            
            slot.addEventListener('dragleave', () => {
                if (!slot.classList.contains('filled')) {
                    slot.style.borderColor = 'rgba(160, 174, 192, 0.4)';
                }
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const memoryId = parseInt(e.dataTransfer.getData('text/plain'));
                const slotId = parseInt(slot.dataset.slotId);
                
                // التأكد من أن المكان فارغ
                if (slot.classList.contains('filled')) {
                    playTone(150, 200, 'sawtooth'); // صوت خطأ
                    return;
                }
                
                // نقل الكرة إلى المكان
                const orb = document.querySelector(`.memory-orb[data-memory-id="${memoryId}"]`);
                orb.style.position = 'absolute';
                orb.style.left = slot.style.left;
                orb.style.top = slot.style.top;
                orb.style.transform = 'translate(-50%, -50%) scale(0.8)';
                orb.draggable = false;
                orb.classList.add('placed');
                
                slot.classList.add('filled');
                playerAssemblyOrder[slotId] = memoryId;
                
                playTone(440 + slotId * 50, 150); // صوت نجاح
                
                // التحقق من اكتمال اللغز
                if (playerAssemblyOrder.filter(id => id !== undefined).length === totalMemories) {
                    checkFinalSolution();
                }
            });
        });
    }

    function checkFinalSolution() {
        const isCorrect = playerAssemblyOrder.every((id, index) => id === correctAssemblyOrder[index]);
        
        if (isCorrect) {
            assemblyMirror.classList.add('complete');
            finalMessage.textContent = "الروح اكتملت... والذاكرة استراحت.";
            finalMessage.style.opacity = '1';
            
            // موسيقى النهاية
            playTone(523.25, 500); // C5
            setTimeout(() => playTone(659.25, 500), 250); // E5
            setTimeout(() => playTone(783.99, 750), 500); // G5
            setTimeout(() => playTone(1046.50, 1000), 750); // C6
            
            setTimeout(() => {
                finalMessage.style.opacity = '0';
                setTimeout(() => {
                    finalPuzzleScreen.classList.remove('active');
                    startScreen.classList.add('active');
                    // إعادة ضبط اللعبة
                    foundMemoryCount = 0;
                    foundMemoriesCounter.textContent = '0';
                    activationSymbol.classList.remove('activated');
                }, 2000);
            }, 5000);
        } else {
            // فشل في الترتيب
            playTone(110, 500, 'square'); // صوت فشل منخفض
            setTimeout(() => {
                alert('الترتيب خاطئ. حاول مرة أخرى.');
                startFinalPuzzle(); // إعادة المحاولة
            }, 600);
        }
    }

    // --- متابعة المؤشر المخصص ---
    document.addEventListener('mousemove', (e) => {
        const cursor = document.querySelector('body::after'); // لا يعمل مباشرة، نستخدم عنصراً وهمياً
        // لتبسيط الأمر، يمكن إضافة عنصر div للمؤشر في HTML والتحكم به هنا
    });
});
