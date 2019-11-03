# Nomie 4.4.0

## Open Source Mood Tracker / Life Tracker / Data Journal

![](https://shareking.s3.amazonaws.com/nomie4-screens.png?2)

## Try it out

- https://open.nomie.app **Production** (master)

If you like to live dangerously you can run the dev branch

- https://dev.nomie.app **Development** (develop)

## Watch the [Nomie 4.4.0 release podcast](https://youtu.be/Lmpytrsj6mg)

---

Note: Data cannot be shared across domains, if you want to switch between prod and experimental, you'll need to export and import your data (in the settings tab).

Help Promote Nomie by [Tweeting](https://twitter.com/intent/tweet?hashtags=free,cantbeevil,dap,privacy,oss&text=Track%20your%20mood%20and%20everything%20that%20affects%20it%20-%20with%20Nomie%20https%3A//nomie.app)

## The Story

I started [building Nomie in 2014](https://nomie.app/blog/original-nomie-blog-post) and over the next handful of years I release 3 major versions in 3 different JS technologies (VanilaJS -> Ionic -> ReactNative). The Nomie user base grew to ~100,000 users spread over multiple versions and multiple platforms.

In March 2019 I decided to remove the apps from Google Play and the App Store and step away from the "native app world" has it's too exhausting.

While the native apps will continue to run for those who installed it before, I wanted to take the best parts of Nomie 1, 2 and 3 and release it as an open source solution that could be run in the browser. This project is that result.

Wanna know more about the Nomie story? [Here are a handful of podcasts talking about each release](https://soundcloud.com/nomiepodcast).

## Want to contribute?

1. Work in the develop branch, not master. All pull requests should be for develop.
2. Keep dependencies to an absolute minimum.
3. Reuse code when possible.

## [Svelte](https://svelte.dev)

This rewrite/port uses SvelteJS https://svelte.dev - a great tool for building fast / reactive single page apps (like Vue, React) without the framework.

## [Blockstack](https://blockstack.org)

Since this version runs in the browser, it's using Blockstack for auth and storage. Blockstack is all about decentralized apps, and giving users full control over their data and keeps everything (trackers, boards, every single log) encrypted, only to be decrypted with your blockstack profile.

## Running it Locally

You'll need Node >= 6 and NPM. I have not tested running this on Windows.

```
git clone git@github.com:nomie-app/nomie.git
cd nomie
npm install
npm run dev
```

## Running tests

```
npm run cypress
```

Deploy straight to Netlify to test it out quickly.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://app.netlify.com/start/deploy?repository=https://github.com/open-nomie/nomie)

## Structure Overview

- **/src**
- **/src/components** - simple single ui components to build the user interfact
- **/src/containers** - complicated components
- **/src/modules** - models and commonly used functions
- **/src/plugins** - holder of plugins (coming soon)
- **/src/routes** - nomie app's primary routes
- **/src/lang** - holder of languages
- **/src/scss** - global SCSS styling, variables, bootstrap
- **/src/store** - application state management
- **/src/utils** - common utility functions
- **/cypress** - Unit and E2E testing

## Meet the Nouns

- **Tracker** - primarily represented by a button on the "track board". Trackers are represented by their hashtag in notes - for example: #sleep(160000).
- **Board** - a board is specific group of trackers.
- **Board Tabs** - how you switch boards on the track tab
- **Log** - a record event. A lot contains a note, a note can contain unlimited numbers of tags; e.g: #mood(4) #pizza #beer(12). Logs can contain a lat and long. Tracker Objects and their values are parsed out of the logs in real time.

## Stores

- ** /src/store/lang ** - Language Controls
- ** /src/store/trackers ** -- Tracker Data and interactions
  -- TODO: finish this

## Data Storage - NEEDS UPDATING

Open Nomie as of Jul 27, will support either local (with localforage) or cloud (with blockstack)

All storage is done based a key, value - so adding additional storage options in the future should be pretty easy.

Blockstack.org is a "Decentralized computing network and app ecosystem" - basically, it offers a means to auth a user, and get/put files that are encrypted. This means Nomie works with flat files that require a network lookup. I've decided to create a "log book" for each month. Even heavy users will have a monthly book less than 100k, so that seemed reasonable. Plus doing it every day would require way too many network lookups when generating stats, and each year would be too big for and risky.

/v01/data/books/2019-01 - array of logs
/v01/data/trackers.json - trackers
/v01/data/boards.json - users board configuration

## Component / Container Issues

I don't like having a bunch of floating variables around, so like Vue, and Svete 2 - I tend to group data and methods together. But I flipped about half way through calling it data, to then calling it state. I'm not sure which will stick.

# Current Tracker Types

**tick** Single Tap

Just tap the button to automatically track, no value input.

**value** Numeric

Manually enter a value. Great for tracking caffiene, medicines

**range** Range

Great for any type of range selection - for example Mood.

**timer** Timer

Tap to start, tap to stop. The timer is great for tracking durations.

**meta** Multi-tracker

Combine multiple trackers into a single flow, for collecting a squence of tracker data

# Coding Rules

- **Keep it readable** - focus on writing code that new people can easily understand and follow. If the code can't do it, then do it with comments. There's no such thing as too much commenting.
- **Keep it under 300 lines** - the goal is to keep files under 300 lines of code. Note: Sometimes that's not feasible.
- **Keep it flexible** - think in components. If you're doing something more than once, it most likely should be a component.
- **Keep cleaning, organizing and testing** - this project didn't start very clean, or ready for unit testing, this should be an on going objective.
- **Use what's there** - Twitter bootstrap ([and all its classes](https://getbootstrap.com/)) are available, reuse what already exists before writing new - especially css.

## Trademark License

Nomie and the Blue Elephant are registered Trademarks of Happy Data, LLC. Indianapolis, IN. For a commercial use of the brand or logomark please contact support@happydata.org

## MIT License

Copyright 2019 Happy Data, LLC <support@happydata.org>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
