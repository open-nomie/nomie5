# Open Nomie - Private & Encrypted Mood & Life Tracker

![](https://shareking.s3.amazonaws.com/Screen-Shot-2019-07-07-14-12-15.02.png)

I started [building Nomie in 2014](https://nomie.app/blog/original-nomie-blog-post) and over the next handful of years I release 3 major versions in 3 different JS technologies (VanilaJS -> Ionic -> ReactNative). The Nomie user base grew to ~100,000 users spread over multiple versions and multiple platforms.

In March 2019 I decided to remove the apps from Google Play and the App Store and step away from the "native app world" has it's too exhausting.

While the native apps will continue to run for those who installed it before, I wanted to take the best parts of Nomie 1, 2 and 3 and release it as an open source solution that could be run in the browser. This project is that result.

## Try it out

-   **Master Branch** (Production) https://open.nomie.app
-   **Develop Branch** (dev) https://dev.nomie.app

## [Svelte](https://svlete.dev)

This rewrite/port uses SvelteJS https://svlete.dev - a great tool for building fast / reactive single page apps (like Vue, React) without the framework.

## [Blockstack](https://blockstack.org)

Since this version runs in the browser, it's using Blockstack for auth and storage. Blockstack is all about decentralized apps, and giving users full control over their data and keeps everything (trackers, boards, every single log) encrypted, only to be decrypted with your blockstack profile.

## Running it Locally

```
git clone git@github.com:nomie-app/nomie.git
cd nomie
npm install
npm run dev
```

## Structure Overview

-   **/src**
-   **/src/components** - simple single ui components to build the user interfact
-   **/src/containers** - complicated components
-   **/src/modules** - models and commonly used functions
-   **/src/routes** - nomie app's primary routes
-   **/src/scss** - global SCSS styling, variables, bootstrap
-   **/src/store** - application state management
-   **/src/utils** - common utility functions

## Meet the Nouns

-   **Tracker** - primarily represented by a button on the "track board". Trackers are represented by their hashtag in notes - for example: #sleep(160000).
-   **Board** - a board is specific group of trackers.
-   **Board Tabs** - how you switch boards on the track tab
-   **Log** - a record event. A lot contains a note, a note can contain unlimited numbers of tags; e.g: #mood(4) #pizza #beer(12). Logs can contain a lat and long. Tracker Objects and their values are parsed out of the logs in real time.

## Data Storage

Blockstack.org is a "Decentralized computing network and app ecosystem" - basically, it offers a means to auth a user, and get/put files that are encrypted. This means Nomie works with flat files that require a network lookup. I've decided to create a "log book" for each month. Even heavy users will have a monthly book less than 100k, so that seemed reasonable. Plus doing it every day would require way too many network lookups when generating stats, and each year would be too big for and risky.

/v01/data/books/2019-01

-   v01 - a way to make upgrading easier without affecting users existing data stores
-   data - generic
-   books - holder of books
-   2019-01 - json array of logs

/v01/data/trackers.json - trackers
/v01/data/boards.json - users board configuration

# Coding Rules

-   **Keep it readable** - focus on writing code that new people can easily understand and follow. If the code can't do it, then do it with comments. There's no such thing as too much commenting.
-   **Keep it under 300 lines** - the goal is to keep files under 300 lines of code. Note: Sometimes that's not feasible.
-   **Keep it flexible** - think in components. If you're doing something more than once, it most likely should be a component.
-   **Keep cleaning, organizing and testing** - this project didn't start very clean, or ready for unit testing, this should be an on going objective.
-   **Use what's there** - Twitter bootstrap ([and all it's classes](https://getbootstrap.com/)) are available, reuse what already exists before writing new - especially css.
