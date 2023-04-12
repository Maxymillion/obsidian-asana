import {
	Plugin
} from 'obsidian';
import {DEFAULT_SETTINGS, Settings} from "./utils/types";
import {SettingsTab} from "./components/Settings";
import {AsanaManager} from "./components/Asana";

export default class Asana extends Plugin {
	settings: Settings;
	asanaManager: AsanaManager;

	async onload() {
		console.log(`${this.manifest.name}: Loading`);

		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

		this.asanaManager = new AsanaManager(this);

		this.registerEvent(this.app.workspace.on("editor-paste", this.asanaManager.modifyPasteEvent.bind(this.asanaManager)));
	}
	async onunload() {
		console.log(`${this.manifest.name}: Unloading`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



