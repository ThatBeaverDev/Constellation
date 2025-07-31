import { newUser, setUserKey, users } from "../security/users.js";
import { developmentOptions } from "./installation.config.js";

export default async function devinstall() {
	const username = developmentOptions.user.username;
	await newUser(username, developmentOptions.user.password, {
		profilePicture: developmentOptions.user.profilePicture,
		fullName: developmentOptions.user.displayName,
		allowGraphicalLogin: "true"
	});
}
