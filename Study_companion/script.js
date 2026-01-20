let tasks = [];
let hearts = 0;
let currentStreak = 0;
let taskToDelete = null;
let bestStreak = 0;
let lastCompletionDate = null;
let editingTaskId = null;
let unlockedRewards = [];
let customSubjects = [];
let settings = {
    userName: 'My Love',
    theme: 'pink',
    dailyGoal: 3,
    studySound: 'none'
};
let timer = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'Custom',
    interval: null
};
let studyStats = {
    totalTasks: 0,
    completedTasks: 0,
    studyTime: 0,
    subjects: {}
};

// Flashcard Configuration
let decks = [];
let currentStudyDeck = null;
let currentCardIndex = 0;
let studyHistory = [];
let deckToDelete = null;

// Check if app is installed as PWA
let isPWA = window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone ||
            document.referrer.includes('android-app://');

const priorityEmojis = {
    low: '🌟',
    medium: '🌟🌟',
    high: '🌟🌟🌟'
};

const subjectColors = {
    'Math': '#ff6b6b',
    'Science': '#4ecdc4',
    'History': '#ffd166',
    'Language': '#06d6a0',
    'Art': '#9d4edd',
    'Other': '#999'
};

const subjectEmojis = {
    'Math': '📐',
    'Science': '🔬',
    'History': '📜',
    'Language': '🗣️',
    'Art': '🎨',
    'Other': '📝'
};

const rewards = [
    { id: 1, emoji: '🎀', name: 'Pink Ribbon', cost: 10 },
    { id: 2, emoji: '🌸', name: 'Cherry Blossom', cost: 15 },
    { id: 3, emoji: '🦋', name: 'Butterfly', cost: 20 },
    { id: 4, emoji: '🌈', name: 'Rainbow', cost: 25 },
    { id: 5, emoji: '✨', name: 'Sparkles', cost: 30 },
    { id: 6, emoji: '🎨', name: 'Art Palette', cost: 35 },
    { id: 7, emoji: '🧸', name: 'Teddy Bear', cost: 40 },
    { id: 8, emoji: '👑', name: 'Crown', cost: 50 }
];

const realRewards = [
    { 
        id: 101, 
        emoji: '🎮', 
        name: 'Choose a game', 
        cost: 100, 
        description: 'Laro tayo anything you want',
        unlocked: false
    },
    { 
        id: 102, 
        emoji: '🍿', 
        name: 'Movie Night', 
        cost: 200, 
        description: 'Your pick of movie!',
        unlocked: false
    },
    { 
        id: 103, 
        emoji: '☕', 
        name: 'Free coffee', 
        cost: 400, 
        description: 'I\'ll treat you a matcha coffee!',
        unlocked: false
    },
    { 
        id: 104, 
        emoji: '🎁', 
        name: 'Gift', 
        cost: 500, 
        description: 'Any gift you want just tell me!',
        unlocked: false
    }
];

const secretMessages = [
    "You are the most amazing person I know. Watching you study so hard inspires me every day. I'm so proud of you! 💕",
    "Every time you complete a task, remember how capable and brilliant you are. I believe in you more than you know! ✨",
    "You're not just studying, you're building an incredible future for yourself. And I'll be here cheering you on every step of the way! 🌟",
    "I know studying can be tough sometimes, but remember: you're tougher. Take breaks when you need them, and know I'm always here for you. 💖",
    "Your dedication and intelligence are just two of the million things I love about you. Keep going, my love! 🎯"
];

const dailyAffirmations = [
    "You are capable of amazing things today! 🌟",
    "Your hard work is building your beautiful future ✨",
    "Remember to be kind to yourself today 💕",
    "You're stronger than you think 💪",
    "Every small step counts toward big dreams 🎯",
    "You have everything you need to succeed today 💖",
    "Your mind is powerful and capable 🌸",
    "Take breaks, breathe, and trust the process 🍃",
    "You are worthy of all your goals and dreams 💫",
    "Today is another opportunity to shine ☀️"
];

const encouragementMessages = [
    "You're doing amazing, sweetie! 💕",
    "I'm so proud of you! ✨",
    "Take a break if you need it 🌸",
    "One task at a time, you've got this!",
    "Your future self will thank you! 💖",
    "You're crushing it! 🎯",
    "Remember to stay hydrated! 💧",
    "You're making great progress! 📈",
    "I believe in you! 💪",
    "You're smarter than you think! 🧠"
];

// Initialize the app
function init() {
    console.log('Initializing Cozy Study Companion...');
    console.log('Is PWA:', isPWA);
    console.log('Service Worker support:', 'serviceWorker' in navigator);
    
    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
    
    loadData();
    initFlashcards(); // Initialize flashcard data
    applyTheme(settings.theme);
    updateWelcomeMessage();
    updateStreaks();
    renderTasks();
    renderSchedule();
    renderFlashcards(); // Render flashcard decks
    renderRewards();
    renderRealRewards();
    renderStats();
    updateHeartsDisplay();
    
    // Initialize timer with input values
    const minutesInput = parseInt(document.getElementById('timer-minutes-input').value) || 25;
    const secondsInput = parseInt(document.getElementById('timer-seconds-input').value) || 0;
    setTimer(minutesInput, secondsInput, 'Custom');
    
    setupTabs();
    setupEventListeners();
    
    // Show PWA install prompt
    showPWAInstallPrompt();
    
    // Request notification permission
    setTimeout(() => {
        requestNotificationPermission();
    }, 1000);
    
    // Start reminder checking
    checkReminders();
    setInterval(checkReminders, 60000); // Check every minute
    
    // Show loading screen for 2 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        showToast("Welcome back, my love! 💕");
        
        // Show PWA instructions if on mobile
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !isPWA) {
            setTimeout(() => {
                showToast("For best experience, install as app! 📱");
            }, 3000);
        }
    }, 2000);
    
    showDailyAffirmation();
}

// Flashcard Data Management
function initFlashcards() {
    const savedDecks = localStorage.getItem('cozyStudyDecks');
    if (savedDecks) {
        decks = JSON.parse(savedDecks);
    }
    
    const savedStudyHistory = localStorage.getItem('cozyStudyHistory');
    if (savedStudyHistory) {
        studyHistory = JSON.parse(savedStudyHistory);
    }
}

function saveFlashcards() {
    localStorage.setItem('cozyStudyDecks', JSON.stringify(decks));
    localStorage.setItem('cozyStudyHistory', JSON.stringify(studyHistory));
}

// Register Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
                
                // Check for periodic sync support
                if ('periodicSync' in registration) {
                    registration.periodicSync.register('check-reminders', {
                        minInterval: 15 * 60 * 1000 // 15 minutes
                    }).then(() => {
                        console.log('Periodic sync registered');
                    });
                }
                
                return registration;
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Show PWA Install Prompt
let deferredPrompt;
function showPWAInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button after 5 seconds
        setTimeout(() => {
            if (deferredPrompt && !isPWA) {
                const installPrompt = document.createElement('div');
                installPrompt.className = 'notification-prompt';
                installPrompt.innerHTML = `
                    <p>📱 Enable for better experience?</p>
                    <button class="btn btn-primary" onclick="installPWA()">Install App</button>
                    <button class="btn btn-secondary" onclick="this.parentElement.remove()">Not Now</button>
                `;
                const container = document.getElementById('tasks-container');
                if (container) {
                    container.insertBefore(installPrompt, container.firstChild);
                }
            }
        }, 5000);
    });
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted PWA installation');
                showToast("App installed! Notifications will work better now 📱");
            }
            deferredPrompt = null;
        });
    }
}

// Data Management
function loadData() {
    const data = localStorage.getItem('cozyStudyData');
    if (data) {
        const parsed = JSON.parse(data);
        tasks = parsed.tasks || [];
        hearts = parsed.hearts || 0;
        currentStreak = parsed.currentStreak || 0;
        bestStreak = parsed.bestStreak || 0;
        lastCompletionDate = parsed.lastCompletionDate || null;
        unlockedRewards = parsed.unlockedRewards || [];
        settings = parsed.settings || settings;
        studyStats = parsed.studyStats || studyStats;
        customSubjects = parsed.customSubjects || [];
    }
    
    populateCustomSubjects();
    updateStudyStats();
}

function populateCustomSubjects() {
    const taskSubjectSelect = document.getElementById('task-subject');
    const deckSubjectSelect = document.getElementById('deck-subject');
    
    // Clear existing custom options from both selects
    for (let i = taskSubjectSelect.options.length - 1; i >= 6; i--) {
        taskSubjectSelect.remove(i);
    }
    
    for (let i = deckSubjectSelect.options.length - 1; i >= 6; i--) {
        deckSubjectSelect.remove(i);
    }
    
    // Add custom subjects to both select elements
    customSubjects.forEach(subject => {
        // Add to task subject select
        const taskOption = document.createElement('option');
        taskOption.value = subject;
        taskOption.textContent = subject + ' 📝';
        taskSubjectSelect.appendChild(taskOption);
        
        // Add to deck subject select
        const deckOption = document.createElement('option');
        deckOption.value = subject;
        deckOption.textContent = subject + ' 📝';
        deckSubjectSelect.appendChild(deckOption);
    });
}

function saveData() {
    const data = {
        tasks,
        hearts,
        currentStreak,
        bestStreak,
        lastCompletionDate,
        unlockedRewards,
        settings,
        studyStats,
        customSubjects
    };
    localStorage.setItem('cozyStudyData', JSON.stringify(data));
}

// Custom Subjects Functions
function showAddSubject() {
    document.getElementById('add-subject-input').style.display = 'block';
    document.getElementById('new-subject').focus();
}

function addNewSubject() {
    const newSubject = document.getElementById('new-subject').value.trim();
    if (newSubject) {
        const taskSubjectSelect = document.getElementById('task-subject');
        const deckSubjectSelect = document.getElementById('deck-subject');
        
        // Check if subject already exists in either select
        const existingTaskOption = Array.from(taskSubjectSelect.options).find(option => 
            option.value.toLowerCase() === newSubject.toLowerCase()
        );
        
        const existingDeckOption = Array.from(deckSubjectSelect.options).find(option => 
            option.value.toLowerCase() === newSubject.toLowerCase()
        );
        
        if (existingTaskOption || existingDeckOption) {
            showToast(`Subject "${newSubject}" already exists! 📚`);
            taskSubjectSelect.value = newSubject;
            deckSubjectSelect.value = newSubject;
            document.getElementById('add-subject-input').style.display = 'none';
            document.getElementById('new-subject').value = '';
            return;
        }
        
        // Add to custom subjects array if not already there
        if (!customSubjects.includes(newSubject)) {
            customSubjects.push(newSubject);
        }
        
        // Add to task subject select
        const taskOption = document.createElement('option');
        taskOption.value = newSubject;
        taskOption.textContent = newSubject + ' 📝';
        taskSubjectSelect.appendChild(taskOption);
        
        // Add to deck subject select
        const deckOption = document.createElement('option');
        deckOption.value = newSubject;
        deckOption.textContent = newSubject + ' 📝';
        deckSubjectSelect.appendChild(deckOption);
        
        // Set the value in both selects
        taskSubjectSelect.value = newSubject;
        deckSubjectSelect.value = newSubject;
        
        document.getElementById('add-subject-input').style.display = 'none';
        document.getElementById('new-subject').value = '';
        
        saveData();
        
        showToast(`Added new subject: ${newSubject} 📚`);
    }
}

function showAddSubjectForDeck() {
    const deckAddSubjectInput = document.getElementById('deck-add-subject-input');
    deckAddSubjectInput.style.display = 'block';
    document.getElementById('deck-new-subject').focus();
}

function addNewSubjectForDeck() {
    const newSubject = document.getElementById('deck-new-subject').value.trim();
    if (newSubject) {
        const deckSubjectSelect = document.getElementById('deck-subject');
        const taskSubjectSelect = document.getElementById('task-subject');
        
        // Check if subject already exists
        const existingDeckOption = Array.from(deckSubjectSelect.options).find(option => 
            option.value.toLowerCase() === newSubject.toLowerCase()
        );
        
        const existingTaskOption = Array.from(taskSubjectSelect.options).find(option => 
            option.value.toLowerCase() === newSubject.toLowerCase()
        );
        
        if (existingDeckOption || existingTaskOption) {
            showToast(`Subject "${newSubject}" already exists! 📚`);
            deckSubjectSelect.value = newSubject;
            document.getElementById('deck-add-subject-input').style.display = 'none';
            document.getElementById('deck-new-subject').value = '';
            return;
        }
        
        // Add to custom subjects array if not already there
        if (!customSubjects.includes(newSubject)) {
            customSubjects.push(newSubject);
        }
        
        // Add to deck subject select
        const deckOption = document.createElement('option');
        deckOption.value = newSubject;
        deckOption.textContent = newSubject + ' 📝';
        deckSubjectSelect.appendChild(deckOption);
        
        // Also add to task subject select for consistency
        const taskOption = document.createElement('option');
        taskOption.value = newSubject;
        taskOption.textContent = newSubject + ' 📝';
        taskSubjectSelect.appendChild(taskOption);
        
        // Set the value in deck select
        deckSubjectSelect.value = newSubject;
        
        document.getElementById('deck-add-subject-input').style.display = 'none';
        document.getElementById('deck-new-subject').value = '';
        
        saveData();
        
        showToast(`Added new subject: ${newSubject} 📚`);
    }
}

function getSubjectColor(subject) {
    // If it's a standard subject, use predefined color
    if (subjectColors[subject]) {
        return subjectColors[subject];
    }
    
    // For custom subjects, generate a color based on the subject name
    if (customSubjects.includes(subject)) {
        // Create a simple hash for consistent color generation
        let hash = 0;
        for (let i = 0; i < subject.length; i++) {
            hash = subject.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Generate HSL color with fixed saturation and lightness
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    return '#999'; // Default color
}

function getSubjectEmoji(subject) {
    return subjectEmojis[subject] || '📝';
}

// Theme Management
function applyTheme(themeName) {
    document.body.className = themeName + '-theme';
    settings.theme = themeName;
    saveData();
}

function selectTheme(themeName) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
    applyTheme(themeName);
}

// Timer Functions
function startTimer() {
    if (!timer.isRunning) {
        // Get values from input fields
        const minutesInput = parseInt(document.getElementById('timer-minutes-input').value) || 0;
        const secondsInput = parseInt(document.getElementById('timer-seconds-input').value) || 0;
        
        // Validate inputs
        if (minutesInput < 0 || minutesInput > 120 || secondsInput < 0 || secondsInput > 59) {
            showToast("Please enter valid time values! ⏰");
            return;
        }
        
        if (minutesInput === 0 && secondsInput === 0) {
            showToast("Please set a time! ⏰");
            return;
        }
        
        // Set the timer with input values
        timer.minutes = minutesInput;
        timer.seconds = secondsInput;
        timer.mode = 'Custom';
        timer.isRunning = true;
        timer.interval = setInterval(updateTimer, 1000);
        
        document.getElementById('current-mode').textContent = 'Custom';
        updateTimerDisplay();
        document.getElementById('timer-start-btn').textContent = 'Pause';
        showToast("Timer started! Focus time! 🎯");
    } else {
        pauseTimer();
    }
}

function pauseTimer() {
    timer.isRunning = false;
    clearInterval(timer.interval);
    document.getElementById('timer-start-btn').textContent = 'Start';
    showToast("Timer paused. Take a breath! 🌸");
}

function stopTimer() {
    timer.isRunning = false;
    clearInterval(timer.interval);
    document.getElementById('timer-start-btn').textContent = 'Start';
    showToast("Timer stopped at current time! ⏰");
    
    // Don't close the modal, just stop the timer
    // The timer stays at its current position
}

function resetTimer() {
    if (timer.isRunning) {
        clearInterval(timer.interval);
        timer.isRunning = false;
    }
    
    // Reset to current input values
    const minutesInput = parseInt(document.getElementById('timer-minutes-input').value) || 25;
    const secondsInput = parseInt(document.getElementById('timer-seconds-input').value) || 0;
    
    setTimer(minutesInput, secondsInput, 'Custom');
    document.getElementById('timer-start-btn').textContent = 'Start';
}

function setTimer(minutes, seconds, mode = 'Custom') {
    timer.minutes = minutes;
    timer.seconds = seconds;
    timer.mode = mode;
    
    // Update input fields to match
    document.getElementById('timer-minutes-input').value = minutes;
    document.getElementById('timer-seconds-input').value = seconds;
    document.getElementById('current-mode').textContent = mode;
    
    updateTimerDisplay();
}

function updateTimer() {
    if (timer.seconds === 0) {
        if (timer.minutes === 0) {
            clearInterval(timer.interval);
            timer.isRunning = false;
            document.getElementById('timer-start-btn').textContent = 'Start';
            
            // Timer completed
            celebrate();
            showToast("Time's up! Great work! ⏰");
            
            // Add study time and hearts based on the completed timer duration
            if (timer.mode === 'Focus') {
                const originalMinutes = parseInt(document.getElementById('timer-minutes-input').value) || 25;
                studyStats.studyTime += originalMinutes;
                hearts += Math.max(10, Math.floor(originalMinutes / 5) * 2);
                updateHeartsDisplay();
                saveData();
                renderStats();
            }
            
            return;
        }
        timer.minutes--;
        timer.seconds = 59;
    } else {
        timer.seconds--;
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.getElementById('timer-minutes').textContent = 
        timer.minutes.toString().padStart(2, '0');
    document.getElementById('timer-seconds').textContent = 
        timer.seconds.toString().padStart(2, '0');
    updateNavTimer();
}

function updateNavTimer() {
    const quickTimer = document.getElementById('quick-timer');
    if (quickTimer) {
        quickTimer.textContent = `${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`;
    }
}

// Modal Functions - Updated to close on outside click
function openTimerModal() {
    document.getElementById('timer-modal').classList.add('active');
}

function closeTimerModal() {
    document.getElementById('timer-modal').classList.remove('active');
}

function openSettings() {
    document.getElementById('user-name').value = settings.userName;
    document.getElementById('daily-goal').value = settings.dailyGoal;
    document.getElementById('study-sounds').value = settings.studySound;
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[data-theme="${settings.theme}"]`).classList.add('active');
    
    document.getElementById('settings-modal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}

function saveSettings() {
    settings.userName = document.getElementById('user-name').value || 'My Love';
    settings.dailyGoal = parseInt(document.getElementById('daily-goal').value) || 3;
    settings.studySound = document.getElementById('study-sounds').value;
    
    updateWelcomeMessage();
    saveData();
    closeSettings();
    showToast("Settings saved! ✨");
}

function showSecretMessage() {
    const randomMessage = secretMessages[Math.floor(Math.random() * secretMessages.length)];
    document.getElementById('secret-message-text').textContent = randomMessage;
    
    closeSettings();
    
    setTimeout(() => {
        document.getElementById('secret-modal').classList.add('active');
    }, 300);
}

function closeSecretModal() {
    document.getElementById('secret-modal').classList.remove('active');
}

function addQuickTask() {
    const input = document.getElementById('quick-task-input');
    const taskName = input.value.trim();
    
    if (taskName) {
        // Get TODAY'S date, not current date-time
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dueDate = `${year}-${month}-${day}`;
        
        const taskData = {
            id: Date.now(),
            name: taskName,
            subject: 'Other',
            due: dueDate,
            reminder: '',
            priority: 'medium',
            completed: false
        };
        
        tasks.push(taskData);
        saveData();
        renderTasks();
        renderSchedule();
        renderStats();
        input.value = '';
        showToast("Quick task added for today! ✅");
        
        console.log('Quick task added with date:', dueDate);
    }
}

function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    editingTaskId = taskId;

    document.getElementById('add-subject-input').style.display = 'none';
    document.getElementById('new-subject').value = '';

    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        document.getElementById('modal-title').textContent = 'Edit Task';
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-subject').value = task.subject;
        document.getElementById('task-due').value = task.due;
        document.getElementById('task-reminder').value = task.reminder || '';
        selectPriority(task.priority);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Task';
        form.reset();
        document.getElementById('task-due').value = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
    }

    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    editingTaskId = null;
    document.getElementById('add-subject-input').style.display = 'none';
    document.getElementById('new-subject').value = '';
}

function selectPriority(priority) {
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-priority="${priority}"]`).classList.add('selected');
}

// Event Listeners - Updated to handle modal outside clicks
function setupEventListeners() {
    // Modal outside click handlers
    document.addEventListener('click', (e) => {
        // Timer modal outside click
        const timerModal = document.getElementById('timer-modal');
        if (timerModal && timerModal.classList.contains('active') && 
            e.target === timerModal) {
            closeTimerModal();
        }
        
        // Settings modal outside click
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && settingsModal.classList.contains('active') && 
            e.target === settingsModal) {
            closeSettings();
        }
        
        // Task modal outside click
        const taskModal = document.getElementById('task-modal');
        if (taskModal && taskModal.classList.contains('active') && 
            e.target === taskModal) {
            closeTaskModal();
        }
        
        // Deck modal outside click
        const deckModal = document.getElementById('deck-modal');
        if (deckModal && deckModal.classList.contains('active') && 
            e.target === deckModal) {
            closeDeckModal();
        }
        
        // Card modal outside click
        const cardModal = document.getElementById('card-modal');
        if (cardModal && cardModal.classList.contains('active') && 
            e.target === cardModal) {
            closeCardModal();
        }
        
        // Study modal outside click
        const studyModal = document.getElementById('study-modal');
        if (studyModal && studyModal.classList.contains('active') && 
            e.target === studyModal) {
            closeStudyModal();
        }
        
        // Delete modal outside click
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal && deleteModal.classList.contains('active') && 
            e.target === deleteModal) {
            closeDeleteModal();
        }
        
        // Delete deck modal outside click
        const deleteDeckModal = document.getElementById('delete-deck-modal');
        if (deleteDeckModal && deleteDeckModal.classList.contains('active') && 
            e.target === deleteDeckModal) {
            closeDeleteDeckModal();
        }
        
        // Secret modal outside click
        const secretModal = document.getElementById('secret-modal');
        if (secretModal && secretModal.classList.contains('active') && 
            e.target === secretModal) {
            closeSecretModal();
        }
        
        // Day tasks modal outside click
        const dayTasksModal = document.getElementById('day-tasks-modal');
        if (dayTasksModal && dayTasksModal.classList.contains('active') && 
            e.target === dayTasksModal) {
            closeDayTasksModal();
        }
        
        // Add subject input clicks
        const addSubjectInput = document.getElementById('add-subject-input');
        const addSubjectBtn = document.querySelector('.add-subject-btn');
        const deckAddSubjectInput = document.getElementById('deck-add-subject-input');
        const deckAddSubjectBtn = document.querySelector('.deck-add-subject-btn');
        
        if (addSubjectInput.style.display === 'block' && 
            !addSubjectInput.contains(e.target) && 
            !addSubjectBtn.contains(e.target)) {
            addSubjectInput.style.display = 'none';
            document.getElementById('new-subject').value = '';
        }
        
        if (deckAddSubjectInput && deckAddSubjectInput.style.display === 'block' && 
            !deckAddSubjectInput.contains(e.target) && 
            !deckAddSubjectBtn.contains(e.target)) {
            deckAddSubjectInput.style.display = 'none';
            document.getElementById('deck-new-subject').value = '';
        }
    });

    // Form submissions
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedPriority = document.querySelector('.priority-btn.selected');
        if (!selectedPriority) {
            showToast("Please select a priority! 🌟");
            return;
        }

        const reminderInput = document.getElementById('task-reminder').value;
        let reminderValue = '';
        
        if (reminderInput) {
            reminderValue = reminderInput + ':00';
        }

        const taskData = {
            name: document.getElementById('task-name').value,
            subject: document.getElementById('task-subject').value,
            due: document.getElementById('task-due').value,
            reminder: reminderValue,
            priority: selectedPriority.dataset.priority,
            completed: false
        };

        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            Object.assign(task, taskData);
            showToast("Task updated! ✏️");
        } else {
            taskData.id = Date.now();
            tasks.push(taskData);
            showToast("New task added! ✅");
        }

        saveData();
        updateStudyStats();
        renderTasks();
        renderSchedule();
        renderStats();
        closeTaskModal();
    });

    document.getElementById('quick-task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addQuickTask();
        }
    });

    // Timer input listeners
    document.getElementById('timer-minutes-input').addEventListener('change', function() {
        const minutes = parseInt(this.value) || 0;
        if (minutes < 0) this.value = 0;
        if (minutes > 120) this.value = 120;
        if (!timer.isRunning) {
            timer.minutes = minutes;
            updateTimerDisplay();
        }
    });
    
    document.getElementById('timer-seconds-input').addEventListener('change', function() {
        const seconds = parseInt(this.value) || 0;
        if (seconds < 0) this.value = 0;
        if (seconds > 59) this.value = 59;
        if (!timer.isRunning) {
            timer.seconds = seconds;
            updateTimerDisplay();
        }
    });
    
    // Flashcard form submissions
    document.getElementById('deck-form').addEventListener('submit', handleDeckFormSubmit);
    document.getElementById('card-form').addEventListener('submit', handleCardFormSubmit);
}

// UI Updates
function updateWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    const message = `${greeting}, ${settings.userName}! ${getRandomEncouragement()}`;
    document.getElementById('welcome-message').textContent = message;
}

function updateHeartsDisplay() {
    const heartsCount = document.getElementById('hearts-count');
    if (heartsCount) {
        heartsCount.textContent = hearts;
    }
}

function updateStreakDisplay() {
    document.getElementById('current-streak').textContent = currentStreak;
    document.getElementById('best-streak').textContent = bestStreak;
}

function updateTodayProgress() {
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayTasks = tasks.filter(t => {
        const taskDue = new Date(t.due);
        const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
        return taskDueOnly.getTime() === todayOnly.getTime();
    });
    
    const completedToday = todayTasks.filter(t => t.completed).length;
    document.getElementById('today-progress').textContent = `${completedToday}/${settings.dailyGoal}`;
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get today's tasks (not completed)
    const todayTasks = tasks.filter(t => {
        if (t.completed) return false;
        const taskDue = new Date(t.due);
        const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
        return taskDueOnly.getTime() === todayOnly.getTime();
    });
    
    // Get overdue tasks (not completed, due before today)
    const overdueTasks = tasks.filter(t => {
        if (t.completed) return false;
        const taskDue = new Date(t.due);
        const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
        return taskDueOnly.getTime() < todayOnly.getTime();
    });
    
    // Get upcoming tasks (not completed, due after today)
    const upcomingTasks = tasks.filter(t => {
        if (t.completed) return false;
        const taskDue = new Date(t.due);
        const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
        return taskDueOnly.getTime() > todayOnly.getTime();
    });

    // Get completed tasks
    const completedTasks = tasks.filter(t => t.completed);

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-emoji">📚</div>
                <p>No tasks yet! Add one to get started 💕</p>
            </div>
        `;
        return;
    }

    let html = '';

    // Show Overdue Tasks section if there are overdue tasks
    if (overdueTasks.length > 0) {
        html += '<div class="section-title" style="color: #ff6b6b;">⚠️ Overdue Tasks</div>';
        overdueTasks.sort((a, b) => new Date(a.due) - new Date(b.due)).forEach(task => {
            html += renderTaskCard(task);
        });
    }

    // Show Today's Tasks section if there are tasks for today
    if (todayTasks.length > 0) {
        const overdueTitle = overdueTasks.length > 0 ? 'style="margin-top: 20px;"' : '';
        html += `<div class="section-title" ${overdueTitle}>Today\'s Tasks 📅</div>`;
        todayTasks.forEach(task => {
            html += renderTaskCard(task);
        });
    }

    // Show Upcoming Tasks section if there are upcoming tasks
    if (upcomingTasks.length > 0) {
        const previousTitle = (overdueTasks.length > 0 || todayTasks.length > 0) ? 'style="margin-top: 20px;"' : '';
        html += `<div class="section-title" ${previousTitle}>Upcoming Tasks 🔮</div>`;
        upcomingTasks.sort((a, b) => new Date(a.due) - new Date(b.due)).forEach(task => {
            html += renderTaskCard(task);
        });
    }

    // Show Completed section if there are completed tasks
    if (completedTasks.length > 0) {
        const previousTitle = (overdueTasks.length > 0 || todayTasks.length > 0 || upcomingTasks.length > 0) ? 'style="margin-top: 20px;"' : '';
        html += `<div class="section-title" ${previousTitle}>Completed ✨</div>`;
        completedTasks.sort((a, b) => new Date(b.due) - new Date(a.due)).forEach(task => {
            html += renderTaskCard(task);
        });
    }

    // If no tasks are visible (all filtered out), show a different message
    if (!html) {
        html = `
            <div class="empty-state">
                <div class="empty-state-emoji">📅</div>
                <p>No active tasks! Add new tasks or check completed ones 💕</p>
            </div>
        `;
    }

    container.innerHTML = html;
    updateTodayProgress();
}

function renderTaskCard(task) {
    const isOverdue = new Date(task.due) < new Date() && !task.completed;
    const subjectClass = 'subject-' + task.subject.toLowerCase().replace(/\s+/g, '-');
    const subjectColor = getSubjectColor(task.subject);
    const subjectEmoji = getSubjectEmoji(task.subject);
    
    return `
        <div class="task-card ${task.completed ? 'completed' : ''} ${subjectClass}">
            <div class="task-header">
                <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
                <div class="task-name ${task.completed ? 'completed' : ''}">${task.name}</div>
                <span class="priority-emoji">${priorityEmojis[task.priority]}</span>
            </div>
            <div class="task-details">
                <span class="task-subject" style="background: ${subjectColor}20; color: ${subjectColor};">
                    ${subjectEmoji} ${task.subject}
                </span>
                <span class="task-due ${isOverdue ? 'overdue' : ''}">${formatDate(task.due)}</span>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" onclick="openTaskModal(${task.id})">Edit</button>
                <button class="task-action-btn delete-btn" onclick="openDeleteModal(${task.id})">Delete</button>
            </div>
        </div>
    `;
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;

    if (task.completed) {
        celebrate();
        hearts += 10;
        updateStreak();
        updateHeartsDisplay();
        showToast("Task completed! You earned 10 hearts! 💖");
    }

    saveData();
    updateStudyStats();
    renderTasks();
    renderSchedule();
    renderStats();
}

function openDeleteModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        taskToDelete = taskId;
        document.getElementById('delete-task-name').textContent = `"${task.name}"`;
        document.getElementById('delete-modal').classList.add('active');
    }
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
    taskToDelete = null;
}

function confirmDelete() {
    if (taskToDelete) {
        tasks = tasks.filter(t => t.id !== taskToDelete);
        saveData();
        updateStudyStats();
        renderTasks();
        renderSchedule();
        renderStats();
        showToast("Task deleted 📭");
        closeDeleteModal();
    }
}

// Flashcard Functions
function renderFlashcards() {
    const container = document.getElementById('decks-container');
    
    if (decks.length === 0) {
        container.innerHTML = `
            <div class="empty-decks-state">
                <div class="empty-decks-emoji">🎴</div>
                <p>No flashcard decks yet!</p>
                <p style="font-size: 14px; margin-top: 10px;">Create your first deck to start studying 💕</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    decks.forEach(deck => {
        const totalCards = deck.cards ? deck.cards.length : 0;
        const masteredCards = deck.cards ? deck.cards.filter(card => card.mastered).length : 0;
        const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
        const lastStudied = deck.lastStudied ? formatRelativeDate(new Date(deck.lastStudied)) : 'Never';
        const subjectEmoji = getSubjectEmoji(deck.subject);
        
        html += `
            <div class="deck-card">
                <div class="deck-header">
                    <div class="deck-name">
                        ${deck.name} 
                        <span class="deck-subject">${subjectEmoji} ${deck.subject}</span>
                    </div>
                    <div class="deck-progress">${masteryPercentage}%</div>
                </div>
                
                ${deck.description ? `<p style="font-size: 14px; color: #666; margin: 10px 0;">${deck.description}</p>` : ''}
                
                <div class="deck-stats">
                    <div class="deck-stat">
                        <span>🎴</span>
                        <span class="deck-stat-detail">${totalCards} cards</span>
                    </div>
                    <div class="deck-stat">
                        <span>✅</span>
                        <span class="deck-stat-detail">${masteredCards} mastered</span>
                    </div>
                    <div class="deck-stat">
                        <span>📅</span>
                        <span class="deck-stat-detail">${lastStudied}</span>
                    </div>
                </div>
                
                <div class="deck-actions">
                    <button class="deck-btn study-btn" onclick="startStudying('${deck.id}')">
                        Study Now
                    </button>
                    <button class="deck-btn edit-deck-btn" onclick="editDeck('${deck.id}')">
                        Add Cards
                    </button>
                    <button class="deck-btn delete-deck-btn" onclick="openDeleteDeckModal('${deck.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function openDeckModal(deckId = null) {
    const modal = document.getElementById('deck-modal');
    const form = document.getElementById('deck-form');
    
    // Hide any existing add subject inputs
    document.getElementById('deck-add-subject-input').style.display = 'none';
    document.getElementById('deck-new-subject').value = '';
    
    if (deckId) {
        const deck = decks.find(d => d.id === deckId);
        document.getElementById('deck-modal-title').textContent = 'Edit Deck';
        document.getElementById('deck-name').value = deck.name;
        document.getElementById('deck-subject').value = deck.subject;
        document.getElementById('deck-description').value = deck.description || '';
        form.dataset.deckId = deckId;
    } else {
        document.getElementById('deck-modal-title').textContent = 'Create New Deck';
        form.reset();
        delete form.dataset.deckId;
    }
    
    modal.classList.add('active');
}

function closeDeckModal() {
    document.getElementById('deck-modal').classList.remove('active');
    document.getElementById('deck-form').reset();
    delete document.getElementById('deck-form').dataset.deckId;
    document.getElementById('deck-add-subject-input').style.display = 'none';
    document.getElementById('deck-new-subject').value = '';
}

function handleDeckFormSubmit(e) {
    e.preventDefault();
    
    const deckData = {
        name: document.getElementById('deck-name').value,
        subject: document.getElementById('deck-subject').value,
        description: document.getElementById('deck-description').value,
        cards: [],
        createdAt: new Date().toISOString(),
        lastStudied: null
    };
    
    const form = document.getElementById('deck-form');
    const deckId = form.dataset.deckId;
    
    if (deckId) {
        // Update existing deck
        const deckIndex = decks.findIndex(d => d.id === deckId);
        if (deckIndex !== -1) {
            decks[deckIndex].name = deckData.name;
            decks[deckIndex].subject = deckData.subject;
            decks[deckIndex].description = deckData.description;
        }
        showToast("Deck updated! ✏️");
    } else {
        // Create new deck
        deckData.id = 'deck_' + Date.now();
        decks.push(deckData);
        showToast("New deck created! 🎴");
    }
    
    saveFlashcards();
    renderFlashcards();
    closeDeckModal();
}

function editDeck(deckId) {
    openCardModal(deckId);
}

function openCardModal(deckId) {
    const modal = document.getElementById('card-modal');
    const deck = decks.find(d => d.id === deckId);
    
    if (!deck) return;
    
    document.getElementById('card-modal-title').textContent = `Add Card to "${deck.name}"`;
    document.getElementById('card-form').dataset.deckId = deckId;
    document.getElementById('card-form').reset();
    
    modal.classList.add('active');
}

function closeCardModal() {
    document.getElementById('card-modal').classList.remove('active');
    document.getElementById('card-form').reset();
    delete document.getElementById('card-form').dataset.deckId;
}

function handleCardFormSubmit(e) {
    e.preventDefault();
    
    const deckId = document.getElementById('card-form').dataset.deckId;
    const deckIndex = decks.findIndex(d => d.id === deckId);
    
    if (deckIndex === -1) return;
    
    const cardData = {
        id: 'card_' + Date.now(),
        front: document.getElementById('card-front').value,
        back: document.getElementById('card-back').value,
        createdAt: new Date().toISOString(),
        lastReviewed: null,
        mastered: false,
        reviewCount: 0
    };
    
    // Initialize cards array if it doesn't exist
    if (!decks[deckIndex].cards) {
        decks[deckIndex].cards = [];
    }
    
    decks[deckIndex].cards.push(cardData);
    saveFlashcards();
    renderFlashcards();
    
    // Clear form but keep modal open for adding more cards
    document.getElementById('card-front').value = '';
    document.getElementById('card-back').value = '';
    document.getElementById('card-front').focus();
    
    showToast("Card added! 📝 Keep adding or close when done.");
}

function startStudying(deckId) {
    currentStudyDeck = decks.find(d => d.id === deckId);
    
    if (!currentStudyDeck || !currentStudyDeck.cards || currentStudyDeck.cards.length === 0) {
        showToast("This deck has no cards yet! Add some first 📝");
        openCardModal(deckId);
        return;
    }
    
    currentCardIndex = 0;
    currentStudyDeck.lastStudied = new Date().toISOString();
    saveFlashcards();
    
    // Reset all cards to not flipped
    document.getElementById('flashcard').classList.remove('flipped');
    
    // Update study modal
    document.getElementById('study-deck-name').textContent = currentStudyDeck.name;
    document.getElementById('total-cards').textContent = currentStudyDeck.cards.length;
    
    showCard();
    document.getElementById('study-modal').classList.add('active');
}

function closeStudyModal() {
    document.getElementById('study-modal').classList.remove('active');
    
    // Save study session
    if (currentStudyDeck) {
        const session = {
            deckId: currentStudyDeck.id,
            deckName: currentStudyDeck.name,
            date: new Date().toISOString(),
            cardsStudied: currentStudyDeck.cards.length,
            cardsMastered: currentStudyDeck.cards.filter(c => c.mastered).length
        };
        
        studyHistory.push(session);
        saveFlashcards();
    }
    
    currentStudyDeck = null;
    currentCardIndex = 0;
    
    renderFlashcards();
    showToast("Great study session! 💪");
}

function showCard() {
    if (!currentStudyDeck || !currentStudyDeck.cards || currentStudyDeck.cards.length === 0) {
        closeStudyModal();
        return;
    }
    
    const card = currentStudyDeck.cards[currentCardIndex];
    
    document.getElementById('card-front-content').textContent = card.front;
    document.getElementById('card-back-content').textContent = card.back;
    document.getElementById('current-card-number').textContent = currentCardIndex + 1;
    
    // Reset card to front side
    document.getElementById('flashcard').classList.remove('flipped');
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
}

function nextCard() {
    if (!currentStudyDeck || !currentStudyDeck.cards) return;
    
    if (currentCardIndex < currentStudyDeck.cards.length - 1) {
        currentCardIndex++;
    } else {
        currentCardIndex = 0; // Loop back to start
    }
    
    showCard();
}

function previousCard() {
    if (!currentStudyDeck || !currentStudyDeck.cards) return;
    
    if (currentCardIndex > 0) {
        currentCardIndex--;
    } else {
        currentCardIndex = currentStudyDeck.cards.length - 1; // Loop to end
    }
    
    showCard();
}

function shuffleCards() {
    if (!currentStudyDeck || !currentStudyDeck.cards) return;
    
    // Fisher-Yates shuffle algorithm
    for (let i = currentStudyDeck.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentStudyDeck.cards[i], currentStudyDeck.cards[j]] = [currentStudyDeck.cards[j], currentStudyDeck.cards[i]];
    }
    
    currentCardIndex = 0;
    showCard();
    showToast("Cards shuffled! 🔀");
}

function markCard(status) {
    if (!currentStudyDeck || !currentStudyDeck.cards) return;
    
    const card = currentStudyDeck.cards[currentCardIndex];
    card.lastReviewed = new Date().toISOString();
    card.reviewCount = (card.reviewCount || 0) + 1;
    
    if (status === 'correct') {
        card.mastered = true;
        celebrate();
        hearts += 2; // Small heart reward for learning
        updateHeartsDisplay();
        saveData();
        showToast("Great job! You know this one! ✅ +2 hearts");
    } else {
        card.mastered = false;
        showToast("That's okay! Review helps learning ❌");
    }
    
    // Save the deck after marking
    saveFlashcards();
    
    // Move to next card automatically
    setTimeout(() => {
        nextCard();
    }, 1000);
}

function openDeleteDeckModal(deckId) {
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
        deckToDelete = deckId;
        document.getElementById('delete-deck-name').textContent = `"${deck.name}"`;
        document.getElementById('delete-deck-message-text').textContent = 
            'Are you sure you want to delete this deck and all its cards?';
        document.getElementById('delete-deck-modal').classList.add('active');
    }
}

function closeDeleteDeckModal() {
    document.getElementById('delete-deck-modal').classList.remove('active');
    deckToDelete = null;
}

function confirmDeleteDeck() {
    if (deckToDelete) {
        decks = decks.filter(d => d.id !== deckToDelete);
        saveFlashcards();
        renderFlashcards();
        showToast("Deck deleted 🗑️");
        closeDeleteDeckModal();
    }
}

function formatRelativeDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

// Rewards
function renderRewards() {
    const container = document.getElementById('rewards-container');
    let html = '';

    rewards.forEach(reward => {
        const unlocked = unlockedRewards.includes(reward.id);
        const canAfford = hearts >= reward.cost;

        html += `
            <div class="reward-card ${unlocked ? '' : 'locked'}">
                <div class="reward-emoji">${reward.emoji}</div>
                <div class="reward-name">${reward.name}</div>
                <div class="reward-cost">${unlocked ? 'Unlocked! ✨' : `${reward.cost} ❤️`}</div>
                ${!unlocked ? `
                    <button class="unlock-btn" ${canAfford ? '' : 'disabled'} onclick="unlockReward(${reward.id})">
                        ${canAfford ? 'Unlock' : 'Need more ❤️'}
                    </button>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderRealRewards() {
    const container = document.getElementById('real-rewards-container');
    let html = '';

    realRewards.forEach(reward => {
        const canAfford = hearts >= reward.cost;

        html += `
            <div class="real-reward-card">
                <div class="reward-emoji">${reward.emoji}</div>
                <div class="reward-name">${reward.name}</div>
                <div class="reward-description">${reward.description}</div>
                <div class="reward-cost">${reward.cost} ❤️</div>
                <button class="unlock-btn" ${canAfford ? '' : 'disabled'} onclick="unlockRealReward(${reward.id})">
                    ${canAfford ? 'Claim Reward!' : 'Need more ❤️'}
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function unlockReward(id) {
    const reward = rewards.find(r => r.id === id);
    if (hearts >= reward.cost && !unlockedRewards.includes(id)) {
        hearts -= reward.cost;
        unlockedRewards.push(id);
        celebrate();
        updateHeartsDisplay();
        renderRewards();
        saveData();
        showToast(`You unlocked ${reward.name}! ${reward.emoji}`);
    }
}

function unlockRealReward(id) {
    const reward = realRewards.find(r => r.id === id);
    if (hearts >= reward.cost && !reward.unlocked) {
        hearts -= reward.cost;
        reward.unlocked = true;
        celebrate();
        updateHeartsDisplay();
        renderRealRewards();
        saveData();
        showToast(`You claimed ${reward.name}! I'll make it happen! 💕`);
    }
}

// Stats
function updateStudyStats() {
    studyStats.totalTasks = tasks.length;
    studyStats.completedTasks = tasks.filter(t => t.completed).length;
    
    studyStats.subjects = {};
    tasks.forEach(task => {
        if (!studyStats.subjects[task.subject]) {
            studyStats.subjects[task.subject] = { total: 0, completed: 0 };
        }
        studyStats.subjects[task.subject].total++;
        if (task.completed) {
            studyStats.subjects[task.subject].completed++;
        }
    });
    
    saveData();
}

function renderStats() {
    document.getElementById('total-tasks').textContent = studyStats.totalTasks;
    document.getElementById('completed-tasks').textContent = studyStats.completedTasks;
    document.getElementById('study-time').textContent = `${Math.floor(studyStats.studyTime / 60)}h`;
    
    const completionRate = studyStats.totalTasks > 0 
        ? Math.round((studyStats.completedTasks / studyStats.totalTasks) * 100)
        : 0;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    
    renderSubjectChart();
}

function renderSubjectChart() {
    const container = document.getElementById('subject-chart');
    let html = '';
    
    for (const [subject, data] of Object.entries(studyStats.subjects)) {
        const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        const color = getSubjectColor(subject);
        const emoji = getSubjectEmoji(subject);
        
        html += `
            <div class="subject-bar" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${emoji} ${subject}</span>
                    <span style="color: ${color}; font-weight: bold;">${percentage}%</span>
                </div>
                <div style="background: #f0f0f0; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div style="background: ${color}; width: ${percentage}%; height: 100%; border-radius: 5px;"></div>
                </div>
                <div style="font-size: 12px; color: #999; text-align: right;">
                    ${data.completed}/${data.total} completed
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html || '<p style="color: #999; text-align: center;">No subject data yet!</p>';
}

function showDailyAffirmation() {
    const today = new Date().toDateString();
    const lastAffirmation = localStorage.getItem('lastAffirmationDate');
    
    if (lastAffirmation !== today) {
        const affirmation = dailyAffirmations[Math.floor(Math.random() * dailyAffirmations.length)];
        document.getElementById('daily-affirmation').textContent = affirmation;
        localStorage.setItem('lastAffirmationDate', today);
    }
}

// Utility Functions
function celebrate() {
    const emoji = ['💖', '✨', '🌸', '🎉', '💕'][Math.floor(Math.random() * 5)];
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = emoji;
    document.body.appendChild(celebration);
    setTimeout(() => celebration.remove(), 1000);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function getRandomEncouragement() {
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
}

function updateStreak() {
    const today = new Date().toDateString();
    
    if (lastCompletionDate === today) {
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastCompletionDate === yesterdayStr || lastCompletionDate === null) {
        currentStreak++;
    } else {
        currentStreak = 1;
    }

    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
    }

    lastCompletionDate = today;
    updateStreakDisplay();
    saveData();
}

function updateStreaks() {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastCompletionDate !== today && lastCompletionDate !== yesterdayStr && lastCompletionDate !== null) {
        currentStreak = 0;
        saveData();
    }

    updateStreakDisplay();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const tomorrow = new Date(todayOnly);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
        return 'Today';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Tabs
function setupTabs() {
    document.querySelectorAll('.tabs .tab[data-view]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tabs .tab[data-view]').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            tab.classList.add('active');
            
            const viewId = tab.dataset.view + '-view';
            document.getElementById(viewId).classList.add('active');
            
            // If clicking flashcards tab, render flashcards
            if (tab.dataset.view === 'flashcards') {
                renderFlashcards();
            }
            
            // If clicking schedule tab, go to current month
            if (tab.dataset.view === 'schedule') {
                goToCurrentMonth();
            }
        });
    });
    
    const scheduleTab = document.querySelector('.tab[data-view="schedule"]');
    if (scheduleTab) {
        scheduleTab.addEventListener('click', function() {
            goToCurrentMonth();
        });
    }
}

// Calendar Functions
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function renderSchedule() {
    renderMonthlyCalendar();
}

function changeMonth(direction) {
    currentCalendarMonth += direction;
    
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    } else if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    
    renderMonthlyCalendar();
}

function goToCurrentMonth() {
    const today = new Date();
    currentCalendarMonth = today.getMonth();
    currentCalendarYear = today.getFullYear();
    renderMonthlyCalendar();
}

function renderMonthlyCalendar() {
    const container = document.getElementById('monthly-calendar');
    const monthYearDisplay = document.getElementById('current-month-year');
    
    const date = new Date(currentCalendarYear, currentCalendarMonth, 1);
    monthYearDisplay.textContent = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    let html = `
        <div class="weekday-header">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
        </div>
        <div class="calendar-grid">
    `;
    
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentCalendarYear, currentCalendarMonth, day);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const isToday = (currentCalendarYear === todayYear && 
                        currentCalendarMonth === todayMonth && 
                        day === todayDate);
        
        const isCurrentMonth = (currentCalendarYear === todayYear && 
                               currentCalendarMonth === todayMonth);
        
        const dayTasks = tasks.filter(t => {
            if (t.completed) return false;
            
            const taskDue = new Date(t.due);
            const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
            
            return taskDueOnly.getTime() === dateOnly.getTime();
        });
        
        const hasTasks = dayTasks.length > 0;
        const taskCount = dayTasks.length;
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}">
                <div class="day-number">${day}</div>
                ${isToday ? '<div class="today-indicator">Today</div>' : ''}
                ${hasTasks ? `
                    <div class="task-indicator">
                        <span class="task-count">${taskCount}</span> task${taskCount > 1 ? 's' : ''}
                    </div>
                ` : ''}
                ${!isCurrentMonth && isToday ? '<div class="not-current-month">Other Month</div>' : ''}
            </div>
        `;
    }
    
    const totalCells = firstDayOfWeek + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    
    if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    
    document.querySelectorAll('.calendar-day.has-tasks').forEach(dayElement => {
        dayElement.addEventListener('click', function() {
            const day = parseInt(this.querySelector('.day-number').textContent);
            const date = new Date(currentCalendarYear, currentCalendarMonth, day);
            showDayTasks(date);
        });
    });
}

function showDayTasks(date) {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const dayTasks = tasks.filter(t => {
        if (t.completed) return false;
        
        const taskDue = new Date(t.due);
        const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
        
        return taskDueOnly.getTime() === dateOnly.getTime();
    });
    
    if (dayTasks.length === 0) {
        showToast(`No tasks for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} 📅`);
        return;
    }
    
    const modalHtml = `
        <div class="modal active" id="day-tasks-modal">
            <div class="modal-content">
                <div class="modal-header">
                    Tasks for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div class="day-tasks-container">
                    ${dayTasks.map(task => renderTaskCard(task)).join('')}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="closeDayTasksModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstChild);
}

function closeDayTasksModal() {
    const modal = document.getElementById('day-tasks-modal');
    if (modal) {
        modal.remove();
    }
}

// NOTIFICATION SYSTEM - UPDATED FOR PWA
function requestNotificationPermission() {
    console.log('🔔 Requesting notification permission...');
    
    if (!('Notification' in window)) {
        console.log('❌ Notifications not supported');
        showToast("Your browser doesn't support notifications 🌸");
        return;
    }
    
    if (Notification.permission === 'granted') {
        console.log('✅ Notifications already granted');
        return;
    }
    
    if (Notification.permission === 'denied') {
        console.log('🔕 Notifications denied');
        showNotificationPrompt();
        return;
    }
    
    // Permission is 'default' - ask the user
    showNotificationPrompt();
}

function showNotificationPrompt() {
    const container = document.getElementById('tasks-container');
    if (!container) return;
    
    const prompt = document.createElement('div');
    prompt.className = 'notification-prompt';
    prompt.innerHTML = `
        <p>💖 Get reminders even when the app is closed?</p>
        <p style="font-size: 12px; color: #666;">Enable for better experience!📱</p>
        <button class="btn btn-primary" onclick="enableNotifications()">Enable Notifications</button>
        <button class="btn btn-secondary" onclick="this.parentElement.remove()" style="margin-top: 5px;">Not Now</button>
    `;
    
    const existingPrompt = container.querySelector('.notification-prompt');
    if (existingPrompt) existingPrompt.remove();
    
    container.insertBefore(prompt, container.firstChild);
}

function enableNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission result:', permission);
            
            if (permission === 'granted') {
                document.querySelector('.notification-prompt')?.remove();
                showToast("Notifications enabled! You'll get reminders even when app is closed 📱");
                
                // If on mobile and not PWA, suggest installation
                if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !isPWA) {
                    setTimeout(() => {
                        showToast("Tip: Install as app for best notification experience! 📱");
                    }, 2000);
                }
            } else if (permission === 'denied') {
                showToast("You can enable notifications in browser settings ⚙️");
            }
        }).catch(error => {
            console.error('Error requesting notification permission:', error);
        });
    }
}

function checkReminders() {
    console.log('🔔 Checking reminders at:', new Date().toLocaleTimeString());
    console.log('Is PWA:', isPWA);
    console.log('Notification permission:', Notification.permission);
    
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.log('❌ Notifications not enabled');
        return;
    }
    
    const now = new Date();
    const nowTime = now.getTime();
    
    console.log('Current time:', now.toLocaleString());
    
    let foundReminders = false;
    
    tasks.forEach((task, index) => {
        if (task.reminder && task.reminder.trim() !== '' && !task.completed) {
            try {
                let reminderTime;
                
                if (task.reminder.includes('T') && task.reminder.length === 16) {
                    reminderTime = new Date(task.reminder + ':00');
                } else if (task.reminder.includes('T') && task.reminder.length === 19) {
                    reminderTime = new Date(task.reminder);
                } else if (task.reminder.includes('T')) {
                    reminderTime = new Date(task.reminder);
                } else {
                    const todayStr = new Date().toISOString().split('T')[0];
                    reminderTime = new Date(todayStr + 'T' + task.reminder);
                }
                
                if (isNaN(reminderTime.getTime())) {
                    console.log(`Invalid date format for task "${task.name}": "${task.reminder}"`);
                    return;
                }
                
                const reminderTimestamp = reminderTime.getTime();
                const timeDiff = nowTime - reminderTimestamp;
                const timeDiffSeconds = Math.floor(timeDiff / 1000);
                
                console.log(`[${index}] "${task.name}"`);
                console.log(`   Reminder: ${reminderTime.toLocaleString()}`);
                console.log(`   Diff: ${timeDiffSeconds}s`);
                
                // Check if it's time for the reminder (within 1 minute window)
                if (timeDiff >= -30000 && timeDiff < 60000) { 
                    console.log('   🎯 TIME FOR NOTIFICATION!');
                    foundReminders = true;
                    
                    if (!task.notified) {
                        showNotificationForTask(task);
                        task.notified = true;
                        saveData();
                    }
                }
            } catch (error) {
                console.error(`Error parsing reminder for task "${task.name}":`, error);
            }
        }
    });
    
    if (!foundReminders) {
        console.log('📭 No reminders due at this moment');
    }
}

function showNotificationForTask(task) {
    console.log('🔄 Showing notification for task:', task.name);
    
    const messages = [
        `💕 Time to work on: ${task.name}`,
        `🌸 Gentle reminder: ${task.name}`,
        `✨ Finish this babe: ${task.name}`,
        `💖 Let's do this: ${task.name}`
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Try service worker notification first (works when app is closed)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Mrs. Villanueva Gawin mo na to', {
                body: message,
                icon: isPWA ? 'icon-192.png' : 'https://emojicdn.elk.sh/💖?size=192',
                badge: isPWA ? 'icon-192.png' : 'https://emojicdn.elk.sh/💖?size=512',
                tag: `reminder-${task.id}`,
                requireInteraction: true,
                vibrate: [200, 100, 200, 100, 200],
                data: {
                    taskId: task.id,
                    taskName: task.name,
                    url: window.location.href
                }
            });
            console.log('✅ Service Worker notification sent');
        }).catch(error => {
            console.log('Service worker notification failed:', error);
            showRegularNotification(task, message);
        });
    } else {
        showRegularNotification(task, message);
    }
    
    // Also show toast if app is open
    showToast(`Reminder: ${task.name} ⏰`);
}

function showRegularNotification(task, message) {
    try {
        const notification = new Notification('Cozy Study Reminder', {
            body: message,
            icon: '🌸',
            requireInteraction: true,
            tag: `reminder-${task.id}`
        });
        
        notification.onclick = function() {
            window.focus();
            this.close();
        };
        
        setTimeout(() => {
            notification.close();
        }, 10000);
        
        console.log('✅ Regular notification shown');
        
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
