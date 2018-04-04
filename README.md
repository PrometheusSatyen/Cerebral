# Cerebral

[![version](https://img.shields.io/github/release/prometheussatyen/cerebral.svg)](https://github.com/PrometheusSatyen/Cerebral/releases) 
[![appveyor build status](https://ci.appveyor.com/api/projects/status/github/prometheussatyen/cerebral?svg=true)](https://ci.appveyor.com/project/PrometheusSatyen/cerebral)

In May 2018, the EVE XML/CREST APIs will shutdown and take EVEMon and many other legacy tools with them to the grave.

Not being able to live without EVEMon, I decided to try and replicate it as best I could utilizing the new EVE ESI API.  
If you enjoy using Cerebral, please consider an ISK donation to the in-game character "Prometheus Satyen". Donations mean I have to spend less time ratting and can spend more time developing!

Cerebral is currently in alpha testing! That means:
-------------------------
* There may be bugs in Cerebral. It won't delete your boot.ini but it might lose your tokens, crash, freeze up, etc.
* I am only distributing a Windows-x64 version during alpha testing. macOS and Linux versions will be available once I move to beta phase.

Current Functionality:
-------------------------
* Add your characters using the EVE SSO.
* See an overview of all your characters including:
    * Alpha/Omega Status
    * Corp/Alliance
    * ISK
    * SP - This is the actual amount of SP your character has, which you would normally have to login and pause/unpause your queue to see.
    * Current skill in training and time remaining
* SP Farming overview which allows you to add characters as an SP farm, specifying the base SP that character will keep (unextractable), you can then see:
    * Number of injectors ready to extract
    * Time until next injector is ready to extract
    * Total time left in training queue
    * Current SP/hour
* Individual character pages showing:
    * Basic character information: date of birth, security status, SP, wallet balance
    * Home location, current location, active ship
    * Attributes and remap information
    * Active implants
    * Skill queue
    * Jump clones
    * Scopes granted

Planned Functionality:
-------------------------
* More information on the individual character pages, with tabs for a detailed overview of the skill queue, contracts, mails, etc.
* Skill Planner, replicating EVEMon's skill planning functionality, including remaps, implants, etc.
* Configurable alerts (training stopped, character lapsed to alpha, ready for extraction, etc.)
* Skill Extraction Planner, experiment with extracting skills from your character to see how much ISK you would get.

Screenshots:
-------------------------
![character overview](https://prom.gaydar.space/2018-04-03_18-03-04_3ULjJZE6Vh9DWVQzglZvOM6FfwYpjo.png)

![sp-farming](https://prom.gaydar.space/2018-04-03_18-03-04_btXXy0WCslQmpiJkqajmVfKin9I2Wn.png)

![character-page](https://prom.gaydar.space/2018-04-03_18-03-04_fnvC20LNuvTldThgQPHqlVUsfExq1B.png)

Installation Instructions:
-------------------------
1. Download the latest release setup file from the Releases page.
2. Double click and wait for it to install. This may take 2-3 minutes. Be patient.  
    **Note:** Windows SmartScreen might block the install, just click More Info --> Run anyway.
3. Once installation is complete Cerebral will launch and you can start using it. A Start Menu/Desktop shortcut will be created automatically.

Usage:
-------------------------
* Add your characters using the "Authorise Character" button.
* Data will refresh automatically, you can manually trigger a refresh with the Refresh button. Note that CCP caches some data so things you change in-game may not refresh for a while.
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

I have no desire to embed my real name into an application I'm distributing to the EVE community, so it's unlikely I will ever be signing my code. As a result many AntIVirus programs will flag the application as a virus, you can safely add an exception if you trust me. :)

**What languages/technologies does Cerebral use?**

Node.js using Electron to allow it to run as a native application. (Same as Discord, Slack, etc.)  
The UI is powered by React.js.

Legal:
-------------------------
Copyright (c) 2018 Prometheus Satyen, prometheussatyen@gmail.com.  
**All Rights Reserved.**