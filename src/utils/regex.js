const regex = {
  // tag_v311: /(#[^\s|\.|#|\?)][\x00-\xFF][^\s]+)/,
  // tag_v4: /(#[\x00-\xFF][^\s]+)/, //new as of 3.1.3
  // tag: /(#[\x00-\xFF][^\s|'|,|!|’|?]+)/,
  // person: /(\@[\x00-\xFF][^\s|'|,|.|!|’|?]+)/,
  // context: /(\+[\x00-\xFF][^\s|'|,|.|!|’|?]+)/,
  escape(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  },
  //template: {
  // generic(name) {
  //   return new RegExp(`(${regex.escape(name)})`, "gi");
  // },
  // person(name) {
  //   return new RegExp(`(\@${regex.escape(name)}|\@${regex.escape(name)})(\\s|\\b|\-|^)`, "gi");
  // },
  // tag(tag) {
  //   return new RegExp(`(\#${regex.escape(tag)}[^\\s|\'|\,|\-|\!|\?]\+)`, "gi");
  // },
  // tagOnly(tag) {
  //   // Ignore the value
  //   tag = tag.replace("#", "");
  //   let str = `(#${tag}|#${tag})(\\s|\\b|\-|^)`;
  //   return new RegExp(str, "gi");
  // },
  // tracker(tag) {
  //   return regex.template.tag(tag);
  // },
  // context(context) {
  //   context = context.replace("+", "");
  //   return new RegExp(`(\\+${regex.escape(context)}|\\+${regex.escape(context)})[^\\s|\\b|\\-|\\_]`, "gi");
  // },
  //},
};
export default regex;
