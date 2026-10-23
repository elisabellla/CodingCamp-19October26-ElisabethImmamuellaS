document.addEventListener('DOMContentLoaded', function() {
    
    // 1. JAM DAN SAPAAN (DENGAN NAMA KUSTOM)

    var clockEl = document.getElementById('clock');
    var dateEl = document.getElementById('date');
    var greetingEl = document.getElementById('greeting');
    var editNameBtn = document.getElementById('edit-name-btn');

    var userName = localStorage.getItem('dashboard_user_name') || '';

    function updateClock() {
        var now = new Date();
        
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = hours + ':' + minutes + ':' + seconds;

        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);

        var hourNow = now.getHours();
        var timeGreeting = 'Good Morning';
        
        if (hourNow >= 12 && hourNow < 17) {
            timeGreeting = 'Good Afternoon';
        } else if (hourNow >= 17 && hourNow < 21) {
            timeGreeting = 'Good Evening';
        } else if (hourNow >= 21 || hourNow < 4) {
            timeGreeting = 'Good Night';
        }

        if (userName !== '') {
            greetingEl.textContent = timeGreeting + ', ' + userName;
        } else {
            greetingEl.textContent = timeGreeting;
        }
    }

    setInterval(updateClock, 1000);
    updateClock();

    editNameBtn.addEventListener('click', function() {
        var newName = prompt('Masukkan nama panggilan Anda:', userName);
        if (newName !== null) {
            userName = newName.trim();
            localStorage.setItem('dashboard_user_name', userName);
            updateClock();
        }
    });

    // 2. FOCUS TIMER & UBAH WAKTU POMODORO

    var timerDisplay = document.getElementById('timer-display');
    var startBtn = document.getElementById('start-btn');
    var stopBtn = document.getElementById('stop-btn');
    var resetBtn = document.getElementById('reset-btn');
    var timerInput = document.getElementById('timer-input');
    var setTimerBtn = document.getElementById('set-timer-btn');

    var defaultMinutes = 25;
    var timeLeft = defaultMinutes * 60;
    var timerInterval = null;
    var isRunning = false;

    function formatTime(totalSeconds) {
        var mins = Math.floor(totalSeconds / 60);
        var secs = totalSeconds % 60;
        var mStr = mins < 10 ? '0' + mins : mins;
        var sStr = secs < 10 ? '0' + secs : secs;
        return mStr + ':' + sStr;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
    }

    setTimerBtn.addEventListener('click', function() {
        var val = parseInt(timerInput.value);
        if (!isNaN(val) && val > 0 && val <= 60) {
            defaultMinutes = val;
            if (isRunning === false) {
                timeLeft = defaultMinutes * 60;
                updateTimerDisplay();
            }
        } else {
            alert('Masukkan angka antara 1 sampai 60.');
        }
    });

    startBtn.addEventListener('click', function() {
        if (isRunning === false) {
            isRunning = true;
            timerInterval = setInterval(function() {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    alert('Waktu fokus selesai! Silakan istirahat sebentar.');
                }
            }, 1000);
        }
    });

    stopBtn.addEventListener('click', function() {
        clearInterval(timerInterval);
        isRunning = false;
    });

    resetBtn.addEventListener('click', function() {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = defaultMinutes * 60;
        updateTimerDisplay();
    });

    // 3. TO-DO LIST (CEGAH DUPLIKASI TUGAS)
    
    var taskInput = document.getElementById('task-input');
    var addTaskBtn = document.getElementById('add-task-btn');
    var taskListContainer = document.getElementById('task-list-container');

    var tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];

    function saveTasks() {
        localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskListContainer.innerHTML = '';
        
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p class="text-beige/50 text-xs text-center py-2">Belum ada tugas.</p>';
            return;
        }

        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            
            var taskItem = document.createElement('div');
            taskItem.className = 'flex items-center justify-between bg-charcoal border border-beige/10 px-3 py-2 rounded gap-2 text-sm';

            var leftDiv = document.createElement('div');
            leftDiv.className = 'flex items-center gap-2 flex-1 overflow-hidden';

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.className = 'accent-[#8B2635] cursor-pointer';
            
            // Simpan indeks dalam closure/variabel lokal
            (function(index) {
                checkbox.addEventListener('change', function() {
                    tasks[index].completed = checkbox.checked;
                    saveTasks();
                    renderTasks();
                });
            })(i);

            var span = document.createElement('span');
            span.textContent = task.text;
            if (task.completed) {
                span.className = 'line-through text-beige/40 truncate flex-1';
            } else {
                span.className = 'text-white truncate flex-1';
            }

            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(span);

            var btnGroup = document.createElement('div');
            btnGroup.className = 'flex items-center gap-1';

            // Tombol Hapus
            var deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Hapus';
            deleteBtn.className = 'bg-maroon hover:bg-maroon/80 text-white text-xs px-2 py-1 rounded transition';
            
            (function(index) {
                deleteBtn.addEventListener('click', function() {
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                });
            })(i);

            btnGroup.appendChild(deleteBtn);
            taskItem.appendChild(leftDiv);
            taskItem.appendChild(btnGroup);
            taskListContainer.appendChild(taskItem);
        }
    }

    function addTask() {
        var textValue = taskInput.value.trim();
        if (textValue === '') return;

        // Cek duplikasi tugas (case-insensitive)
        var isDuplicate = false;
        for (var j = 0; j < tasks.length; j++) {
            if (tasks[j].text.toLowerCase() === textValue.toLowerCase()) {
                isDuplicate = true;
                break;
            }
        }

        if (isDuplicate) {
            alert('Tugas dengan nama tersebut sudah ada di daftar!');
            return;
        }

        tasks.push({ text: textValue, completed: false });
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    renderTasks();

    
    // 4. QUICK LINKS
    
    var linkNameInput = document.getElementById('link-name-input');
    var linkUrlInput = document.getElementById('link-url-input');
    var addLinkBtn = document.getElementById('add-link-btn');
    var quickLinksContainer = document.getElementById('quick-links-container');

    var quickLinks = JSON.parse(localStorage.getItem('dashboard_links')) || [
        { name: 'Google', url: 'https://www.google.com' },
        { name: 'Gmail', url: 'https://mail.google.com' },
        { name: 'Calendar', url: 'https://calendar.google.com' }
    ];

    function saveLinks() {
        localStorage.setItem('dashboard_links', JSON.stringify(quickLinks));
    }

    function renderLinks() {
        quickLinksContainer.innerHTML = '';
        
        if (quickLinks.length === 0) {
            quickLinksContainer.innerHTML = '<p class="text-beige/50 text-xs">Belum ada link.</p>';
            return;
        }

        for (var k = 0; k < quickLinks.length; k++) {
            var link = quickLinks[k];
            
            var linkContainer = document.createElement('div');
            linkContainer.className = 'flex items-center bg-charcoal border border-beige/20 text-beige rounded px-3 py-1.5 shadow text-sm gap-2';

            var a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'hover:underline font-medium';

            var removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.className = 'text-beige/60 hover:text-white font-bold px-1';
            
            (function(index) {
                removeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    quickLinks.splice(index, 1);
                    saveLinks();
                    renderLinks();
                });
            })(k);

            linkContainer.appendChild(a);
            linkContainer.appendChild(removeBtn);
            quickLinksContainer.appendChild(linkContainer);
        }
    }

    addLinkBtn.addEventListener('click', function() {
        var name = linkNameInput.value.trim();
        var url = linkUrlInput.value.trim();

        if (name === '' || url === '') {
            alert('Harap isi nama link dan URL.');
            return;
        }

        if (url.startsWith('http://') === false && url.startsWith('https://') === false) {
            url = 'https://' + url;
        }

        quickLinks.push({ name: name, url: url });
        saveLinks();
        renderLinks();

        linkNameInput.value = '';
        linkUrlInput.value = '';
    });

    renderLinks();
});