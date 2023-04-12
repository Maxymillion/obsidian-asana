import {App, ButtonComponent, getIcon, Notice, PluginSettingTab, Setting} from "obsidian";
import Asana from "../../main";

export class SettingsTab extends PluginSettingTab {
	plugin: Asana;
	fakeConnection: boolean;

	constructor(app: App, plugin: Asana) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h1', {text: this.plugin.manifest.name});

		const credentials = this.plugin.settings.credentials;

		new Setting(containerEl)
			.setName('Enable plugin')
			.addToggle(tc => tc
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setHeading()
			.setName("General Settings")

		new Setting(containerEl)
			.setName('On Paste: Add title to Asana link')
			.addToggle(tC => tC
				.setValue(this.plugin.settings.enablePasteReplace)
				.onChange((value) => {
					this.plugin.settings.enablePasteReplace = value;
					this.plugin.saveSettings();
				})
			)

		const headingGroup = containerEl.createEl("div", {cls: "mxy-setting__heading-group"});

		new Setting(headingGroup)
			.setHeading()
			.setName("Asana Settings")

		if (credentials.name && credentials.email) {
			const activeTokenUserEl = headingGroup.createEl("div", {cls: "mxy-setting__active-user"});
			activeTokenUserEl.innerText = `${credentials.name} <${credentials.email}>`
		}

		let newToken = credentials.apiKey;

		new Setting(containerEl)
			.setName('Personal Access Token')
			.setDesc('The token used to prove to Asana you say who you say you are')
			.addTextArea(text => text
				.setValue(credentials.apiKey)
				.setPlaceholder('1/123456789...')
				.onChange((value) => {
					newToken = value;
				})
			)
			.addButton(cb => cb
				.setIcon(credentials.gid ? "sync" : "download-cloud")
				.setClass("mxy-setting__button--transparent")
				.setTooltip("Get/Update Connection")
				.onClick(async (e) => {
					// Minimum string length is 2
					const target = e.target;

					if (target instanceof Element) {
						if (target.querySelector("svg")) {
							cb.setIcon("sync");
							target.addClass("mxy-setting__button--loading");
						}
					}
					this.plugin.asanaManager.checkConnection(newToken, true).then((res) => {
						this.display();
					}).catch((err) => {
						this.display();
					});
				})
			);

		new Setting(containerEl)
			.setDisabled(true)
			.setClass(credentials.availableWorkspaces != null && credentials.gid != "" ? "mxy-setting" : "mxy-setting--invisible")
			.setName('Selected Workspace')
			.setDesc('Workspace from which the plugin requests it\'s data')
			.addDropdown(async (dC) => {
				if (credentials.availableWorkspaces != null) {
					credentials.availableWorkspaces.length > 0 && credentials.availableWorkspaces.map((work) => {
						dC.addOption(work.gid, work.name);
					});

					dC.onChange(async (value) => {
						const workspace = credentials.availableWorkspaces?.find((work => work.gid = value));
						this.plugin.settings.credentials.selectedWorkspace = workspace ? workspace : null;
						await this.plugin.saveSettings();
					});
				}

			});

		const dangerZone = containerEl.createEl('div', {cls: "mxy-dangerzone"});

		new Setting(dangerZone)
			.setHeading()
			.setName("Danger Zone")

		new Setting(dangerZone)
			.setName('Enable Debug')
			.addToggle(tC => tC
				.setValue(this.plugin.settings.debug)
				.onChange(async (value) => {
					this.plugin.settings.debug = value;
					const debugStatus: string = value ? "on" : "off";
					new Notice(`${this.plugin.manifest.name}: Turned ${debugStatus} debugging`);
					await this.plugin.saveSettings();
				})
			)

		new Setting(dangerZone)
			.setName('Reset Settings to Default')
			.addButton(bc => bc
				.setIcon("cross")
				.onClick(() => {

				})
			)

		new Setting(dangerZone)
			.setName('Reset Asana Credentials')
			.addButton(bc => bc
				.setIcon("cross")
				.onClick(async () => {
					await this.plugin.asanaManager.resetCredentials(true);
					this.display();
				})
			)

	}
}
