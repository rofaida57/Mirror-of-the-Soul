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
    
    // باقي الكود سيأتي هنا...
});
