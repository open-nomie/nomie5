export default {
  patron_pin: "cb808de40d0152728640f0ec8c386303",
  primary_color: "#319ed7",
  storage_engine: "local", // local or blockstack
  book_time_format: "YYYY-w", // Careful changing this!! Its how all records are referenced. Changing it breaks everything.
  book_time_unit: "week", // SERIOUSLY!
  data_root: "v5-data",
  data_people_key: "people-v5",
  book_root: "v5-data/books",
  tracker_file: "trackers.json",
  board_file: "boards.json",
  always_locate_key: "always-locate",
  dark_mode_key: "dark-mode",
  theme_key: "theme",
  user_meta_path: "v5-data/meta.json",
  support_email: "support@happydata.org",
  support_contact: "Email Brandon",
  patreon: "https://www.patreon.com/bePatron?u=40136531",
  api: "https://nomieapi.com",
  positivity: [
    { emoji: "😡", score: -2 },
    { emoji: "👎", score: -1 },
    { emoji: "😐", score: 0 },
    { emoji: "👍", score: 1 },
    { emoji: "🤗", score: 2 },
  ],
};
