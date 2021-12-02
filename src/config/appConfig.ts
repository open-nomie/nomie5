export default {
  patron_pin: "cb808de40d0152728640f0ec8c386303",
  primary_color: "#319ed7",
  storage_engine: "local", // local or blockstack
  book_time_format: "YYYY-w", // Careful changing this!! Its how all records are referenced. Changing it breaks everything.
  book_time_unit: "week", // SERIOUSLY!
  data_root: "data",
  data_people_key: "people.json",
  book_root: "data/books",
  tracker_file: "trackers.json",
  board_file: "boards.json",
  always_locate_key: "always-locate",
  dark_mode_key: "dark-mode",
  theme_key: "theme",
  user_meta_path: "data/meta.json",
  support_email: "support@happydata.org",
  support_contact: "Email Brandon",
  messages_url: "https://s3.amazonaws.com/cdn.nomie.app/messages/messages.json",
  patreon: "https://www.patreon.com/bePatron?u=40136531",
  patreonHome: "https://www.patreon.com/nomieapp",
  api: "https://nomieapi.com",
  positivity: [
    { emoji: "😡", score: -2 },
    { emoji: "😔", score: -1 },
    { emoji: "😐", score: 0 },
    { emoji: "😌", score: 1 },
    { emoji: "🥳", score: 2 },
  ],
};
