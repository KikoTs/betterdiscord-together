/**
* @name BetterDiscord-TogetherV2
* @version 2.0.0
* @description A Plugin to Play the new Discord Together Games. The more stable Version!
* @author KikoTs
* @source https://raw.githubusercontent.com/KikoTs/betterdiscord-together/main/BetterDiscord-TogetherV2.plugin.js
*/

/*@cc_on
@if (@_jscript)

// Offer to self-install for clueless users that try to run this directly.
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
var pathSelf = WScript.ScriptFullName;
// Put the user at ease by addressing them in the first person
shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
// Show the user where to put plugins in the future
shell.Exec("explorer " + pathPlugins);
shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();

@else@*/

const { findModuleByProps, findAllModules } = BdApi;


const config = {
	info: {
		name: "BetterDiscord-TogetherV2",
		authors: [
			{
				name: "kikots",
				discord_id: "487773012481933314",
			},
		],
		version: "2.0.1",
		description: "A Plugin to Play the new Discord Together Games. The more stable Version!",
	},
};

module.exports = !global.ZeresPluginLibrary
	? class {
		getName() {
		return config.info.name;
	}

	getAuthor() {
		return config.info.authors[0].name;
		}

	getVersion() {
		return config.info.version;
	}

	getDescription() {
		return config.info.description;
	}

	load() {
		BdApi.showConfirmationModal(
			"Library Missing",
			`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
			{
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get(
						"https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
						async (error, response, body) => {
							if (error)
							return require("electron").shell.openExternal(
								"https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
							);
							await new Promise((r) =>
								require("fs").writeFile(
									require("path").join(
										BdApi.Plugins.folder,
										"0PluginLibrary.plugin.js"
									),
									body,
									r
								)
							);
						}
					);
				},
			}
	);}

	start() {}

	stop() {}
}

: (([Plugin, API]) => {
	const {
		Patcher,
		DiscordModules: { React },
	} = API;
	const GAMES = {
		TIER0: [
			"880218394199220334",
			"902271654783242291",
			"976052223358406656",
			"950505761862189096",
			"879863976006127627"
		],
		TIER1: [
			"945737671223947305",
			"903769130790969345",
			"832025144389533716",
			"832013003968348200",
			"852509694341283871",
			"879863686565621790",
			"832012774040141894",
			"755827207812677713",
			"947957217959759964"
		]
	}
	
	const getBundleItems = API.WebpackModules.getByProps("getBundleItems");

	return class BetterDiscordTogetherV2 extends Plugin {
			constructor() {
				super();
			}

		async start() {
			this.checkEnabledAppIds();
		}

		checkEnabledAppIds() {
			API.Patcher.after(getBundleItems, "getBundleItems", ((_this, [props], ret) => {
				return [
					...Object.values(GAMES.TIER0).map((id) => ({
						application_id: id,
						expires_on: null,
						new_until: null,
						nitro_requirement: false,
						premium_tier_level: 0
					})),

					...Object.values(GAMES.TIER1).map((id) => ({
						application_id: id,
						expires_on: null,
						new_until: null,
						nitro_requirement: false,
						premium_tier_level: 1
					}))
				]
			}));
		}

		stop() {
			Patcher.unpatchAll();
		}
	};
})(global.ZeresPluginLibrary.buildPlugin(config));
