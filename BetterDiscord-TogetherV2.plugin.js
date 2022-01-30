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
    version: "2.0.0",
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
        );
      }

      start() {}

      stop() {}
    }
  : (([Plugin, API]) => {
      const {
        Patcher,
        DiscordModules: { React },
      } = API;
      const DATA_MINED_GAMES = {
        STABLE: {
          "Watch YouTube": "880218394199220334",
          "Poker Night": "755827207812677713",
	  "Fishington.io": "814288819477020702",
	  "Betrayal.io": "773336526917861400",
	  "Chess in the Park": "832012774040141894",
	  "Checkers in the Park": "832013003968348200",
	  "Doodle Crew": "878067389634314250",
          "Sketch Heads": "902271654783242291",
	  "Letter Tile": "879863686565621790",
	  "Word Snacks": "879863976006127627",
          "Sketchy Artist": "879864070101172255",
	  Awkword: "879863881349087252",
	  SpellCast: "852509694341283871",
	  Ocho: "832025144389533716"
        },
        DEV: {
          "Old Youtube": "755600276941176913",
          "Poker Night Staging": "763116274876022855",
          "Poker Night Dev": "763133495793942528",
          "Poker QA": "801133024841957428",
          "Chess in the Park 2 Staging": "832012730599735326",
          "Chess in the Park 2 Dev": "832012586023256104",
          "Chess in the Park 2 QA": "832012815819604009",
          "Chess in the Park 3 Staging": "832012938398400562",
          "Chess in the Park 3 Dev": "832012682520428625",
          "Chess in the Park 3 QA": "832012894068801636",
          "Cheers in the Park": "832013003968348200",
          "Watch YouTube Dev": "880218832743055411",
          "iframe-playground": "880559245471408169",
          "Doodle Crew Dev": "878067427668275241",
          "Letter Tile Dev": "879863753519292467",
          "Word Snacks Dev": "879864010126786570",
          "Fake Artist Dev": "879864104980979792",
          "Awkword Dev": "879863923543785532",
          "Decoders Dev": "891001866073296967",
          "SpellCast Staging": "893449443918086174"
        },
        NO_NAME: {
          "Discord Game 10": "832013108234289153",
          "Discord Game 11": "832025061657280566",
          "Discord Game 12": "832025114077298718",
          "Discord Game 13": "832025144389533716",
          "Discord Game 22": "832025857525678142",
          "Discord Game 23": "832025886030168105",
          "Discord Game 24": "832025928938946590",
          "Discord Game 25": "832025993019260929"
        }
      };
      const activitiesExperiment = API.WebpackModules.getModule((m => "2020-11_poker_night" === m.definition.id));
      const getEnabledAppIds = API.WebpackModules.getByProps("getEnabledAppIds");

      return class BetterDiscordTogetherV2 extends Plugin {
        constructor() {
          super();
        }

        async start() {
          // this.patchGuildRegion();
          this.checkEnabledAppIds();
          this.enableExperiment();
        }
        // patchGuildRegion() {
        //   API.Patcher.after(API.DiscordModules.GuildStore, "getGuild", ((_this, [props], ret) => {
        //     if (!ret?.region) return;
        //     ret.region = "us-west";
        //   }));
        // }
        checkEnabledAppIds() {
          API.Patcher.after(getEnabledAppIds, "getEnabledAppIds", ((_this, [props], ret) => {
            ret = [				
              ...Object.values(DATA_MINED_GAMES.STABLE),
              ...(false ? Object.values(DATA_MINED_GAMES.DEV) : []), // Change to "true" to enable them.
              ...(false ? Object.values(DATA_MINED_GAMES.NO_NAME) : [])]; // Change to "true" to enable them.
            return ret;
            
          }));
        }
        enableExperiment() {
          API.Patcher.after(getEnabledAppIds, "isActivitiesEnabled", ((_this, [props], ret) => {
            return true;
          }));
        }

        stop() {
          Patcher.unpatchAll();
        }
      };
    })(global.ZeresPluginLibrary.buildPlugin(config));
