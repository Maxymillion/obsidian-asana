export interface Settings {
	enabled: boolean,
	debug: boolean,
	credentials: AsanaCredentials,
	enablePasteReplace: boolean
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
	enablePasteReplace: true,
	credentials: {
		name: "",
		email: "",
		apiKey: "",
		gid: "",
		availableWorkspaces: null,
		selectedWorkspace: null
	}
}
