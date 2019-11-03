# v.4.4.0 - Nov 2 2019

Fixes a lot of user submitted bugs, Chinese Translation, improved UI, and a handful of enhancements. Note worthy items includes:

## Enhancements

- Tracker Search
- Saving/Reusing Locations
- Double Emoji Support
- Tracker Buttons now show marks for todays logs (Nomie 2 port)
- Improved UI for capturing new logs, setting date and picking location
- Timers now support both seconds and "04:44:32" hh:mm:ss as a valid format
- Improved UI for phones with Notches
- Adding a better Sharing experience
- Nomie API auto imports every 4 minutes
- Stat Compare Chart added
- Partial Chinese Language support

## Bugs

- Hiding Scrollbars
- Map location more accurate
- Fixing underscores in tag name
- Fixing reload not reloading
- Fixed Hour of Day positivity bug

# v.4.3.0 - Sept 22 2019

This release focuses on new users coming to Nomie without previous nomie experience or data.

## Enhancements

- CSV Export
- New Onboarding flow to make things easier [#52]
- Added new Tracker Library with pre-build trackers [#52]
- Moved Stats to Modal - improved stat design
- Board Tabs are now optional

## Bugs

- Fixed button styling, added on action
- Added Positivity Back to Nomie https://shareking.s3.amazonaws.com/Screen-Recording-2019-09-08-16-26-52.mp4
- Changing verbage for Switching storage types [#51]
- Tagging Language Support Ticket [#50]
- Tagging Offline Support [#11] - Service workers now cache everything should work offline if using Local Storage
- Fixing double stones in UOM [#53]
- Fixing settings design
- Fixed Negative Number issues [#47]

# v.4.2.6 - Sat Set 7 2019

## Enhancements

- New All-in-one Log Editor
- Improved History / Search Tab
- Time of Day coloring
- Added 24 hour option [#41]

## Fixes

- Fixed Aggressive Sync [#42]
- Moving history point to last month bug [#44]
- Map Location always changing [#43]
- Cannot add Tracker when starting app [#45]

# v4.2.1 - Sat Aug 31 2019

## Enhancements

- Settings: Added Find and Replace - search for content in your notes and replace it.
- Nomie UOM: Added CNY to currency
- Overall: Moved vendor resources out of rollup, and into build script (to help hot reload times)
- Tracker Page: Added Visuals to show which trackers are "being saved"
- Tracker Editor: Made tag editable - after confirming the dangers
- Dark theme enhancements

## Bugs

- Lots of small bug fixes
- Made Nomie respect Safe Areas - like the iPhone X notch
- Double tapping records multiple times

## Partial

- Add a Photo - it's not working for iOS or Safari - so it's disabled for now.

# v4.1.16 - Sunday Aug 11 2019

## Bugs

- Null Username for blockstack storage - It will now show blockstack if a username is not available [#15](https://github.com/open-nomie/nomie/issues/15).
- Removed Tracker Emoji character limit to ensure all types of emojis can be used. [#17](https://github.com/open-nomie/nomie/issues/17)
- Dark Mode bugs
- Multiple pull requests to fix my horrible spelling
- Multiple small bug fixes

## Enhancements

- Dark Mode - Automatic detection if device is in Dark mode
- Day Reset - Nomie will now ask to be refreshed when a new day starts [#18](https://github.com/open-nomie/nomie/issues/18)
- Scroll to focused tab - new horiztonal-scroller that will scroll to the active child.
- Abstracted Storage Engine - should be easier to add new types of storage [#12](https://github.com/open-nomie/nomie/issues/12)

## Known Issues

- Cannot edit Tracker Data
- Plugins are incomplete
- Some times Today's data doesn't show on the main tracker board
