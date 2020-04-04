export default {
  tag_v311: /(#[^\s|\.|#|\?)][\x00-\xFF][^\s]+)/,
  tag_v4: /(#[\x00-\xFF][^\s]+)/, //new as of 3.1.3
  tag: /(#[\x00-\xFF][^\s|'|,|.|!|?]+)/,
  person: /(\@[\x00-\xFF][^\s|'|,|.|!|?]+)/,
  context: /(\+[\x00-\xFF][^\s|'|,|.|!|?]+)/,
  escape(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
};
