document.addEventListener('DOMContentLoaded', () => {
    // --- عناصر DOM ---
    const cursor = document.getElementById('custom-cursor');
    const startScreen = document.getElementById('start-screen');
    const mainGameScreen = document.getElementById('main-game-screen');
    const finalPuzzleScreen = document.getElementById('final-puzzle-screen');
    const activationSymbol = document.getElementById('activation-symbol');
    const startHint = document.getElementById('start-hint');
    const introText = document.getElementById('intro-text');
    const quote = document.getElementById('quote');
    const canvas = document.getElementById('memory-canvas');
    const ctx = canvas.getContext('2d');
    const mirror = document.getElementById('mirror');
    const memoryText = document.getElementById('memory-text');
    const foundMemoriesCounter = document.querySelector('#found-memories-counter span');
    const gameHint = document.getElementById('game-hint');
    const assemblyMirror = document.getElementById('assembly-mirror');
    const assemblyArea = document.getElementById('assembly-area');
    const finalMessage = document.getElementById('final-message');
    const puzzleHint = document.getElementById('puzzle-hint');
    const transitionMessage = document.getElementById('transition-message');
    const dialogueOptions = document.getElementById('dialogue-options');
    const dialogueOptionElements = document.querySelectorAll('.dialogue-option');
    
    // --- متغيرات الحالة ---
    let audioContext;
    let isPressing = false;
    let pressTimer;
    let memories = [];
    let memoryNodes = [];
    let foundMemoryCount = 0;
    const totalMemories = 9; // زيادة عدد الذكريات
    let animationId;
    let hoveredNode = null;
    let playerChoice = null;
    let dialogueActive = false;
    
    // --- بيانات اللعبة ---
    const memoryContents = [
        { 
            text: "كان يوماً مشمساً... والضحكة تملأ المكان. لكن هل كانت حقيقية؟", 
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop",
            type: "happy",
            theme: "reality"
        },
        { 
            text: "هذا المكان... كان ملاذاً آمناً. أو هكذا أردت أن أصدق.", 
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=250&h=250&fit=crop",
            type: "safe",
            theme: "illusion"
        },
        { 
            text: "الوجه الذي لا يُنسى... دائماً في الأفكار. هل هو من الماضي أم المستقبل؟", 
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&h=250&fit=crop",
            type: "love",
            theme: "time"
        },
        { 
            text: "رسالة لم تُرسل... كلمات اختفت مع الريح. ماذا كان يمكن أن يحدث لو أرسلتها؟", 
            image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=250&h=250&fit=crop",
            type: "regret",
            theme: "choice"
        },
        { 
            text: "النهاية ليست سوى بداية جديدة... أو ربما العكس.", 
            image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=250&h=250&fit=crop",
            type: "philosophical",
            theme: "cycle"
        },
        { 
            text: "صوت المطر على النافذة... لحظات سكينة في عالم من الفوضى.", 
            image: "https://images.unsplash.com/photo-1515624224403-ccd0704968be?w=250&h=250&fit=crop",
            type: "calm",
            theme: "peace"
        },
        { 
            text: "الطريق الذي لم يُسلك... ماذا كان يمكن أن يكون؟ هل هو خيار أم قدر؟", 
            image: "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=250&h=250&fit=crop",
            type: "wonder",
            theme: "fate"
        },
        { 
            text: "الكلمات التي ندمت على قولها... جرح لا يندمل.", 
            image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=250&h=250&fit=crop",
            type: "pain",
            theme: "regret"
        },
        { 
            text: "الصمت الذي فصلنا... هل كان اختياراً أم حتمية؟", 
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=250&h=250&fit=crop",
            type: "melancholy",
            theme: "relationship"
        }
    ];
    
    // الترتيب الصحيح للغز النهائي يعتمد على اختيار اللاعب
    const correctAssemblyOrders = {
        1: [3, 1, 5, 0, 7, 6, 2, 8, 4], // مواجهة الحقيقة
        2: [0, 2, 4, 6, 8, 1, 3, 5, 7], // الهروب من الماضي
        3: [4, 6, 2, 8, 0, 5, 7, 3, 1]  // قبول الوهم
    };
    
    let playerAssemblyOrder = [];
    
    // --- وظائف مساعدة (الصوت، الشاشة الكاملة، المؤشر) ---
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
    
    // متابعة حركة الفأرة
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        // التحقق من تمرير الفأرة فوق نقاط الذاكرة
        if (mainGameScreen.classList.contains('active') && !dialogueActive) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            let isOverMemory = false;
            for (const node of memoryNodes) {
                if (node.isMemory && !memories[node.memoryId].discovered) {
                    const dx = node.x - x;
                    const dy = node.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 20) { // زيادة مسافة التفاعل
                        isOverMemory = true;
                        if (hoveredNode !== node) {
                            hoveredNode = node;
                            cursor.classList.add('hovering');
                            playTone(300, 50);
                        }
                        break;
                    }
                }
            }
            
            if (!isOverMemory && hoveredNode) {
                hoveredNode = null;
                cursor.classList.remove('hovering');
            }
        }
    });
    
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
        
        // إظهار النص التمهيدي
        setTimeout(() => {
            quote.style.opacity = '0.8';
        }, 500);
        
        setTimeout(() => {
            introText.style.opacity = '0.8';
        }, 1500);
        
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
        quote.style.opacity = '0';
        introText.style.opacity = '0';
        playTone(100, 100); // نغمة إلغاء
    }
    
    // --- منطق الشاشة الرئيسية (نسيج الذكريات) ---
    function startMainGame() {
        startScreen.classList.remove('active');
        mainGameScreen.classList.add('active');
        setupCanvas();
        generateMemoryWeb();
        animate();
        
        // إظهار تلميح اللعبة
        setTimeout(() => {
            gameHint.style.opacity = '0.8';
        }, 2000);
    }
    
    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function generateMemoryWeb() {
        memoryNodes = [];
        memories = [];
        const nodeCount = 100; // زيادة عدد العقد
        
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
                memoryNodes[idx].radius = 6; // جعل نقاط الذاكرة أكبر
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
                    // تغيير لون النقطة المكتشفة حسب نوع الذكرى
                    switch(memory.content.type) {
                        case 'happy':
                            ctx.fillStyle = '#f6e05e'; // ذهبي للذكريات السعيدة
                            break;
                        case 'pain':
                            ctx.fillStyle = '#e53e3e'; // أحمر للذكريات المؤلمة
                            break;
                        case 'love':
                            ctx.fillStyle = '#ed64a6'; // وردي للذكريات العاطفية
                            break;
                        case 'regret':
                            ctx.fillStyle = '#9f7aea'; // بنفسجي للذكريات المندم عليها
                            break;
                        default:
                            ctx.fillStyle = '#63b3ed'; // أزرق للبقية
                    }
                } else {
                    // تأثير نبض للذكريات المخفية
                    const pulse = Math.sin(Date.now() / 500 + node.pulsePhase) * 0.5 + 0.5;
                    
                    // تغيير لون الهالة حسب نوع الذكرى
                    switch(memory.content.type) {
                        case 'happy':
                            ctx.fillStyle = `rgba(246, 224, 94, ${0.4 + pulse * 0.4})`;
                            break;
                        case 'pain':
                            ctx.fillStyle = `rgba(229, 62, 62, ${0.4 + pulse * 0.4})`;
                            break;
                        case 'love':
                            ctx.fillStyle = `rgba(237, 100, 166, ${0.4 + pulse * 0.4})`;
                            break;
                        case 'regret':
                            ctx.fillStyle = `rgba(159, 122, 234, ${0.4 + pulse * 0.4})`;
                            break;
                        default:
                            ctx.fillStyle = `rgba(99, 179, 237, ${0.4 + pulse * 0.4})`;
                    }
                    
                    // إضافة هالة حول الذكريات غير المكتشفة
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius + 5 + pulse * 5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(160, 100, 255, ${0.1 + pulse * 0.1})`;
                    ctx.fill();
                    
                    // إعادة رسم النقطة نفسها
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                    
                    // تغيير لون النقطة حسب نوع الذكرى
                    switch(memory.content.type) {
                        case 'happy':
                            ctx.fillStyle = `rgba(246, 224, 94, ${0.4 + pulse * 0.4})`;
                            break;
                        case 'pain':
                            ctx.fillStyle = `rgba(229, 62, 62, ${0.4 + pulse * 0.4})`;
                            break;
                        case 'love':
                            ctx.fillStyle = `rgba(237, 100, 166, ${0.4 + pulse * 0.4})`;
                            break;
                        case 'regret':
                            ctx.fillStyle = `rgba(159, 122, 234, ${0.4 + pulse * 0.4})`;
                            break;
                        default:
                            ctx.fillStyle = `rgba(99, 179, 237, ${0.4 + pulse * 0.4})`;
                    }
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
        if (dialogueActive) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (const node of memoryNodes) {
            if (node.isMemory && !memories[node.memoryId].discovered) {
                const dx = node.x - x;
                const dy = node.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 20) { // زيادة مسافة النقر
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
                        // عرض خيارات الحوار عند اكتشاف جميع الذكريات
                        showDialogueOptions();
                    } else if (foundMemoryCount === Math.floor(totalMemories / 2)) {
                        showTransitionMessage("نصف الطريق لاستعادة الروح...");
                        setTimeout(() => {
                            transitionMessage.style.opacity = '0';
                        }, 2000);
                    }
                }, 4000);
            }
        };
        typeWriter();
        
        // صوت اكتشاف الذكرى
        playTone(440, 200);
        setTimeout(() => playTone(550, 300), 150);
    }
    
    function showTransitionMessage(message) {
        transitionMessage.textContent = message;
        transitionMessage.style.opacity = '1';
    }
    
    function showDialogueOptions() {
        dialogueActive = true;
        dialogueOptions.style.opacity = '1';
        gameHint.style.opacity = '0';
        
        // إضافة مستمعي الأحداث لخيارات الحوار
        dialogueOptionElements.forEach(option => {
            option.addEventListener('click', handleDialogueChoice);
        });
    }
    
    function handleDialogueChoice(e) {
        playerChoice = parseInt(e.target.dataset.choice);
        dialogueActive = false;
        dialogueOptions.style.opacity = '0';
        
        // إزالة مستمعي الأحداث
        dialogueOptionElements.forEach(option => {
            option.removeEventListener('click', handleDialogueChoice);
        });
        
        // عرض رسالة بناءً على اختيار اللاعب
        let message = "";
        switch(playerChoice) {
            case 1:
                message = "اخترت مواجهة الحقيقة... مهما كانت مؤلمة.";
                break;
            case 2:
                message = "اخترت الهروب من الماضي... لكنه يلاحقك دائماً.";
                break;
            case 3:
                message = "اخترت قبول الوهم... أحياناً الوهم أكثر راحة.";
                break;
        }
        
        showTransitionMessage(message);
        
        setTimeout(() => {
            transitionMessage.style.opacity = '0';
            setTimeout(startFinalPuzzle, 1500);
        }, 3000);
    }
    
    // --- منطق اللغز النهائي (تركيب الروح) ---
    function startFinalPuzzle() {
        cancelAnimationFrame(animationId);
        mainGameScreen.classList.remove('active');
        finalPuzzleScreen.classList.add('active');
        
        // إظهار تلميح اللغز
        setTimeout(() => {
            puzzleHint.style.opacity = '0.8';
        }, 2000);
        
        // إنشاء الكرات والأماكن
        assemblyArea.innerHTML = '';
        assemblyMirror.innerHTML = ''; // مسح الأماكن القديمة
        playerAssemblyOrder = [];
        
        memories.forEach((memory, index) => {
            // إنشاء الكرة
            const orb = document.createElement('div');
            orb.className = 'memory-orb';
            orb.draggable = true;
            orb.dataset.memoryId = memory.id;
            
            // تغيير لون الكرة حسب نوع الذكرى
            switch(memory.content.type) {
                case 'happy':
                    orb.style.background = `radial-gradient(circle at 30% 30%, #f6e05e, #d69e2e)`;
                    break;
                case 'pain':
                    orb.style.background = `radial-gradient(circle at 30% 30%, #e53e3e, #c53030)`;
                    break;
                case 'love':
                    orb.style.background = `radial-gradient(circle at 30% 30%, #ed64a6, #d53f8c)`;
                    break;
                case 'regret':
                    orb.style.background = `radial-gradient(circle at 30% 30%, #9f7aea, #805ad5)`;
                    break;
                default:
                    orb.style.background = `radial-gradient(circle at 30% 30%, #63b3ed, #4299e1)`;
            }
            
            orb.title = memory.content.text.substring(0, 20) + '...'; // إضافة تلميح نصي
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
        const correctOrder = correctAssemblyOrders[playerChoice];
        const isCorrect = playerAssemblyOrder.every((id, index) => id === correctOrder[index]);
        
        if (isCorrect) {
            assemblyMirror.classList.add('complete');
            
            // تغيير الرسالة النهائية بناءً على اختيار اللاعب
            let message = "";
            switch(playerChoice) {
                case 1:
                    message = "واجهت الحقيقة... والروح اكتملت الآن.";
                    break;
                case 2:
                    message = "حاولت الهروب... لكن الحقيقة دائماً تجد طريقها.";
                    break;
                case 3:
                    message = "قبللت الوهم... وفيه وجدت راحتك.";
                    break;
            }
            
            finalMessage.textContent = message;
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
                    introText.style.opacity = '0';
                    quote.style.opacity = '0';
                    playerChoice = null;
                }, 2000);
            }, 5000);
        } else {
            // فشل في الترتيب
            playTone(110, 500, 'square'); // صوت فشل منخفض
            
            let message = "";
            switch(playerChoice) {
                case 1:
                    message = "الحقيقة لا تزال مجزأة... حاول مرة أخرى.";
                    break;
                case 2:
                    message = "الماضي يلاحقك... لا يمكنك الهروب من نفسك.";
                    break;
                case 3:
                    message = "الوهم لم يكتمل بعد... هل هذا ما تريده حقاً؟";
                    break;
            }
            
            showTransitionMessage(message);
            setTimeout(() => {
                transitionMessage.style.opacity = '0';
                startFinalPuzzle(); // إعادة المحاولة
            }, 2000);
        }
    }
});
