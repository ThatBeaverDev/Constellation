import ConstellationKernel from "..//kernel.js";
import { PostInstallOptions } from "./installation.config.js";

export default async function postinstall(
	ConstellationKernel: ConstellationKernel,
	PostInstallOptions: PostInstallOptions
) {
	const username = PostInstallOptions.user.username;
	await ConstellationKernel.security.users.newUser(
		username,
		PostInstallOptions.user.password,
		{
			profilePicture: PostInstallOptions.user.profilePicture,
			fullName: PostInstallOptions.user.displayName,
			allowGraphicalLogin: "true"
		}
	);
}
