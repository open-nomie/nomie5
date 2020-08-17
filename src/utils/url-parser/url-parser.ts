export default function ParseURL(urlString) {
  let url;
  const hasURLParts = (str) => {
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

interface IURLParams {
  [key: string]: string;
}
export function getURLParams(url: string): IURLParams {
  let urlParams: IURLParams = {};
  // Get URL params - split em up - loop over them - fill urlParams object
  let split = url.split("?");
  if (split.length == 2) {
    split[1].split("&").forEach((chunks) => {
      let kv = chunks.split("=");
      urlParams[kv[0]] = kv[1];
    });
  }

  return urlParams;
}
