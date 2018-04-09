XXXX-XX-XX: 0.4.0-dev Alpha
-------------------------
* Added a new panel to the character pages showing information on when each type of data was last refreshed, and when it will next be refreshed.
* Added a new panel to the character pages showing jump fatigue information.
* Removed refresh button from character overview, all refreshing is handled automatically.
* Started requesting scopes for fatigue, loyalty points and character contracts.
* Fixed bug where version number in title bar would display as undefined.
* Fixed bug where the user-agent string sent to CCP APIs when requesting data did not contain a valid version number.
* Fixed bug where skills that were already finished would appear in the skill queue on character pages.

2018-04-06: 0.3.3 Alpha
-------------------------
* Bug fixed whereby some alpha characters would be incorrectly classified as omega.
* Version number now included in application title.
* Corporation icons are now displayed beside the omega status icon on the character overview/sp farming pages
* Implant icons are now shown for active implants.

2018-04-04: 0.3.2 Alpha
-------------------------
* Fixed major bug which prevented adding new characters
* Moved corp/alliance under character name on overview page
* Refactored a lot of code to be more efficient and easier to maintain
* Removed unnecessary react hot loader package

2018-04-03: 0.3.1 Alpha
-------------------------
* Fixed a number of bugs caused by character IDs being inconsistently stored as strings/numbers (now forced to strings)

2018-04-03: 0.3.0 Alpha
-------------------------
* Individual character pages added showing:
    * Basic character information: date of birth, security status, SP, wallet balance
    * Home location, current location, active ship
    * Attributes and remap information
    * Active implants
    * Skill queue
    * Jump clones
    * Scopes granted
* Individual character pages can be opened by clicking on a character in the left navigation, or by clicking on a row on the Character Overview/SP Farrming tables.
* A new scope "esi-universe.read_structures.v1" is now requested when adding a character.
    * This scope is used to resolve names and locations for structures for jump clones, home station, etc.
    * If you have characters entered into Cerebral, you should simply authorize them all again using the button and the scope will be added automatically.
    * If you do not re-authorize old characters, you may see locations listed as Unknown.
* Lots of backend work around station/structure/system information.

2018-03-26: 0.2.3 Alpha
-------------------------
* Bug Fixed: Character SP inaccurate after a skill finished training, but remained in the queue as a finished skill due to no player login.

2018-03-21: 0.2.2 Alpha
-------------------------
* Bug Fixed: Cerebral freezing after being left minimized for some time

2018-03-15: 0.2.1 Alpha
-------------------------
* Major refactoring/optimizations, RAM footprint has been drastically reduced
* Cerebral now minimizes to the tray when you close/minimize it.
    * You can re-open it by clicking on the icon in your tray.
    * You can quit Cerebral by right clicking the icon and selecting Quit.
* Cerebral now updates character data automatically.

2018-03-14: 0.2.0 Alpha
-------------------------
* Added SP Farming tab, see Current Functionality/Usage for details/instructions.
* SP counters and training timers now tick in real time.

2018-03-13: 0.1.0 Alpha
-------------------------
* First Alpha