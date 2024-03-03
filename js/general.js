
function fix_storage() {
    if (localStorage.getItem("accounts") === null) {localStorage.setItem("accounts", `{}`)}
    if (sessionStorage.getItem("tasks") === null) {sessionStorage.setItem("tasks", `{}`)}
    if (sessionStorage.getItem("info") === null) {sessionStorage.setItem("info", `{"name": null,"lastname": null,"username": null,"email": null,"password": null,"category": []}`)}    
}

function Date_from_input(date_element, time_element) {
    let datestr = date_element.value;
    let timestr = time_element.value;
    let fullstr = `${datestr}T${timestr}`;
    return Date.parse(fullstr);
}

var session = {
    login: function(username, password) {
        if (this.is_username_used(username)) {
            if (JSON.parse(localStorage.getItem("accounts"))[username].password === password) {
                this.set_info(JSON.parse(localStorage.getItem("accounts"))[username]);
                this.set_logged_in(true);
                return 0
            } else {
                return 1
            }
        } else {
            return 2
        }
    }, 
    is_username_used: function(username) {
        return !(JSON.parse(localStorage.getItem("accounts"))[username] === undefined)
    },
    signin: function(name, lastname, username, email, password) {
        let accounts = JSON.parse(localStorage.getItem("accounts"));
        if (this.is_username_used(username)) {
            return 1
        } else {
            let new_user = {
                username: username,
                name: name,
                lastname: lastname,
                email: email,
                password: password,
                category: []
            };
            accounts[username] = new_user;
            localStorage.setItem("accounts", JSON.stringify(accounts));
            localStorage.setItem(`U_${username}`, "{}");
            this.set_info(new_user);
            this.set_logged_in(true);
            return 0
        }
    },
    logout: function() {
        this.set_logged_in(false);
        this.set_info({
            username: null,
            name: null,
            lastname: null,
            email: null,
            password: null,
            category: []
        });
        this.set_tasks({});
    },
    clear: function() {
        this.logout();
    },
    get_info: function() {
        return JSON.parse(sessionStorage.getItem("info"));
    },
    set_info: function(info) {
        sessionStorage.setItem("info", JSON.stringify(info));
    },
    get_logged_in: function() {
        return sessionStorage.getItem("logged_in") === "true";
    },
    set_logged_in: function(logged_in) {
        sessionStorage.setItem("logged_in", logged_in);
    },
    get_tasks: function() {
        return JSON.parse(sessionStorage.getItem("tasks"));
    },
    set_tasks: function(tasks) {
        sessionStorage.setItem("tasks", JSON.stringify(tasks));
    },
    save_tasks: function() {
        if (this.get_logged_in()) {
            localStorage.setItem(`U_${this.get_info().username}`, JSON.stringify(this.get_tasks()));
        }
    },
    load_tasks: function() {
        if (this.get_logged_in()) {
            let from_user = JSON.parse(localStorage.getItem(`U_${this.get_info().username}`));
            this.set_tasks({
                ...this.get_tasks(),
                ...from_user,
            });
        }
    },
}

function home_menu() {
    if (session.get_logged_in()) {
        document.querySelector("#homemenu2").removeAttribute("style")
    } else {
        document.querySelector("#homemenu1").removeAttribute("style")
    }
}

function add_zero_before(n) {
    let r = n.toString()
    if (r.length == 1) {
        r = "0" + r
    }
    return r
}

function time_before(date) {
    let diff = date - Date.now();
    let units = [" an", " moi", " semaine", " jour", " heure", " minute", " seconde"];
    let scales = [31536000000, 2592000000, 604800000, 86400000, 3600000, 60000, 1000];
    let absdiff = Math.abs(diff);
    let nb;
    let unit;
    let priority;
    if (absdiff > scales[0]) {
        unit = units[0];
        nb = Math.floor(absdiff / scales[0]);
        priority = 0;
    } else if (absdiff >= scales[1]) {
        unit = units[1];
        nb = Math.floor(absdiff / scales[1]);
        priority = 1;
    } else if (absdiff >= scales[2]) {
        unit = units[2];
        nb = Math.floor(absdiff / scales[2]);
        priority = 2;
    } else if (absdiff >= scales[3]) {
        unit = units[3];
        nb = Math.floor(absdiff / scales[3]);
        priority = 3;
    } else if (absdiff >= scales[4]) {
        unit = units[4];
        nb = Math.floor(absdiff / scales[4]);
        priority = 4;
    } else if (absdiff >= scales[5]) {
        unit = units[5];
        nb = Math.floor(absdiff / scales[5]);
        priority = 5;
    } else {
        unit = units[6];
        nb = Math.floor(absdiff / scales[6]);
        priority = 6;
    }
    if (nb > 1) {
        unit += "s";
    }
    let label;
    if (diff >= 0) {
        label = "dû dans ";
    } else {
        label = "en retard de ";
        priority = -1;
    }
    return [priority, label + "<strong>" + nb + "</strong>" + unit]
}

function scheduled(event) {
    let scheduledval = document.querySelector("input#scheduled").checked;
    let datedue = document.querySelector("input#datedue");
    let now = new Date(Date.now());
    if (datedue.value == "") {datedue.value = now.toLocaleDateString('en-CA')};
    let timedue = document.querySelector("input#timedue");
    if (timedue.value == "") {timedue.value = add_zero_before(now.getHours()) + ":" + add_zero_before(now.getMinutes())};

    if (scheduledval) {
        datedue.removeAttribute("disabled");
        timedue.removeAttribute("disabled");
    } else {
        datedue.setAttribute("disabled", "true");
        timedue.setAttribute("disabled", "true");
    }
}

function append_task() {
    let elname = document.querySelector("#newtask");
    elname.focus();
    if (elname.value != "") {
        scheduled();
        let elcategory = document.querySelector("#taskcategory");
        let elscheduled = document.querySelector("#scheduled");
        let eldate = document.querySelector("#datedue");
        let eltime = document.querySelector("#timedue");
        let name = elname.value;
        let id = Date.now();
        elname.value = "";
        elname.focus();
        let category = elcategory.value;
        let iscategory = category != "default";
        if (!iscategory) {
            category = null;
        }
        let isscheduled = elscheduled.checked;
        let date = null;
        if (isscheduled) {
            date = Date_from_input(eldate, eltime);
        }
        let task = {
            id: id,
            name: name,
            date: date,
            category: category,
            done: false
        };
        let tasks = session.get_tasks();
        tasks[id] = task;
        session.set_tasks(tasks);
        elscheduled.checked = false;
        scheduled();
    }
    refresh_tasklist();
}

function refresh_tasklist() {
    let tasks = session.get_tasks();
    let taskl = "";
    let donel = "";
    
    for (let key in tasks) {
        let task = tasks[key];
        let r = time_before(task.date);
        let priority = r[0];
        let timetext = r[1];
        if (task.done) {
            donel += `<div class="task" task-time="${task.date !== null}" task-category="${task.category !== null}" task-id="${task.id}">
                <span class="taskname">${task.name}</span>
                <span class="taskcategory">${task.category}</span>
                <span class="taskwarning">${timetext}</span>
                <button class="material-symbols-rounded taskbtn taskbtnundo" onclick="task_undo(this)">undo</button>
                <button class="material-symbols-rounded taskbtn taskbtninfo" onclick="show_info(this)">info</button>
                <button class="material-symbols-rounded taskbtn taskbtndelete" onclick="task_delete(this)">close</button>
                </div>`;
        } else {
            taskl += `<div class="task" task-time="${task.date !== null}" task-category="${task.category !== null}" task-id="${task.id}" task-priority="${priority}">
                <span class="taskname">${task.name}</span>
                <span class="taskcategory">${task.category}</span>
                <span class="taskwarning">${timetext}</span>
                <button class="material-symbols-rounded taskbtn taskbtndone" onclick="task_done(this)">done</button>
                <button class="material-symbols-rounded taskbtn taskbtninfo" onclick="show_info(this)">info</button>
                <button class="material-symbols-rounded taskbtn taskbtndelete" onclick="task_delete(this)">close</button>
                </div>`;
        }
    }
    let tasklist = document.querySelector("#tasklist");
    let donelist = document.querySelector("#donelist");
    if (tasklist) {
        tasklist.innerHTML = taskl;
    }
    if (donelist) {
        donelist.innerHTML = donel;
    }
    
}

function light_refresh_tasklist() {
    let tasklist = document.querySelector("#tasklist");
    if (tasklist) {
        let alltask = tasklist.querySelectorAll(".task");
        for (const taskelem of alltask) {
            let id = taskelem.getAttribute("task-id");
            let tasks = session.get_tasks();
            if (Object.keys(tasks).indexOf(id) !== -1) {
                let task = tasks[id];
                let r = time_before(task.date);
                let priority = r[0];
                let timetext = r[1];
                taskelem.querySelector(".taskwarning").innerHTML = timetext;
                taskelem.setAttribute("task-priority", priority);
            }
        }
    }
}

function task_done(self) {
    let parent = self.parentElement;
    let id = parent.getAttribute("task-id");
    let tasks = session.get_tasks();
    tasks[id].done = true;
    session.set_tasks(tasks);
    refresh_tasklist();
}

function task_undo(self) {
    let parent = self.parentElement;
    let id = parent.getAttribute("task-id");
    let tasks = session.get_tasks();
    tasks[id].done = false;
    session.set_tasks(tasks);
    refresh_tasklist();
}

function task_delete(self) {
    let parent = self.parentElement;
    let id = parent.getAttribute("task-id");
    let tasks = session.get_tasks();
    delete tasks[id];
    session.set_tasks(tasks);
    refresh_tasklist();
}

function show_info(self) {
    let parent = self.parentElement;
    let id = parent.getAttribute("task-id");
    let tasks = session.get_tasks();
    document.querySelector("#taskinfoname").innerHTML = tasks[id].name;
    document.querySelector("#taskinfo-creation").innerHTML = Date(tasks[id].id).split("(")[0];
    if (tasks[id].date === null) {document.querySelector("#taskinfo-schedule").innerHTML = "Aucune"}
    else {document.querySelector("#taskinfo-schedule").innerHTML = Date(tasks[id].date).split("(")[0]}
    document.querySelector("#taskinfo-status").innerHTML = tasks[id].done ? "Complété":"À faire";
    document.querySelector("#taskinfo-status").style.color = tasks[id].done ? "var(--accent1)":"var(--accent3)";
    document.querySelector("#taskinfo-category").innerHTML = tasks[id].category === null ? "Catégorie par défaut" : tasks[id].category;
    document.querySelector("#taskinfo-id").innerHTML = tasks[id].id;
    document.querySelector("#taskinfo").setAttribute("show", "true");
}

function close_info() {
    document.querySelector("#taskinfo").setAttribute("show", "false");
}

function login_submit(event) {
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;
    if (session.login(username, password)) {
        event.preventDefault();
        document.querySelector("#username").setAttribute("style", "border-color: var(--menu-magenta)");
        document.querySelector("#password").setAttribute("style", "border-color: var(--menu-magenta)");
        document.querySelector("#wrong").setAttribute("style", "opacity: 1");
        setTimeout(() => {
            document.querySelector("#username").removeAttribute("style");
            document.querySelector("#password").removeAttribute("style");
            document.querySelector("#wrong").setAttribute("style", "opacity: 0");
        }, 1000);
    }
}

function signin(event) {
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;
    let name = document.querySelector("#name").value;
    let lastname = document.querySelector("#lastname").value;
    let email = document.querySelector("#email").value;
    if (session.signin(name, lastname, username, email, password)) {
        event.preventDefault();
        document.querySelector("#username").setAttribute("style", "border-color: var(--menu-magenta)");
        document.querySelector("#wrong").setAttribute("style", "opacity: 1");
        setTimeout(() => {
            document.querySelector("#username").removeAttribute("style");
            document.querySelector("#wrong").setAttribute("style", "opacity: 0");
        }, 1000);
    }
}

fix_storage();
session.load_tasks();
