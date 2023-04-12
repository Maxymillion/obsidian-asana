export interface Settings {
	enabled: boolean,
	debug: boolean,
	credentials: AsanaCredentials,
}

export interface AsanaCredentials {
	apiKey: string,
	gid: string,
	name: string,
	email: string,
	availableWorkspaces: AsanaWorkspace[] | null;
	selectedWorkspace: AsanaWorkspace | null
}

export interface AsanaWorkspace {
	gid: string;
	name: string;
}

export const DEFAULT_SETTINGS: Settings = {
	enabled: false,
	debug: false,
	credentials: {
		name: "",
		email: "",
		apiKey: "",
		gid: "",
		availableWorkspaces: null,
		selectedWorkspace: null
	}
}
