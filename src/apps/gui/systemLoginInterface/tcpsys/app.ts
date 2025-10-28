import { UserAlias } from "../../../../system/security/definitions.js";

export default class systemLoginInterface extends Application {
	users: Record<UserAlias["name"], UserAlias> = {};
	user: UserAlias["name"] = "guest";
	errorText: string = "";

	async init() {
		this.renderer.hideWindowHeader();
		this.renderer.hideWindowCorners();
		this.renderer.makeWindowInvisible();
		this.renderer.maximiseWindow();

		this.users = this.env.users.all();

		let lastUser: UserAlias = this.users.admin;
		for (const username in this.users) {
			const user = this.users[username];

			if (user.allowGraphicalLogin == false) {
				delete this.users[username];
				continue;
			}

			if (user.lastLogin > lastUser.lastLogin) {
				lastUser = user;
			}
		}

		this.user = lastUser.name;

		const params = new URL(window.location.href).searchParams;
		const isDevmode = params.get("dev") !== null;
		const autologin = params.get("autologin") !== null;
		if (isDevmode && autologin) {
			await this.attemptUserPassword("dev", "dev");
		}
	}

	timeInfo() {
		const date = new Date();

		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		const day = date.getDay();

		let weekdayName = "";
		switch (day) {
			case 0:
				weekdayName = "Sunday";
				break;
			case 1:
				weekdayName = "Monday";
				break;
			case 2:
				weekdayName = "Tuesday";
				break;
			case 3:
				weekdayName = "Wednesday";
				break;
			case 4:
				weekdayName = "Thursday";
				break;
			case 5:
				weekdayName = "Friday";
				break;
			case 6:
				weekdayName = "Saturday";
				break;
		}
		const dayOfMonth = String(date.getDate());
		let afterDate = "th";
		if (dayOfMonth.endsWith("1")) {
			afterDate = "st";
		} else if (dayOfMonth.endsWith("2")) {
			afterDate = "nd";
		} else if (dayOfMonth.endsWith("3")) {
			afterDate = "rd";
		}

		const month = date.getMonth();
		let monthName = "";
		switch (month) {
			case 0:
				monthName = "January";
				break;
			case 1:
				monthName = "February";
				break;
			case 2:
				monthName = "March";
				break;
			case 3:
				monthName = "April";
				break;
			case 4:
				monthName = "May";
				break;
			case 5:
				monthName = "June";
				break;
			case 6:
				monthName = "July";
				break;
			case 7:
				monthName = "August";
				break;
			case 8:
				monthName = "September";
				break;
			case 9:
				monthName = "October";
				break;
			case 10:
				monthName = "November";
				break;
			case 11:
				monthName = "December";
				break;
		}

		const year = date.getFullYear();

		return {
			hours,
			minutes,
			seconds,
			day,
			date,
			dayOfMonth,
			afterDate,
			year,
			monthName,
			weekdayName
		};
	}

	async attemptUserPassword(user: string, password: string) {
		const change = await this.env.users.switch(user, password);
		if (change.ok) {
			const result = { username: user, password: password };

			this.exit(result);
			return;
		} else {
			this.errorText = String(change.data);
		}
	}

	frame() {
		this.renderer.clear();

		const renderTime = () => {
			const timeFontSize = 45;

			const {
				hours,
				minutes,
				seconds,
				weekdayName,
				dayOfMonth,
				afterDate,
				monthName
			} = this.timeInfo();

			// time
			const time = `${hours}:${minutes}:${seconds}`;
			const timeWidth = this.renderer.getTextWidth(time, timeFontSize);
			const timeHeight = this.renderer.getTextHeight(time, timeFontSize);
			const timeLeft = (200 - timeWidth) / 2;

			this.renderer.text(timeLeft, 9, time, timeFontSize);

			// date
			const date = `${weekdayName}, ${dayOfMonth}${afterDate} of ${monthName}`;
			const dateWidth = this.renderer.getTextWidth(date);
			const dateLeft = (200 - dateWidth) / 2;

			this.renderer.text(dateLeft, 9 + timeHeight, date);
		};

		// render left frosted box
		this.renderer.box(0, 0, 200, this.renderer.windowHeight, {
			background: "rgb(from var(--bg-dark) r g b / 0.5)",
			isFrosted: true
		});

		renderTime();

		const drawLoginDialogue = () => {
			const dimensions = 300;
			const glassLeft = (this.renderer.windowWidth - dimensions) / 2;
			const glassTop = (this.renderer.windowHeight - dimensions) / 2;
			this.renderer.box(glassLeft, glassTop, dimensions, dimensions, {
				background: "rgb(from var(--bg-dark) r g b / 0.5)",
				isFrosted: true,
				borderRadius: 25
			});

			const textboxWidth = 200;
			const textboxHeight = 25;
			const textboxLeft = (this.renderer.windowWidth - textboxWidth) / 2;

			const userInfo = this.users[this.user];

			const nameFontsize = 15;
			const nameWidth = this.renderer.getTextWidth(userInfo.fullName);
			const nameLeft = (this.renderer.windowWidth - nameWidth) / 2;
			const nameHeight = nameFontsize * 1.2;

			const gap = 10;

			const iconScale = 5;
			const iconSize = 24 * iconScale;
			const iconLeft = (this.renderer.windowWidth - iconSize) / 2;
			const iconTop =
				(this.renderer.windowHeight -
					iconSize -
					(textboxHeight + gap)) /
				2;

			// render the middle
			this.renderer.icon(
				iconLeft,
				iconTop,
				userInfo.pictures.profile,
				iconScale
			);
			this.renderer.text(
				nameLeft,
				iconTop + iconSize + gap,
				userInfo.fullName
			);

			const textbox = this.renderer.textbox(
				textboxLeft,
				iconTop + iconSize + gap + nameHeight + gap,
				textboxWidth,
				25,
				"Enter your password...",
				{
					enter: async () => {
						const value = this.renderer.getTextboxContent(textbox);

						if (value == null) {
							return;
						}

						await this.attemptUserPassword(this.user, value);
					}
				}
			);

			const errorTextWidth = this.renderer.getTextWidth(this.errorText);
			const errorTextLeft =
				(this.renderer.windowWidth - errorTextWidth) / 2;
			this.renderer.text(
				errorTextLeft,
				iconTop + iconSize + gap + nameHeight + gap + textboxHeight,
				this.errorText,
				undefined,
				"red"
			);
		};

		drawLoginDialogue();

		// render other users on the side
		this.drawSideUsers();

		this.renderer.commit();
	}

	drawSideUsers() {
		const fontSize = 15;
		const gapBetweenUsers = 10;
		const yPerUser = fontSize * 1.2 + gapBetweenUsers;
		let y =
			this.renderer.windowHeight -
			yPerUser * (Object.keys(this.users).length - 1);

		const draw = (user: UserAlias) => {
			const iconScale = 0.75;
			const icon = this.renderer.icon(
				9,
				y,
				user.pictures.profile,
				iconScale
			);
			const text = this.renderer.text(
				9 + (24 + iconScale),
				y,
				user.fullName
			);

			const onClick = () => {
				this.user = user.name;
				this.errorText = "";
			};

			this.renderer.onClick(icon, onClick);
			this.renderer.onClick(text, onClick);

			y += fontSize * 1.2 + gapBetweenUsers;
		};

		for (const i in this.users) {
			if (i == this.user) continue;

			draw(this.users[i]);
		}
	}
}
