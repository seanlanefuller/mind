/**
 * Mind Spark - Application Logic
 */

/* --- Navigation & App Management --- */
const app = {
    sections: [
        'dashboard',
        'memory-section',
        'math-section',
        'breath-section',
        'scramble-section',
        'sequence-section',
        'journal-section',
        'focus-section',
        'reflex-section',
        'settings-section',
        'resources-section'
    ],

    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Load Profile & Greeting
        profileApp.load();

        // Initialize helpers
        mathGame.generateProblem();
        journalApp.load();
    },

    navigate(targetId) {
        // Handle direct IDs or mapped names
        const map = {
            'memory': 'memory-section',
            'math': 'math-section',
            'breath': 'breath-section',
            'scramble': 'scramble-section',
            'sequence': 'sequence-section',
            'journal': 'journal-section',
            'focus': 'focus-section',
            'reflex': 'reflex-section',
            'settings': 'settings-section',
            'resources': 'resources-section',
            'dashboard': 'dashboard'
        };
        const sectionId = map[targetId] || targetId;

        this.sections.forEach(id => {
            const el = document.getElementById(id);
            if (id === sectionId) {
                el.classList.remove('hidden-section');
                el.classList.add('active-section');

                // Trigger specific inits
                if (targetId === 'memory') memoryGame.init();
                if (targetId === 'math') mathGame.init();
                if (targetId === 'breath') breathGame.start();
                if (targetId === 'scramble') scrambleGame.init();
                if (targetId === 'sequence') sequenceGame.init();
                if (targetId === 'focus') focusGame.init();
            } else {
                el.classList.add('hidden-section');
                el.classList.remove('active-section');

                // Cleanup
                if (id === 'breath-section') breathGame.stop();
                if (id === 'sequence-section') sequenceGame.stop();
                if (id === 'reflex-section') reflexGame.stop();
            }
        });
    },

    updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

        document.getElementById('clock-display').textContent = timeStr;
        document.getElementById('date-display').textContent = dateStr;
    },

    setGreeting(name = '') {
        const hour = new Date().getHours();
        let greeting = 'Good ';
        if (hour < 12) greeting += 'Morning';
        else if (hour < 18) greeting += 'Afternoon';
        else greeting += 'Evening';

        if (name) greeting += `, ${name}`;
        else greeting += '.';

        document.getElementById('time-of-day').textContent = greeting;
    }
};

/* --- Memory Game --- */
const memoryGame = {
    emojis: ['🍎', '🏡', '🐶', '🚗', '🌞', '📚', '🌷', '🍕'],
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    locked: false,

    init() {
        this.restart();
    },

    restart() {
        const board = document.getElementById('memory-board');
        board.innerHTML = '';
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.locked = false;
        this.updateStats();

        // Create pairs and shuffle
        const gameItems = [...this.emojis, ...this.emojis];
        this.cards = this.shuffle(gameItems);

        this.cards.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.value = item;
            card.innerHTML = ''; // Start hidden
            card.addEventListener('click', () => this.flipCard(card));
            board.appendChild(card);
        });
    },

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    flipCard(card) {
        if (this.locked) return;
        if (card.classList.contains('flipped')) return;
        if (card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.value;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    },

    checkMatch() {
        this.locked = true;
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.value === card2.dataset.value;

        if (match) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            this.flippedCards = [];
            this.locked = false;

            if (this.matchedPairs === this.emojis.length) {
                setTimeout(() => alert('Wonderful memory! Puzzle completed.'), 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.textContent = '';
                card2.textContent = '';
                this.flippedCards = [];
                this.locked = false;
            }, 1000);
        }
    },

    updateStats() {
        document.getElementById('memory-moves').textContent = this.moves;
    }
};

/* --- Math Game --- */
const mathGame = {
    init() {
        this.generateProblem();
    },

    generateProblem() {
        const feedback = document.getElementById('math-feedback');
        feedback.textContent = '';
        feedback.className = 'feedback-message';

        const operators = ['+', '-', '×'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let num1, num2, answer;

        if (operator === '+') {
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            answer = num1 + num2;
        } else if (operator === '-') {
            num1 = Math.floor(Math.random() * 12) + 5;
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
            answer = num1 - num2;
        } else {
            // Multiplication (keep single digits for simplicity)
            num1 = Math.floor(Math.random() * 9) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            answer = num1 * num2;
        }

        document.getElementById('math-problem').textContent = `${num1} ${operator} ${num2} = ?`;
        this.generateOptions(answer);
    },

    generateOptions(correctAnswer) {
        const optionsContainer = document.getElementById('math-options');
        optionsContainer.innerHTML = '';

        let options = [correctAnswer];
        while (options.length < 3) {
            let offset = Math.floor(Math.random() * 5) + 1;
            let wrong = Math.random() < 0.5 ? correctAnswer + offset : correctAnswer - offset;
            if (wrong > 0 && !options.includes(wrong)) {
                options.push(wrong);
            }
        }

        options.sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'math-btn';
            btn.textContent = opt;
            btn.onclick = () => this.checkAnswer(opt, correctAnswer, btn);
            optionsContainer.appendChild(btn);
        });
    },

    checkAnswer(selected, correct, btnElement) {
        const feedback = document.getElementById('math-feedback');
        if (selected === correct) {
            btnElement.style.background = 'var(--success-color)';
            btnElement.style.color = 'white';
            feedback.textContent = 'Correct!';
            feedback.style.color = 'var(--success-color)';
            setTimeout(() => this.generateProblem(), 1500);
        } else {
            btnElement.style.background = 'var(--error-color)';
            btnElement.style.color = 'white';
            feedback.textContent = 'Try again.';
            feedback.style.color = 'var(--error-color)';
        }
    }
};

/* --- Breathing Exercise --- */
const breathGame = {
    timer: null,

    start() {
        const circle = document.getElementById('breath-circle');
        const text = document.getElementById('breath-text');

        circle.classList.add('animate');
        this.cycleText(text);
        this.timer = setInterval(() => this.cycleText(text), 4000);
    },

    cycleText(element) {
        if (element.textContent === 'Inhale') {
            element.textContent = 'Exhale';
        } else {
            element.textContent = 'Inhale';
        }
    },

    stop() {
        const circle = document.getElementById('breath-circle');
        circle.classList.remove('animate');
        clearInterval(this.timer);
        document.getElementById('breath-text').textContent = 'Inhale';
    }
};

/* --- Word Scramble --- */
const scrambleGame = {
    words: ['HAPPY', 'SMILE', 'GARDEN', 'FAMILY', 'MUSIC', 'WATER', 'PEACE', 'FRIEND'],
    currentWord: '',
    scrambled: [],
    slots: [],

    init() {
        this.generateWord();
    },

    generateWord() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.scrambled = this.currentWord.split('').sort(() => Math.random() - 0.5);
        this.slots = new Array(this.currentWord.length).fill(null);

        this.render();
        document.getElementById('scramble-feedback').textContent = '';
    },

    render() {
        const sourceContainer = document.getElementById('scramble-word');
        const targetContainer = document.getElementById('scramble-slots');

        sourceContainer.innerHTML = '';
        targetContainer.innerHTML = '';

        // Source Letters (Available)
        this.scrambled.forEach((char, idx) => {
            if (char !== null) {
                const tile = this.createTile(char, () => this.placeLetter(idx, char));
                sourceContainer.appendChild(tile);
            }
        });

        // Target Slots (Placed)
        this.slots.forEach((char, idx) => {
            const slot = document.createElement('div');
            slot.className = 'letter-tile';
            if (char) {
                slot.textContent = char;
                slot.classList.add('placed');
                slot.onclick = () => this.removeLetter(idx, char);
            } else {
                slot.style.borderStyle = 'dashed';
                slot.style.borderColor = 'var(--text-secondary)';
            }
            targetContainer.appendChild(slot);
        });

        // Check win
        if (!this.slots.includes(null)) {
            const guess = this.slots.join('');
            const feedback = document.getElementById('scramble-feedback');
            if (guess === this.currentWord) {
                feedback.textContent = 'Correct!';
                feedback.style.color = 'var(--success-color)';
                setTimeout(() => this.generateWord(), 1500);
            } else {
                feedback.textContent = 'Not quite. Click letters to remove and try again.';
                feedback.style.color = 'var(--error-color)';
            }
        }
    },

    createTile(char, onClick) {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = char;
        tile.onclick = onClick;
        return tile;
    },

    placeLetter(sourceIdx, char) {
        const emptySlotIdx = this.slots.indexOf(null);
        if (emptySlotIdx !== -1) {
            this.slots[emptySlotIdx] = char;
            this.scrambled[sourceIdx] = null; // Mark as used
            this.render();
        }
    },

    removeLetter(slotIdx, char) {
        this.slots[slotIdx] = null;
        // Find first null in scrambled to return it to specific spot? 
        // No, just find first null spot in scrambled array or append
        // Actually, we need to respect the original scrambled implementation to avoid duplicating letters oddly
        // Simplest: Just add it back to first available null in scrambled
        const returnIdx = this.scrambled.indexOf(null);
        if (returnIdx !== -1) this.scrambled[returnIdx] = char;

        this.render();
    }
};

/* --- Sequence Game (Color Path) --- */
const sequenceGame = {
    sequence: [],
    playerSequence: [],
    level: 1,
    colors: ['red', 'blue', 'green', 'yellow'],
    isPlaying: false,

    init() {
        this.reset();
    },

    stop() {
        this.isPlaying = false;
        this.sequence = [];
    },

    reset() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        document.getElementById('sequence-level').textContent = this.level;
        document.getElementById('sequence-message').textContent = 'Press Start to begin';
        document.getElementById('sequence-start-btn').disabled = false;

        // Attach listeners
        const btns = document.querySelectorAll('.seq-btn');
        btns.forEach(btn => {
            // Clone to remove old listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => this.handleInput(newBtn.dataset.color));
        });
    },

    startGame() {
        this.reset();
        this.isPlaying = true;
        document.getElementById('sequence-start-btn').disabled = true;
        document.getElementById('sequence-message').textContent = 'Watch...';
        this.nextRound();
    },

    nextRound() {
        this.playerSequence = [];
        const nextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.sequence.push(nextColor);
        this.playSequence();
    },

    playSequence() {
        let i = 0;
        const interval = setInterval(() => {
            this.highlight(this.sequence[i]);
            i++;
            if (i >= this.sequence.length) {
                clearInterval(interval);
                document.getElementById('sequence-message').textContent = 'Your turn!';
            }
        }, 1000);
    },

    highlight(color) {
        const btn = document.querySelector(`.seq-btn[data-color="${color}"]`);
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 500);
    },

    handleInput(color) {
        if (!this.isPlaying) return;

        this.highlight(color); // visual feedback
        this.playerSequence.push(color);

        const index = this.playerSequence.length - 1;
        if (this.playerSequence[index] !== this.sequence[index]) {
            document.getElementById('sequence-message').textContent = 'Incorrect. Game Over.';
            this.isPlaying = false;
            document.getElementById('sequence-start-btn').disabled = false;
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.level++;
            document.getElementById('sequence-level').textContent = this.level;
            document.getElementById('sequence-message').textContent = 'Correct!';
            setTimeout(() => this.nextRound(), 1000);
        }
    }
};

/* --- Daily Journal --- */
const journalApp = {
    load() {
        const today = new Date().toLocaleDateString();
        const savedData = JSON.parse(localStorage.getItem('mindSparkJournal')) || {};
        const entry = savedData[today] || '';
        document.getElementById('journal-entry').value = entry;
    },

    save() {
        const today = new Date().toLocaleDateString();
        const content = document.getElementById('journal-entry').value;
        const savedData = JSON.parse(localStorage.getItem('mindSparkJournal')) || {};

        savedData[today] = content;
        localStorage.setItem('mindSparkJournal', JSON.stringify(savedData));

        const status = document.getElementById('journal-status');
        status.style.opacity = '1';
        setTimeout(() => status.style.opacity = '0', 2000);
    }
};

/* --- Focus Challenge (Stroop) --- */
const focusGame = {
    colors: [
        { name: 'RED', hex: '#EF4444' },
        { name: 'BLUE', hex: '#3B82F6' },
        { name: 'GREEN', hex: '#10B981' },
        { name: 'YELLOW', hex: '#F59E0B' }
    ],
    score: 0,
    currentColor: null,
    currentWord: null,

    init() {
        this.score = 0;
        document.getElementById('focus-score').textContent = this.score;
        this.nextRound();
    },

    nextRound() {
        // Pick a word (text)
        const wordObj = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.currentWord = wordObj.name;

        // Pick a color (ink)
        const colorObj = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.currentColor = colorObj;

        // Display
        const wordEl = document.getElementById('focus-word');
        wordEl.textContent = this.currentWord;
        wordEl.style.color = this.currentColor.hex;

        // Feedback reset
        document.getElementById('focus-feedback').textContent = '';

        this.generateButtons();
    },

    generateButtons() {
        const container = document.getElementById('focus-options');
        container.innerHTML = '';

        // Buttons are fixed set of colors
        this.colors.forEach(col => {
            const btn = document.createElement('button');
            btn.className = 'math-btn';
            btn.textContent = col.name;
            // The logic: Click the name of the INK COLOR
            btn.onclick = () => this.checkAnswer(col.name);
            container.appendChild(btn);
        });
    },

    checkAnswer(selectedColorName) {
        const feedback = document.getElementById('focus-feedback');

        if (selectedColorName === this.currentColor.name) {
            this.score++;
            document.getElementById('focus-score').textContent = this.score;
            feedback.textContent = 'Correct!';
            feedback.style.color = 'var(--success-color)';
            setTimeout(() => this.nextRound(), 1000);
        } else {
            feedback.textContent = 'Focus on the INK color!';
            feedback.style.color = 'var(--error-color)';
        }
    }
};

/* --- Reflex Game --- */
const reflexGame = {
    score: 0,
    active: false,
    interval: null,

    start() {
        this.active = true;
        this.score = 0;
        document.getElementById('reflex-intro').style.display = 'none';
        this.spawnLoop();
    },

    stop() {
        this.active = false;
        clearTimeout(this.interval);
        // Clean up bubbles
        const area = document.getElementById('reflex-area');
        const bubbles = area.querySelectorAll('.reflex-bubble');
        bubbles.forEach(b => b.remove());
        document.getElementById('reflex-intro').style.display = 'flex';
    },

    spawnLoop() {
        if (!this.active) return;

        this.spawnBubble();

        // Random interval between 500ms and 1500ms
        const nextTime = Math.random() * 1000 + 500;
        this.interval = setTimeout(() => this.spawnLoop(), nextTime);
    },

    spawnBubble() {
        const area = document.getElementById('reflex-area');
        const bubble = document.createElement('div');
        bubble.className = 'reflex-bubble';
        bubble.textContent = 'POP';

        // Random Position
        const maxX = area.clientWidth - 60;
        const maxY = area.clientHeight - 60;
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;

        bubble.style.left = x + 'px';
        bubble.style.top = y + 'px';

        // Click handler
        bubble.onclick = (e) => {
            e.stopPropagation();
            this.popBubble(bubble);
        };

        // Auto remove after time (missed)
        setTimeout(() => {
            if (bubble.parentNode) bubble.remove();
        }, 2000);

        area.appendChild(bubble);
    },

    popBubble(bubble) {
        bubble.style.transform = 'scale(1.5)';
        bubble.style.opacity = '0';
        setTimeout(() => bubble.remove(), 200);
    }
};

/* --- Profile Settings --- */
const profileApp = {
    load() {
        const name = localStorage.getItem('mindSparkName') || '';
        document.getElementById('user-name').value = name;
        app.setGreeting(name);
    },

    save() {
        const name = document.getElementById('user-name').value.trim();
        localStorage.setItem('mindSparkName', name);
        app.setGreeting(name);

        const status = document.getElementById('profile-status');
        status.textContent = 'Profile saved successfully.';
        status.style.color = 'var(--success-color)';
        setTimeout(() => status.textContent = '', 2000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
