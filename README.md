# Cerebral

[![version](https://img.shields.io/github/release/prometheussatyen/cerebral.svg)](https://github.com/PrometheusSatyen/Cerebral/releases) 
[![appveyor build status](https://ci.appveyor.com/api/projects/status/github/prometheussatyen/cerebral?svg=true)](https://ci.appveyor.com/project/PrometheusSatyen/cerebral)
[![license: AGPL v3](https://img.shields.io/badge/license-AGPL%20v3-red.svg)](https://www.gnu.org/licenses/agpl-3.0)

Cerebral is a tool for monitoring your EVE Online characters. It is focused on ease of use and speed for people who manage larger numbers of characters.

If you enjoy using Cerebral, please consider an ISK donation to the in-game character "Prometheus Satyen". Donations mean I have to spend less time ratting and can spend more time developing!

Cerebral is currently in beta testing. That means there may be bugs in Cerebral. It won't delete your boot.ini but it might lose your tokens, crash, freeze up, etc.

Current Functionality:
-------------------------
* Add your characters using the EVE SSO v2.
* See an overview of all your characters including: Alpha/Omega Status, Corp/Alliance, ISK, SP, Current skill in training and time remaining
* SP Farming overview which allows you to add characters as an SP farm, specifying the base SP that character will keep (un-extractable), you can then see:
    * Number of injectors ready to extract
    * Time until next injector is ready to extract
    * Total time left in training queue
    * Current SP/hour
* Contracts page showing contracts across all your characters:
    * Shows contract type, status, title, issuer, assignee/acceptor, date issued and date completed.
    * For courier contracts, shows the origin, destination and volume.
    * Contracts are broken into two table, one for pending/in-progress/otherwise "active" contracts and another for completed contracts (which includes deleted, reversed, etc.)
* Individual character pages with several tabs showing different information:
    * Summary tab:
        * Basic character information: date of birth, security status, SP, wallet balance
        * Home location, current location, active ship
        * Unallocated SP, Attributes and remap information
        * Active implants
        * Skill queue
        * Jump clones
        * Jump fatigue
        * Loyalty points
    * Skills tab: trained skills by skill group, total SP in skills/skill groups, shows partially trained skills
    * Skill plans tab: basic skill planning functionality (honestly EVEMon's is a lot better, I'd stick with it for now if I were you until I can make some serious improvements)
    * Mail tab: quick access to your EVE mails
    * Contracts tab: pending/completed contracts involving the character
    * API tab: shows information on the authorized API token including scopes granted, data refresh intervals and token health

Planned Functionality:
-------------------------
* Automated updates
* Account manager for keeping track of your subscriptions/MPT expiry
* Configurable alerts (training stopped, character lapsed to alpha, ready for extraction, etc.)
* Skill Extraction Planner, experiment with extracting skills from your character to see how much ISK you would get.
* Various small things like deleting characters

Screenshots:
-------------------------
![character overview](https://prom.satyen.space/19-01-12_14-35-38_ojDQYDlu.png)

![sp-farming](https://prom.satyen.space/19-01-12_14-37-10_vrM40Mb7.png)

![contracts](https://prom.satyen.space/19-01-12_14-40-50_uhJ7fkbh.png)

![character-summary](https://prom.satyen.space/19-01-12_14-41-50_RteFe5WW.png)

![character-skills](https://prom.satyen.space/19-01-12_14-42-04_3csgCRkM.png)

![character-plans](https://prom.satyen.space/19-01-12_14-42-28_h33ExW8J.png)

![character-mails](https://prom.satyen.space/19-01-12_14-43-29_Z1j8ddWN.png)

![character-mail](https://prom.satyen.space/19-01-12_14-44-36_A6rthoGf.png)

![character-api](https://prom.satyen.space/19-01-12_14-44-55_r5D1s422.png)

Installation Instructions:
-------------------------
1. Download the latest release setup file from the Releases page.
2. Double click and wait for it to install. This may take 2-3 minutes. Be patient.  
    **Note:** Windows SmartScreen might block the install, just click More Info --> Run anyway.
3. Once installation is complete Cerebral will launch and you can start using it. A Start Menu/Desktop shortcut will be created automatically.

Update Instructions:
-------------------------
Simply follow the installation instructions and install the new version on top of the old version.

Automatic updates will be available soon.

Usage:
-------------------------
* Add your characters using the "Authorize Character" button.
* Data will refresh automatically.
* SP Farming:
    * Click the "Add Farm" button and choose a character, and then enter the amount of SP you would like to always keep on that character (for example it might be a JF pilot and all the skills you need take up 11,000,000 SP).
    * To update the Base SP for a farm, just add it again with the new base SP, Cerebral will update the base SP on the existing farm.
    * To delete a farm from the list, use the add function, but remove all text/numbers from the Base SP box then click add.

FAQ:
-------------------------
**Where are my tokens stored?**

Your tokens are stored in your user account folder in <YourUserFolder>/AppData/Roaming/Cerebral/authorized-characters.json. You can back this file up after adding your characters and restore it if needed. Do not allow this file to fall into malicious hands as the contents allow anyone to query your data from CCP.

The application only communicates with the CCP servers, no token data will ever leave your machine for any other destination.

**Why is there no Alpha/Omega icon next to my character?**

CCP does not allow us to see Alpha/Omega status directly in the API. Instead I perform a number of checks to try to guess whether a character is Alpha/Omega. If there's no icon displayed that means the application could not determine the character's status.

**My Anti-Virus/Windows/etc. thinks that this is a virus, what's going on?**

Most reputable software is signed using a special signature. To get one of those signatures, you have to pay a fee and your real name goes into the software.

I have no desire to embed my real name into an application I'm distributing to the EVE community, so it's unlikely I will ever be signing my code. As a result many AntiVirus programs will flag the application as a virus, you can safely add an exception if you trust me. :)

**Why does Cerebral use an embedded browser for authorization, isn't using the user's native browser more secure?**

In some ways yes using the native browser can be considered more secure as it provides additional peace of mind to users that their credentials are not being intercepted by the application.

In my opinion, this benefit is completely overshadowed by the huge improvement in user experience for adding large numbers of characters that the embedded flow provides. This combined with the fact that Cerebral is completely open source allowing you to easily verify that it is not intercepting your credentials led me to choose an embedded authorization flow.

If I have some spare time and feel like it, I may implement a setting allowing paranoid/conspiracy-subscribing users to utilize their own browser for the authorization.

**What languages/technologies does Cerebral use?**

Node.js using Electron to allow it to run as a native application. (Same as Discord, Slack, etc.)  
The UI is powered by React.js.