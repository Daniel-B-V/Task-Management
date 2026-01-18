// Configuration
let tasks = [];
let hearts = 0; // Starting with 0 hearts
let currentStreak = 0;
let taskToDelete = null; // Store the task ID to delete
let bestStreak = 0;
let lastCompletionDate = null;
let editingTaskId = null;
let unlockedRewards = [];
let customSubjects = []; // Array to store custom subjects
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
    mode: 'Focus', // Focus, Break, Long Break
    interval: null
};
let studyStats = {
    totalTasks: 0,
    completedTasks: 0,
    studyTime: 0, // in minutes
    subjects: {}
};

// Updated priority emojis to stars
const priorityEmojis = {
    low: '🌟',      // 1 star
    medium: '🌟🌟',  // 2 stars
    high: '🌟🌟🌟'   // 3 stars
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

// Love messages from you (Edit these with your own messages!)
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
    loadData();
    applyTheme(settings.theme);
    updateWelcomeMessage();
    updateStreaks();
    renderTasks();
    renderSchedule();
    renderRewards();
    renderRealRewards();
    renderStats();
    updateHeartsDisplay();
    updateTimerDisplay(); // This will update both modal and nav timer
    setupTabs();
    setupScheduleTabs();
    setupEventListeners();
    requestNotificationPermission();
    checkReminders();
    setInterval(checkReminders, 60000);
    
    // Show loading screen for 2 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        showToast("Welcome back, my love! 💕");
    }, 2000);
    
    // Show daily affirmation
    showDailyAffirmation();
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
    
    // Populate custom subjects in dropdown
    populateCustomSubjects();
    updateStudyStats();
}

function populateCustomSubjects() {
    const select = document.getElementById('task-subject');
    // Remove existing custom subjects (except the first 6 default ones)
    for (let i = select.options.length - 1; i >= 6; i--) {
        select.remove(i);
    }
    
    // Add custom subjects
    customSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject + ' 📝';
        select.appendChild(option);
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
        customSubjects  // Save custom subjects
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
        // Check if subject already exists
        const select = document.getElementById('task-subject');
        const existingOption = Array.from(select.options).find(option => 
            option.value.toLowerCase() === newSubject.toLowerCase()
        );
        
        if (existingOption) {
            showToast(`Subject "${newSubject}" already exists! 📚`);
            select.value = newSubject;
            document.getElementById('add-subject-input').style.display = 'none';
            document.getElementById('new-subject').value = '';
            return;
        }
        
        // Add to custom subjects if not already there
        if (!customSubjects.includes(newSubject)) {
            customSubjects.push(newSubject);
        }
        
        // Add to dropdown
        const option = document.createElement('option');
        option.value = newSubject;
        option.textContent = newSubject + ' 📝';
        select.appendChild(option);
        
        // Select the new subject
        select.value = newSubject;
        
        // Hide the input and clear it
        document.getElementById('add-subject-input').style.display = 'none';
        document.getElementById('new-subject').value = '';
        
        // Save to localStorage
        saveData();
        
        showToast(`Added new subject: ${newSubject} 📚`);
    }
}

// Get subject color with fallback for custom subjects
function getSubjectColor(subject) {
    return subjectColors[subject] || '#999';
}

// Get subject emoji with fallback for custom subjects
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
        timer.isRunning = true;
        timer.interval = setInterval(updateTimer, 1000);
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
    setTimer(25, 'Focus');
    closeTimerModal();
    showToast("Timer stopped. Great work! 💪");
}

function resetTimer() {
    if (timer.mode === 'Focus') {
        setTimer(25, 'Focus');
    } else if (timer.mode === 'Break') {
        setTimer(5, 'Break');
    } else {
        setTimer(10, 'Long Break');
    }
}

function setTimer(minutes, mode) {
    timer.minutes = minutes;
    timer.seconds = 0;
    timer.mode = mode;
    updateTimerDisplay();
    document.getElementById('current-mode').textContent = mode;
}

function updateTimer() {
    if (timer.seconds === 0) {
        if (timer.minutes === 0) {
            // Timer completed
            clearInterval(timer.interval);
            timer.isRunning = false;
            document.getElementById('timer-start-btn').textContent = 'Start';
            
            // Add study time to stats
            if (timer.mode === 'Focus') {
                studyStats.studyTime += 25;
                hearts += 10; // Reward for completing a study session
                updateHeartsDisplay();
                saveData();
                renderStats();
                
                // Celebration
                celebrate();
                showToast("Great focus session! You earned 10 hearts! 💖");
                
                // Ask for break
                if (confirm("Time for a 5-minute break? You've earned it! 🌸")) {
                    setTimer(5, 'Break');
                    startTimer();
                }
            } else {
                showToast("Break time's up! Ready for another session? 🎯");
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
    // Update modal display
    document.getElementById('timer-minutes').textContent = 
        timer.minutes.toString().padStart(2, '0');
    document.getElementById('timer-seconds').textContent = 
        timer.seconds.toString().padStart(2, '0');
    
    // Update nav timer display
    updateNavTimer();
}

function updateNavTimer() {
    const quickTimer = document.getElementById('quick-timer');
    if (quickTimer) {
        quickTimer.textContent = `${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`;
    }
}

// Modal Functions
function openTimerModal() {
    document.getElementById('timer-modal').classList.add('active');
}

function closeTimerModal() {
    document.getElementById('timer-modal').classList.remove('active');
}

function openSettings() {
    // Load current settings
    document.getElementById('user-name').value = settings.userName;
    document.getElementById('daily-goal').value = settings.dailyGoal;
    document.getElementById('study-sounds').value = settings.studySound;
    
    // Set active theme
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
    
    // Update welcome message
    updateWelcomeMessage();
    
    saveData();
    closeSettings();
    showToast("Settings saved! ✨");
}

function showSecretMessage() {
    const randomMessage = secretMessages[Math.floor(Math.random() * secretMessages.length)];
    document.getElementById('secret-message-text').textContent = randomMessage;
    
    // Close settings modal first
    closeSettings();
    
    // Then show secret message after a small delay for smooth transition
    setTimeout(() => {
        document.getElementById('secret-modal').classList.add('active');
    }, 300); // 300ms delay for smooth transition
}

function closeSecretModal() {
    document.getElementById('secret-modal').classList.remove('active');
}

// Task Management
function addQuickTask() {
    const input = document.getElementById('quick-task-input');
    const taskName = input.value.trim();
    
    if (taskName) {
        const taskData = {
            id: Date.now(),
            name: taskName,
            subject: 'Other',
            due: new Date().toISOString().split('T')[0],
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
        showToast("Quick task added! ✅");
    }
}

function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    editingTaskId = taskId;

    // Hide any open add subject input
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
    // Hide add subject input when closing modal
    document.getElementById('add-subject-input').style.display = 'none';
    document.getElementById('new-subject').value = '';
}

function selectPriority(priority) {
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-priority="${priority}"]`).classList.add('selected');
}

// Event Listeners
function setupEventListeners() {
    // Task form submission
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedPriority = document.querySelector('.priority-btn.selected');
        if (!selectedPriority) {
            showToast("Please select a priority! 🌟");
            return;
        }

        const reminderInput = document.getElementById('task-reminder').value;
        let reminderValue = '';
        
        // Convert reminder to proper format if provided
        if (reminderInput) {
            // HTML datetime-local gives format: "YYYY-MM-DDTHH:MM"
            // Convert to: "YYYY-MM-DDTHH:MM:00" for consistency
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

    // Quick task input (press Enter)
    document.getElementById('quick-task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addQuickTask();
        }
    });

    // Close add subject input when clicking outside
    document.addEventListener('click', (e) => {
        const addSubjectInput = document.getElementById('add-subject-input');
        const addSubjectBtn = document.querySelector('.add-subject-btn');
        
        if (addSubjectInput.style.display === 'block' && 
            !addSubjectInput.contains(e.target) && 
            !addSubjectBtn.contains(e.target)) {
            addSubjectInput.style.display = 'none';
            document.getElementById('new-subject').value = '';
        }
    });
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
    
    // Only count tasks due TODAY
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
    
    // Get today's date at midnight
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Separate tasks
    const todayTasks = tasks.filter(t => {
        if (t.completed) return false; // Don't show completed tasks in today's section
        const taskDue = new Date(t.due);
        const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
        return taskDueOnly.getTime() === todayOnly.getTime();
    });
    
    const upcomingTasks = tasks.filter(t => {
        if (t.completed) return false; // Don't show completed tasks in upcoming section
        const taskDue = new Date(t.due);
        const taskDueOnly = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
        return taskDueOnly.getTime() > todayOnly.getTime(); // Only FUTURE dates
    });
    
    const completedTasks = tasks.filter(t => t.completed).sort((a, b) => new Date(b.due) - new Date(a.due));

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

    // Show Today's Tasks
    if (todayTasks.length > 0) {
        html += '<div class="section-title">Today\'s Tasks 📅</div>';
        todayTasks.forEach(task => {
            html += renderTaskCard(task);
        });
    }

    // Show Upcoming Tasks (future dates)
    if (upcomingTasks.length > 0) {
        html += '<div class="section-title" style="margin-top: 20px;">Upcoming Tasks 🔮</div>';
        upcomingTasks.sort((a, b) => new Date(a.due) - new Date(b.due)).forEach(task => {
            html += renderTaskCard(task);
        });
    }

    // Show Completed Tasks
    if (completedTasks.length > 0) {
        html += '<div class="section-title" style="margin-top: 20px;">Completed ✨</div>';
        completedTasks.forEach(task => {
            html += renderTaskCard(task);
        });
    }

    container.innerHTML = html;
    updateTodayProgress();
}

// Delete Modal Functions
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

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task? 🥺')) {
        tasks = tasks.filter(t => t.id !== id);
        saveData();
        updateStudyStats();
        renderTasks();
        renderSchedule();
        renderStats();
        showToast("Task deleted 📭");
    }
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
    
    // Update subject breakdown
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
    // Update stat cards
    document.getElementById('total-tasks').textContent = studyStats.totalTasks;
    document.getElementById('completed-tasks').textContent = studyStats.completedTasks;
    document.getElementById('study-time').textContent = `${Math.floor(studyStats.studyTime / 60)}h`;
    
    const completionRate = studyStats.totalTasks > 0 
        ? Math.round((studyStats.completedTasks / studyStats.totalTasks) * 100)
        : 0;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    
    // Update subject chart
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
            document.getElementById(tab.dataset.view + '-view').classList.add('active');
        });
    });
}

function setupScheduleTabs() {
    document.querySelectorAll('.tab[data-schedule]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab[data-schedule]').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.schedule-content').forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.schedule + '-schedule').classList.add('active');
        });
    });
}

// Calendar Functions
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function renderSchedule() {
    renderMonthlyCalendar();
}

function changeMonth(direction) {
    // Update current month/year
    currentCalendarMonth += direction;
    
    // Handle year rollover
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
    
    // Update month/year display
    const date = new Date(currentCalendarYear, currentCalendarMonth, 1);
    monthYearDisplay.textContent = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get first day of month
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    // Get last day of month
    const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    // Get number of days in month
    const daysInMonth = lastDay.getDate();
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get today's date for comparison
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    // Create calendar header with weekdays
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
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentCalendarYear, currentCalendarMonth, day);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Check if this is today
        const isToday = (currentCalendarYear === todayYear && 
                        currentCalendarMonth === todayMonth && 
                        day === todayDate);
        
        // Check if this is current month
        const isCurrentMonth = (currentCalendarYear === todayYear && 
                               currentCalendarMonth === todayMonth);
        
        // Get tasks for this day
        const dayTasks = tasks.filter(t => {
            if (t.completed) return false; // Don't show completed tasks
            
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
    
    // Add empty cells to complete the last row (if needed)
    const totalCells = firstDayOfWeek + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    
    if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
    }
    
    html += '</div>'; // Close calendar-grid
    
    container.innerHTML = html;
    
    // Add click event to each day
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
    
    // Get tasks for this specific day
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
    
    // Create modal for day tasks
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
    
    // Add modal to body
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

// Update the setupTabs function to call renderSchedule when Schedule tab is clicked
const originalSetupTabs = setupTabs;
setupTabs = function() {
    originalSetupTabs();
    
    // Add click listener for schedule tab
    const scheduleTab = document.querySelector('.tab[data-view="schedule"]');
    if (scheduleTab) {
        scheduleTab.addEventListener('click', function() {
            // Reset to current month when clicking schedule tab
            goToCurrentMonth();
        });
    }
};

// Notifications - FIXED VERSION
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const container = document.getElementById('tasks-container');
        const prompt = document.createElement('div');
        prompt.className = 'notification-prompt';
        prompt.innerHTML = `
            <p>💖 Get gentle reminders for your tasks?</p>
            <button class="btn btn-primary" onclick="enableNotifications()">Enable Reminders</button>
        `;
        container.insertBefore(prompt, container.firstChild);
    }
}

function enableNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                document.querySelector('.notification-prompt')?.remove();
                showToast("Reminders enabled! 💕");
            }
        });
    }
}

function checkReminders() {
    console.log('🔔 Checking reminders at:', new Date().toLocaleTimeString());
    
    if ('Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        console.log('✅ Notifications enabled, current time:', now.toLocaleString());
        
        let foundReminders = false;
        
        tasks.forEach(task => {
            if (task.reminder && task.reminder.trim() !== '' && !task.completed && !task.notified) {
                // Convert reminder to proper date
                let reminderTime;
                if (task.reminder.length === 16) { // Format: "YYYY-MM-DDTHH:MM"
                    reminderTime = new Date(task.reminder + ':00');
                } else {
                    reminderTime = new Date(task.reminder);
                }
                
                // Debug log
                console.log(`Task: "${task.name}"`);
                console.log(`Reminder time: ${reminderTime.toLocaleString()}`);
                console.log(`Now: ${now.toLocaleString()}`);
                console.log(`Time difference (seconds): ${Math.floor((now - reminderTime) / 1000)}`);
                
                // Check if reminder time is within the last minute
                const timeDiff = now - reminderTime;
                if (timeDiff >= 0 && timeDiff < 60000) { // Within 1 minute after reminder
                    console.log('🎯 SHOWING NOTIFICATION NOW!');
                    foundReminders = true;
                    
                    const messages = [
                        `💕 Time to work on: ${task.name}`,
                        `🌸 Gentle reminder: ${task.name}`,
                        `✨ You've got this! ${task.name}`,
                        `💖 Let's do this: ${task.name}`
                    ];
                    const message = messages[Math.floor(Math.random() * messages.length)];
                    
                    new Notification('Cozy Study Reminder', {
                        body: message,
                        icon: '🌸',
                        requireInteraction: true
                    });
                    
                    task.notified = true;
                    saveData();
                }
            }
        });
        
        if (!foundReminders) {
            console.log('📭 No reminders due right now');
        }
    } else {
        console.log('❌ Notifications not available or not granted');
        console.log('Permission status:', Notification.permission);
    }
}

// Test function for notifications (add this to test)
function testNotificationNow() {
    console.log('🔧 Testing notification system...');
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Test Notification', {
            body: 'This is a test notification! If you see this, notifications work! ✅',
            icon: '🌸',
            requireInteraction: true
        });
        console.log('Test notification sent!');
        showToast('Test notification sent! Check your notifications. ✅');
    } else {
        console.log('Notification permission not granted');
        showToast('Please enable notifications first! ⚠️');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
