import {
	Plugin
} from 'obsidian';
import {DEFAULT_SETTINGS, Settings} from "./utils/types";
import {SettingsTab} from "./components/Settings";

export default class Asana extends Plugin {
	settings: Settings;

	async onload() {
		console.log(`${this.manifest.name}: Loading`);

		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));
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



