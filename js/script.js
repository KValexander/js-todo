// Переменная вывода данных
let out;

// Переменная хранения задач
let tasks = {
	active: [], // активные задачи
	completed: [] // выполненые задачи
};

// При загрузке всех элементов DOM
window.addEventListener("load", function() {
	// Добавление в объект
	app.app = document.querySelector("#app");

	// Если в localStorage уже есть задачи
	let storage = localStorage.getItem("tasks");
	if(storage != null) {
		// Присвоить задачи переменной хранения задач
		tasks = JSON.parse(storage);
	}

	// Вызов функции вывода задач
	app.out_tasks(tasks.active, "active");
});

// Объект с основными функциями приложения
let app = {
	// Количество полей подзадач
	count_field: 0,
	// Массив вывода задач поиска
	result: [],

	// Функция сокрытия контента приложения
	hide_app: function() {
		this.app.innerHTML = "";
		this.count_field = 0;
	},

	// Функция вывода сообщения
	message: function(text, color) {
		// Получение дива для сообщений
		let message = document.querySelector("#message");
		// Стили для дива
		message.style.color = color;
		message.style.margin = "0 auto 30px auto";
		// Вывод сообщения
		message.innerHTML = text;
	},

	// Функция возвращения текущей даты
	now_time: function() {
		// Получение текущей даты
		let now = new Date;
		// Массив месяцев
		let month = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентбря", "Октября", "Ноября", "Декабря"];
		// Получение года
		let year = now.getFullYear();
		// Получение дня
		let day = now.getDate();
		// Получение текущего месяца
		month = month[now.getMonth()];
		// Конкатинация данных
		now = day + " " + month + " " + year;
		// Возвращение текущей даты
		return now;
	},

	// Функция вывода формы добавления задачи
	out_form: function() {
		// Очистка количества полей подзадач
		this.count_field = 0;
		// Запись формы добавления подзадач в переменную
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
		// Вывод формы на страницу
		this.app.innerHTML = out;
	},

	// Функция добавления подзадачи в форму добавления задачи
	add_field: function() {
		// Очистка переменной вывода
		out = '';
		// Если полей подзадач нет
		if(this.count_field == 0)
			// Добавляем заголовок "Подзадачи"
			out = `<br><h3>Подзадачи<h3>`;
		// Добавляем подзадачи в переменную
		out += `
			<div class="field" id="field_${this.count_field}">
				<input type="text" placeholder="Подзадача">
				<input type="button" value="Удалить подзадачу" onclick="app.delete_field()">
			</div>
		`;
		// Вывод подзадачи в конец дива с подзадачами в форме добавления задач
		document.querySelector(".fields").insertAdjacentHTML("beforeend", out);
		// Увеличение переменной количества полей подзадач
		this.count_field++;
	},

	// Функция удаления подзадачи в форме добавления задачи
	delete_field: function(n) {
		document.querySelector("#field_"+n).outerHTML = "";
	},

	// Функция добавления задачи
	add_task:function() {
		// Получение данных формы
		let form = document.forms[0];
		let task, date, subtask;
		// Получение данных полей подзадач
		let subtasks = document.querySelectorAll(".fields input[type=text]");

		// Если название задачи не написано
		if(form.elements["title"].value == "") {
			// Вывод сообщения об ошибке
			return app.message("Введите название задачи", "red");
		}

		// Объект задачи
		task = {
			title: form.elements["title"].value,
			date: "",
			time: "",
			state: "active",
			subtasks: []
		};

		// Если дата есть
		if(form.elements["datetime"].value != "") {
			// Разбиение даты на дату и время
			date = form.elements["datetime"].value.split("T");
			// Запись даты и времени в свойства объекта
			task.date = date[0];
			task.time = date[1];
		}

		// Цикл добавление подзадач в задачу
		for (let i = 0; i < subtasks.length; i++) {
			subtask = {
				title: subtasks[i].value,
				state: "active"
			};
			task.subtasks.push(subtask);
		}

		// Добавление задачи в массив активных задач
		tasks.active.push(task);
		// Сохранение данных в localStorage
		localStorage.setItem("tasks", JSON.stringify(tasks));

		// Скрыть текущую форму добавления задачи
		app.hide_app();
		// Вывести активные задачи
		app.out_tasks(tasks.active, "active");

		// Вернуть сообщение об успешном добавлении задачи
		return app.message("Задача добавлена", "green");
	},

	// Функция вывода задачи
	out_tasks: function(data, state) {
		// Переменные текста
		let head, text_state, text_date;
		// Переменные стилей и атрибутов
		let background, textground, checkbox, color;
		// Переменные логики
		let date, datetime, date_task, time, day;

		// Проверка на тип выводимых задач
		if (state == "active") head = `Активные задачи`;
		if (state == "completed") head = `Выполненные задачи`;
		if (state == "search") head = `Поиск`;

		// Запись html в переменную
		out = `
			<div class="tasks">
				<h2 class="left">${head}</h2>
				<a onclick="app.hide_app()">Скрыть</a>
				<h2 class="right">${app.now_time()}</h2>
		`;

		// Если задачи отсутствуют
		if (data.length == 0) {
			out += "<br><br><h3>Задачи отсутствуют</h3>"
		}

		// Получение текущей даты
		date = new Date;
		// Перевод даты в миллисекунды
		date = Date.parse(date);

		// Цикл вывода задач
		for (let i = 0; i < data.length; i++) {
			// Если дата и время завершения у задачи есть
			if(data[i].date != "" && data[i].time != "") {
				// Получение даты завершения задачи
				date_task = new Date(data[i].date + "," + data[i].time);
				// Перевод даты в миллисекунды
				date_task = Date.parse(date_task);

				// Получение разницы между текущей датой и датой завершения задачи
				time = date - date_task;

				// Перевод миллисекунд в дни
				day = time / (1000 * 3600 * 24);

				// Перевод даты в нужный формат
				datetime = data[i].date.split("-");
				datetime = datetime[2] + "." + datetime[1] + "." + datetime[0];
				// Конкатинация даты и времени
				datetime = "| " + datetime + " " + data[i].time;
			// Если даты и времени завершения у задачи нет
			} else {
				day = 0;
				datetime = "";
			}

			// Кейсы
			switch(state) {
				// При активном и поисковом выводе задач
				case("search"):
				case("active"):
					// Состояние задачи
					text_state = "Активное";
					// Состояние чекбокса выполнения задачи
					checkbox = "";

					// Если даты и времени нет
					if(day == 0) {
						text_date = "Отсутствует";
						color = "gray";
					// Если время выполнения задачи просрочено
					} else if (day > 0) {
						// Состояние даты завершения
						text_date = "Просрочено";
						// Цвет задачи
						color = "#dc3546";
					// Если время выполнения задачи сегодня
					} else if (day > -1 && day < 0) {
						// Состояние даты завершения
						text_date = "Сегодня";
						// Цвет задачи
						color = "#fd7e15";
					// Если время выполнения задачи завтра
					} else if (day > -2 && day < -1) {
						// Состояние даты завершения
						text_date = "Завтра";
						// Цвет задачи
						color = "#fec107";
					// Если время выполнения задачи послезавтра
					} else if (day > -3 && day < -2) {
						// Состояние даты завершения
						text_date = "Послезавтра";
						// Цвет задачи
						color = "#21c998";
					// Если время выполнения задачи через дни
					} else if (day < -3) {
						// Состояние даты завершения
						text_date = "Через " + Math.abs(parseInt(day)) + " дней(я)";
						// Цвет задачи
						color = "#17a2b7";
					}
					break;
				// При выполненных задачах
				case("completed"):
					// Состояние задачи
					text_state = "Выполненное";
					// Состояние даты завершения
					text_date = "Завершено";
					// Состояние чекбокса выполнения задачи
					checkbox = "checked disabled";
					// Цвет задачи
					color = "#27a844";
					break;
			}

			// Запись цвета в стили задачи
			background = `border: solid 1px ${color}; border-left: solid 10px ${color};`;
			textground = `background-color: ${color};`;

			// Запись данных задачи в переменную
			out += `
				<div class="task" id="task_${i}" style="${background}">
					<h2>${data[i].title}</h2>
					<div class="checkbox">
						<input type="checkbox" onclick="app.completed_task(${i})" ${checkbox} >
					</div>
					<hr>`;
					// Если состояние вывода активное или поисковое
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

					// Цикл вывода подзадач
					for (let j = 0; j < data[i].subtasks.length; j++) {
						// Если состояние подзадачи активное
						if(data[i].subtasks[j].state == "active") checkbox = "";
						// Если состояние подзадачи выполненное
						if(data[i].subtasks[j].state == "completed") checkbox = "checked disabled";
						// Запись данных подзадачи в переменную
						out += `
							<div class="subtask" id="subtask_${j}">
								<h3>${data[i].subtasks[j].title}</h3>
								<div class="checkbox">
									<input type="checkbox" onclick="app.completed_subtask(${i}, ${j})" ${checkbox} >
								</div>`;
								// Если состояние подзадачи активное
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
					// Если состояние вывода активное или поисковое
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

		// Вывод данных в переменной на страницу
		this.app.innerHTML = out;
	},

	// Функция выполнения задачи
	completed_task: function(i) {
		// Цикл проверки выполненности подзадач задачи
		for (let j = 0; j < tasks.active[i].subtasks.length; j++) {
			// Если обнаружены невыполненное подзадачи
			if(tasks.active[i].subtasks[j].state == "active") {
				// Вывод сообщения об ошибке
				app.message("Выполните все подзадачи", "red");
				// Вывод активных задач
				return app.out_tasks(tasks.active, "active");
			}
		}

		// Изменение статуса задачи
		tasks.active[i].state = "completed";
		// Добавление задачи в массив выполненных задач
		tasks.completed.push(tasks.active[i]);
		// Удаление задачи из массива активных подзадач
		tasks.active.splice(i, 1);
		// Сохранение данных в localStorage
		localStorage.setItem("tasks", JSON.stringify(tasks));
		// Вывод завершённых подзадач
		app.out_tasks(tasks.completed, "completed");
	},

	// Функция редактирования задачи
	edit_task: function(i) {
		// Переменная проверки наличия инпута в названии задачи
		let check = document.querySelector("#task_"+i+" h2 input");
		// Перемнная данных ссылки редактирования
		let edit = document.querySelector("#task_"+i+" #edit_task");
		// Если инпута нет
		if (check == null) {
			// Запись поля input в переменную
			out = `<input type="text" placeholder="Задача" value="${tasks.active[i].title}" >`;
			// Изменения ссылки "редактировать" на "сохранить"
			edit.innerHTML = "Сохранить";
		} else {
			// Запись в переменную значения инпута
			out = check.value;
			// Изменения ссылки "сохранить" на "редактировать"
			edit.innerHTML = "Редактировать";
			// Запись изменённых данных в название задачи
			tasks.active[i].title = check.value;
			// Сохранение данных в localStorage
			localStorage.setItem("tasks", JSON.stringify(tasks));
		}
		// Вывод данных переменной в название задачи
		document.querySelector("#task_"+i+" h2").innerHTML = out;
	},

	// Функция удаления задачи
	delete_task: function(i) {
		// Проверка на действительность желания удаления задачи
		let result = confirm("Вы действительно хотите удалить задачу?");
		// Если удалить
		if(result) {
			// Удаление задачи из массива активных задач
			tasks.active.splice(i, 1);
			// Сохранение данных в localStorage
			localStorage.setItem("tasks", JSON.stringify(tasks));
			// Вывод активных задач
			app.out_tasks(tasks.active, "active");
		}
	},

	// Функция выполнения подзадачи
	completed_subtask: function(i, j) {
		// Перезапись состояния подзадачи на выполненное
		tasks.active[i].subtasks[j].state = "completed";
		// Сохранение данных в localStorage
		localStorage.setItem("tasks", JSON.stringify(tasks));
		// Вывод активных задачи
		app.out_tasks(tasks.active, "active");
	},

	// Функция редактирования подзадачи
	edit_subtask: function(i, j) {
		// Переменная проверки наличия инпута в названии подзадачи
		let check = document.querySelector("#task_"+i+" #subtask_"+j+" h3 input");
		// Перемнная данных ссылки редактирования
		let edit = document.querySelector("#task_"+i+" #subtask_"+j+" #edit_subtask")
		// Если инпута нет
		if (check == null) {
			// Запись поля input в переменную
			out = `<input type="text" placeholder="Подзадача" value="${tasks.active[i].subtasks[j].title}" >`;
			// Изменения ссылки "редактировать" на "сохранить"
			edit.innerHTML = "Сохранить";
		// Если инпут есть
		} else {
			// Запись в переменную значения инпута
			out = check.value;
			// Изменения ссылки "сохранить" на "редактировать"
			edit.innerHTML = "Редактировать";
			// Запись изменённых данных в название подзачи
			tasks.active[i].subtasks[j].title = check.value;
			// Сохранение данных в localStorage
			localStorage.setItem("tasks", JSON.stringify(tasks));
		}
		// Вывод данных переменной в название подзадачи
		document.querySelector("#task_"+i+" #subtask_"+j+" h3").innerHTML = out;
	},

	// Функция удаления подзадачи
	delete_subtask: function(i, j) {
		// Проверка на действительность желания удаления подзадачи
		let result = confirm("Вы действительно хотите удалить подзадачу?");
		// Если удалить
		if(result) {
			// Удаление подзадачи из задачи
			tasks.active[i].subtasks.splice(j, 1);
			// Сохранение данных в localStorage
			localStorage.setItem("tasks", JSON.stringify(tasks));
			// Вывод активных задач
			app.out_tasks(tasks.active, "active");
		}

	},

	// Функция добавления подзадачи в задачу
	add_subtask: function(i) {
		// Переменная количества подзадач задачи
		let j = document.querySelectorAll("#task_"+i+" .subtask").length;
		// Объект подзадачи
		let subtask = {
			title: "",
			state: "active",
		};
		// Запись объекта подзадачи в задачу
		tasks.active[i].subtasks.push(subtask);
		// Сохранение данных в localStorage
		localStorage.setItem("tasks", JSON.stringify(tasks));
		// Запись данных в переменную
		out = `
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
		// Вывод данных подзадачи в конец задачи
		document.querySelector("#task_"+i+" .subtasks").insertAdjacentHTML("beforeend", out);
	},

	// Функция поиска задач
	search: function() {
		// Получение данных поля поиска
		let search = document.querySelector("input[type=search]").value;

		// Если строка пуста
		if(search == "") {
			// Вызов активных задач
			return app.out_tasks(tasks.active, "active");
		}

		// Метка
		top:
		// Цикл работы с задачами для поиска
		for (let i = 0; i < tasks.active.length; i++) {

			// Работа с датой, привод в подходящую форму
			let date = tasks.active[i].date.split("-");
			date = `${date[2]}.${date[1]}.${date[0]}`;

			// Если название задачи включает часть данных поля поиска
			if (tasks.active[i].title.includes(search)) {
				this.result.push(tasks.active[i]);
				continue top;
			}

			// Если дата
			if(date.includes(search) || tasks.active[i].time.includes(search)) {
				this.result.push(tasks.active[i]);
				continue top;
			}

			// Цикл работы с подзадачами для поиска
			for (let j = 0; j < tasks.active[i].subtasks.length; j++) {
				// Если название подзадачи включает часть данных поля поиска
				if(tasks.active[i].subtasks[j].title.includes(search)) {
					this.result.push(tasks.active[i]);
				}
			}
		}

		// Передача результатов поиска функции вывода задач
		app.out_tasks(this.result, "search");

		// Очистка массива поиска
		this.result = [];
	}
};