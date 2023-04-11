import {App, ButtonComponent, getIcon, PluginSettingTab, Setting} from "obsidian";
import Asana from "../../main";

export class SettingsTab extends PluginSettingTab {
	plugin: Asana;

	constructor(app: App, plugin: Asana) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h1', {text: this.plugin.manifest.name});
	}
}
