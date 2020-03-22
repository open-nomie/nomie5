export default function ParseURL(urlString) {
  let url = {
    valid: false
  };
  const hasURLParts = str => {
    // http:,,host
    let valid = true;
    let chunks = (str || "").split("/");
    if (chunks[0].search("http") == -1) {
      valid = false;
    }
    if (chunks.length < 2) {
      valid = false;
    }
    return valid;
  };

  if (hasURLParts(urlString)) {
    url = new URL(urlString);
    url.valid = true;
  }
  return url;
}
