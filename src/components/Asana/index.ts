import Asana from "../../main";
import {AsanaCredentials, AsanaWorkspace, DEFAULT_SETTINGS} from "../../utils/types";
import {Editor, MarkdownFileInfo, MarkdownView, Notice} from "obsidian";

export class AsanaManager {
	plugin: Asana;

	constructor(plugin: Asana) {
		this.plugin = plugin;
		console.log(`${this.plugin.manifest.name}: Loading AsanaManager`);
		this.init();
	}


	init(): void {
		if (this.plugin.settings.credentials.apiKey) {
			this.checkConnection().catch((err) => {
				console.log(err);
			})
		}
	}

	async getTaskFromAsana(taskID: string) {
		const response = await fetch(`https://app.asana.com/api/1.0/tasks/${taskID}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.plugin.settings.credentials.apiKey,
			},
		});
		return response.json();
	}

	//(evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo)
	public modifyPasteEvent(clipboardEvent: ClipboardEvent, editor: Editor) {
		// abort if setting is disabled / user is not authenticated
		if (!this.plugin.settings.enablePasteReplace || !this.plugin.settings.enabled || !this.plugin.settings.credentials.gid) return;

		// abort when pane isn't markdown editor
		if (!editor) return;

		// abort if clipboard data is empty
		if (!clipboardEvent.clipboardData) return;

		const plainClipboard = clipboardEvent.clipboardData.getData("text/plain");

		if (!plainClipboard) return;

		const asanaRegex = /(https:\/\/app\.asana\.com)\/(\d+)\/(\d+)\/(\d+)/;

		// abort if regex test fails
		if (!asanaRegex.test(plainClipboard)) return;

		const matches = asanaRegex.exec(plainClipboard);

		// abort if regex has no matches
		if (!matches) return;

		const projectID = matches[3];
		const taskID = matches[4];

		if (!projectID || !taskID) return;

		this.getTaskFromAsana(taskID).then((res) => {
			if (!res.data.name) return;
			let lineEdit = editor.getLine(editor.getCursor().line);
			lineEdit = lineEdit.replace(`${plainClipboard}`, `[${res.data.name}](${plainClipboard}) `);
			editor.setLine(editor.getCursor().line, lineEdit);
		});
	}

	private async testConnection(token: string = this.plugin.settings.credentials.apiKey) {
		const response = await fetch('https://app.asana.com/api/1.0/users/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
		});
		return response.json();
	}

	async resetCredentials(verbose: boolean = false) {
		this.plugin.settings.credentials = DEFAULT_SETTINGS.credentials;
		await this.plugin.saveSettings();
		if (verbose) {
			new Notice(`${this.plugin.manifest.name}: 💣 Destroyed credentials!`);
		}
	}

	private async setObsidianSettings(data: any, verbose: boolean) {
		let credentials = this.plugin.settings.credentials;

		credentials.gid = data.gid;
		credentials.email = data.email;
		credentials.name = data.name;

		// Set workspaces if defined
		if (data.workspaces.length > 0) {
			let workspaces: AsanaWorkspace[] = [];
			for (let workspace of data.workspaces) {
				let asanaWorkspace: AsanaWorkspace = {name: workspace.name, gid: workspace.gid};
				workspaces.push(asanaWorkspace);
			}

			credentials.availableWorkspaces = workspaces;

			// Set selected workspace if there is only one result
			if (workspaces.length > 0) {
				if (verbose) {
					new Notice(`${this.plugin.manifest.name}: Workspace set [${workspaces[0].name}]`);
				}
				credentials.selectedWorkspace = workspaces[0];
			}
		}

		this.plugin.settings.credentials = credentials;

		await this.plugin.saveSettings();
	}

	checkConnection(token: string = this.plugin.settings.credentials.apiKey, verbose: boolean = false): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			if (token.length != 68) {
				if (verbose) {
					new Notice(`${this.plugin.manifest.name}: Invalid Token!`);
				}

				await this.resetCredentials();
				return reject(false);
			}

			if (verbose) {
				new Notice(`${this.plugin.manifest.name}: Testing connection...`);
			}

			this.testConnection(token).then(async (res) => {
				if (res.data) {
					if (verbose) {
						new Notice(`${this.plugin.manifest.name}: Connection successful`);
					}

					if (token != this.plugin.settings.credentials.apiKey) {
						this.plugin.settings.credentials.apiKey = token;
						await this.plugin.saveSettings();
					}

					await this.setObsidianSettings(res.data, verbose);
					return resolve(true);
				} else if (res.errors) {
					if (res.errors[0] && !res.errors[0].message.contains("Service Unavailable")) {
						await this.resetCredentials();
					}
					if (res.errors[0]) {
						new Notice(`${this.plugin.manifest.name}: Error [${res.errors[0].message}]`);
					}
					return reject(res.errors);
				}
			}).catch(async (err) => {
				return reject(err);
			})
		})
	}
}
