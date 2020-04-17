import regexs from "../regex";
export default function(text) {
  let reg = new RegExp(regexs.person, "gi");
  return (text.match(reg) || []).map(person => {
    return person.replace("@", "");
  });
}
