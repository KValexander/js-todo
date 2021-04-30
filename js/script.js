let out;

let tasks = {
	active: [],
	completed: []
};

window.addEventListener("load", function() {
	app.app = document.querySelector("#app");

	let storage = localStorage.getItem("tasks");
	if(storage != null) {
		tasks = JSON.parse(storage);
	}

	app.out_tasks(tasks.active, "active");
});

let app = {
	count_field: 0,
	result: [],

	hide_app: function() {
		this.app.innerHTML = "";
		this.count_field = 0;
	},

	message: function(text, color) {
		let message = document.querySelector("#message");
		message.style.color = color;
		message.style.margin = "0 auto 30px auto";
		message.innerHTML = text;
	},

	now_time: function() {
		let now = new Date;
		let month = ["Января", "Февраля", "Марта", "Апреля", "Майя", "Июня", "Июля", "Августа", "Сентбря", "Октября", "Ноября", "Декабря"];
		let year = now.getFullYear();
		let day = now.getDate();
		month = month[now.getMonth()];
		now = day + " " + month + " " + year;
		return now;
	},

	out_form: function() {
		this.count_field = 0;
		out = `
			<div class="add_form">
				<h2>Добавление задачи</h2>
				<a onclick="app.hide_app()">Скрыть</a>
				<form>
					<input type="text" name="title" placeholder="Название задачи">
					<input type="datetime-local" name="datetime">
					<div class="fields"></div>
					<input type="button" value="Добавить подзадачу" onclick="app.add_field()">
					<input type="button" value="Добавить задачу" onclick="app.add_task()">
				</form>
			</div>
		`;
		this.app.innerHTML = out;
	},

	add_field: function() {
		out = '';
		if(this.count_field == 0)
			out = `<br><h3>Подзадачи<h3>`;
		out += `
			<div class="field" id="field_${this.count_field}">
				<input type="text" placeholder="Подзадача">
				<input type="button" value="Удалить подзадачу" onclick="app.delete_field()">
			</div>
		`;
		document.querySelector(".fields").insertAdjacentHTML("beforeend", out);
		this.count_field++;
	},

	delete_field: function(n) {
		document.querySelector("#field_"+n).outerHTML = "";
	},

	add_task:function() {
		let form = document.forms[0];
		let task, date, subtask;
		let subtasks = document.querySelectorAll(".fields input[type=text]");

		if(form.elements["title"].value == "") {
			return app.message("Введите название задачи", "red");
		}

		task = {
			title: form.elements["title"].value,
			date: "",
			time: "",
			state: "active",
			subtasks: []
		};

		if(form.elements["datetime"].value != "") {
			date = form.elements["datetime"].value.split("T");
			task.date = date[0];
			task.time = date[1];
		}

		for (let i = 0; i < subtasks.length; i++) {
			subtask = {
				title: subtasks[i].value,
				state: "active"
			};
			task.subtasks.push(subtask);
		}

		tasks.active.push(task);
		localStorage.setItem("tasks", JSON.stringify(tasks));

		app.hide_app();
		app.out_tasks(tasks.active, "active");

		return app.message("Задача добавлена", "green");
	},

	out_tasks: function(data, state) {
		let head, text_state, text_date;
		let background, textground, checkbox, color;
		let date, datetime, date_task, time, day;

		if (state == "active") head = `Активные задачи`;
		if (state == "completed") head = `Выполненные задачи`;
		if (state == "search") head = `Поиск`;

		out = `
			<div class="tasks">
				<h2 class="left">${head}</h2>
				<a onclick="app.hide_app()">Скрыть</a>
				<h2 class="right">${app.now_time()}</h2>
		`;

		if (data.length == 0) {
			out += "<br><br><h3>Задачи отсутствуют</h3>"
		}

		date = new Date;
		date = Date.parse(date);

		for (let i = 0; i < data.length; i++) {
			if(data[i].date != "" && data[i].time != "") {
				date_task = new Date(data[i].date + "," + data[i].time);
				date_task = Date.parse(date_task);

				time = date - date_task;

				day = time / (1000 * 3600 * 24);

				datetime = data[i].date.split("-");
				datetime = datetime[2] + "." + datetime[1] + "." + datetime[0];
				datetime = "| " + datetime + " " + data[i].time;
			} else {
				day = 0;
				datetime = "";
			}

			switch(state) {
				case("search"):
				case("active"):
					text_state = "Активное";
					checkbox = "";

					if(day == 0) {
						text_date = "Отсутствует";
						color = "gray";
					} else if (day > 0) {
						text_date = "Просрочено";
						color = "#dc3546";
					} else if (day > -1 && day < 0) {
						text_date = "Сегодня";
						color = "#fd7e15";
					} else if (day > -2 && day < -1) {
						text_date = "Завтра";
						color = "#fec107";
					} else if (day > -3 && day < -2) {
						text_date = "Послезавтра";
						color = "#21c998";
					} else if (day < -3) {
						text_date = "Через " + Math.abs(parseInt(day)) + " дней(я)";
						color = "#17a2b7";
					}
					break;
				case("completed"):
					text_state = "Выполненное";
					text_date = "Завершено";
					checkbox = "checked disabled";
					color = "#27a844";
					break;
			}

			background = `border: solid 1px ${color}; border-left: solid 10px ${color};`;
			textground = `background-color: ${color};`;

			out += `
				<div class="task" id="task_${i}" style="${background}">
					<h2>${data[i].title}</h2>
					<div class="checkbox">
						<input type="checkbox" onclick="app.completed_task(${i})" ${checkbox} >
					</div>
					<hr>`;
					if(state == "active" || state == "search") {
						out += `
							<nav class="task_menu">
								<a onclick="app.edit_task(${i})" id="edit_task">Редактировать</a> |
								<a onclick="app.delete_task(${i})">Удалить</a>
							</nav>`;
					}
			out += `<p>Время до выполнения задачи: <b class="textground" style="${textground}">${text_date} ${datetime}</b></p>
					<p>Состояние задачи: <b>${text_state}</b></p>
					<div class="subtasks">`;

					for (let j = 0; j < data[i].subtasks.length; j++) {
						if(data[i].subtasks[j].state == "active") checkbox = "";
						if(data[i].subtasks[j].state == "completed") checkbox = "checked disabled";
						out += `
							<div class="subtask" id="subtask_${j}">
								<h3>${data[i].subtasks[j].title}</h3>
								<div class="checkbox">
									<input type="checkbox" onclick="app.completed_subtask(${i}, ${j})" ${checkbox} >
								</div>`;
								if(data[i].subtasks[j].state == "active") {
									out += `
										<nav>
											<a id="edit_subtask" onclick="app.edit_subtask(${i}, ${j})">Редактировать</a>
											<a onclick="app.delete_subtask(${i}, ${j})">Удалить</a>
										</nav>`;
								}
						out += `</div> `;
					}

			out += `</div>`;
					if(state == "active" || state == "search") {
						out += `
							<div class="add_subtask">
								<a onclick="app.add_subtask(${i})">Добавить подзадачу</a>
							</div>`;
					}
			out += `</div> `;
		}

		out += `
			</div>`;

		this.app.innerHTML = out;
	},

	completed_task: function(i) {
		for (let j = 0; j < tasks.active[i].subtasks.length; j++) {
			if(tasks.active[i].subtasks[j].state == "active") {
				app.message("Выполните все подзадачи", "red");
				return app.out_tasks(tasks.active, "active");
			}
		}

		tasks.active[i].state = "completed";
		tasks.completed.push(tasks.active[i]);
		tasks.active.splice(i, 1);
		localStorage.setItem("tasks", JSON.stringify(tasks));
		app.out_tasks(tasks.completed, "completed");
	},

	edit_task: function(i) {
		let check = document.querySelector("#task_"+i+" h2 input");
		let edit = document.querySelector("#task_"+i+" #edit_task")
		if (check == null) {
			out = `<input type="text" placeholder="Задача" value="${tasks.active[i].title}" >`;
			edit.innerHTML = "Сохранить";
		} else {
			out = check.value;
			edit.innerHTML = "Редактировать";
			tasks.active[i].title = check.value;
			localStorage.setItem("tasks", JSON.stringify(tasks));
		}
		document.querySelector("#task_"+i+" h2").innerHTML = out;
	},

	delete_task: function(i) {
		let result = confirm("Вы действительно хотите удалить задачу?");
		if(result) {
			tasks.active.splice(i, 1);
			localStorage.setItem("tasks", JSON.stringify(tasks));
			app.out_tasks(tasks.active, "active");
		}
	},

	completed_subtask: function(i, j) {
		tasks.active[i].subtasks[j].state = "completed";
		localStorage.setItem("tasks", JSON.stringify(tasks));
		app.out_tasks(tasks.active, "active");
	},

	edit_subtask: function(i, j) {
		let check = document.querySelector("#task_"+i+" #subtask_"+j+" h3 input");
		let edit = document.querySelector("#task_"+i+" #subtask_"+j+" #edit_subtask")
		if (check == null) {
			out = `<input type="text" placeholder="Подзадача" value="${tasks.active[i].subtasks[j].title}" >`;
			edit.innerHTML = "Сохранить";
		} else {
			out = check.value;
			edit.innerHTML = "Редактировать";
			tasks.active[i].subtasks[j].title = check.value;
			localStorage.setItem("tasks", JSON.stringify(tasks));
		}
		document.querySelector("#task_"+i+" #subtask_"+j+" h3").innerHTML = out;
	},

	delete_subtask: function(i, j) {
		let result = confirm("Вы действительно хотите удалить подзадачу?");
		if(result) {
			tasks.active[i].subtasks.splice(j, 1);
			localStorage.setItem("tasks", JSON.stringify(tasks));
			app.out_tasks(tasks.active, "active");
		}

	},

	add_subtask: function(i) {
		let j = document.querySelectorAll("#task_"+i+" .subtask").length;
		let subtask = {
			title: "",
			state: "active",
		};
		tasks.active[i].subtasks.push(subtask);
		localStorage.setItem("tasks", JSON.stringify(tasks));
		out= `
			<div class="subtask" id="subtask_${j}">
				<h3>
					<input type="text" placeholder="Подзадача" />
				</h3>
				<div class="checkbox">
					<input type="checkbox" onclick="app.completed_subtask(${i}, ${j})" >
				</div>
				<nav>
					<a id="edit_subtask" onclick="app.edit_subtask(${i}, ${j})">Добавить</a>
					<a onclick="app.delete_subtask(${i}, ${j})">Удалить</a>
				</nav>
			</div> `;
		document.querySelector("#task_"+i+" .subtasks").insertAdjacentHTML("beforeend", out);
	},

	search: function() {
		// let symbols;
		let search = document.querySelector("input[type=search]").value;
		// let s = search.split("");

		if(search == "") {
			return app.out_tasks(tasks.active, "active");
		}

		top:
		for (let i = 0; i < tasks.active.length; i++) {

			let date = tasks.active[i].date.split("-");
			date = `${date[2]}.${date[1]}.${date[0]}`;

			if (tasks.active[i].title.includes(search)) {
				this.result.push(tasks.active[i]);
				continue top;
			}

			if(date.includes(search) || tasks.active[i].time.includes(search)) {
				this.result.push(tasks.active[i]);
				continue top;
			}

			for (let j = 0; j < tasks.active[i].subtasks.length; j++) {
				if(tasks.active[i].subtasks[j].title.includes(search)) {
					this.result.push(tasks.active[i]);
				}
			}
		}

		app.out_tasks(this.result, "search");

		this.result = [];
	}
};