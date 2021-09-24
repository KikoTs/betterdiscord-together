/**
 * @name BetterDiscord-TogetherV2
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
    version: "1.0.0",
    description: "A Plugin to Play the new Discord Together Games.",
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
      const {
        YOUTUBE_APPLICATION_ID,
        POKER_NIGHT_APPLICATION_ID,
        FISHINGTON_APPLICATION_ID,
        END_GAME_APPLICATION_ID,
        CHESS_IN_THE_PARK_APPLICATION_ID,
        DISCORD_GAME_01_ID,
        DISCORD_GAME_02_ID,
        DISCORD_GAME_03_ID,
        DISCORD_GAME_04_ID,
        WATCH_YOUTUBE_DEV_APP_ID,
        WATCH_YOUTUBE_PROD_APP_ID,
        XBOX_ACTIVITY_APPLICATION_ID
      } = API.WebpackModules.getByProps("YOUTUBE_APPLICATION_ID");
      const ExperimentUtils = API.WebpackModules.getByProps("overrideBucket");
      const activitiesExperiment = API.WebpackModules.getModule((m => "2020-11_poker_night" === m.definition.id));
      const getEnabledAppIds = API.WebpackModules.getByProps("getEnabledAppIds");

      return class BetterDiscordTogetherV2 extends Plugin {
        constructor() {
          super();
        }

        async start() {
          this.patchGuildRegion();
          this.checkEnabledAppIds();
          this.enableExperiment();
        }
        patchGuildRegion() {
          API.Patcher.after(API.DiscordModules.GuildStore, "getGuild", ((_this, [props], ret) => {
            if (!ret?.region) return;
            ret.region = "us-west";
          }));
        }
        checkEnabledAppIds() {
          API.Patcher.after(getEnabledAppIds, "getEnabledAppIds", ((_this, [props], ret) => {
            ret = [
              YOUTUBE_APPLICATION_ID,
              POKER_NIGHT_APPLICATION_ID,
              FISHINGTON_APPLICATION_ID,
              END_GAME_APPLICATION_ID,
              CHESS_IN_THE_PARK_APPLICATION_ID,
              WATCH_YOUTUBE_PROD_APP_ID
            ];
            return ret;
            
          }));
        }
        enableExperiment() {
          console.log('IWasStarted')
          API.Patcher.after(activitiesExperiment, "useExperiment", ((_this, [props], ret) => {
            if (![props][0].guildId) return ret;
            if (!ret[0]?.enabledApplicationIds?.length) {
              ret[0] = {  
                enabledApplicationIds: [
                  YOUTUBE_APPLICATION_ID,
                  POKER_NIGHT_APPLICATION_ID,
                  FISHINGTON_APPLICATION_ID,
                  END_GAME_APPLICATION_ID,
                  CHESS_IN_THE_PARK_APPLICATION_ID
                ],
                rtcPanelIconsOnly: true,
                showDiscordGameTooltips: false,
                enableActivities: true,
                useNewInviteButton: true
              };
            }
            return ret;
          }));
        }

        stop() {
          Patcher.unpatchAll();
        }
      };
    })(global.ZeresPluginLibrary.buildPlugin(config));
