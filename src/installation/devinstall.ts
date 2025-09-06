import ConstellationKernel from "../kernel.js";
import { developmentOptions } from "./installation.config.js";

export default async function devinstall(
	ConstellationKernel: ConstellationKernel
) {
	const username = developmentOptions.user.username;
	await ConstellationKernel.security.users.newUser(
		username,
		developmentOptions.user.password,
		{
			profilePicture: developmentOptions.user.profilePicture,
			fullName: developmentOptions.user.displayName,
			allowGraphicalLogin: "true"
		}
	);
}
