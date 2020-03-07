export default function(text) {
  return (text.match(/\+[a-zA-Z0-9_]{1,15}/gi) || []).map(person => {
    return person.replace("+", "");
  });
}
