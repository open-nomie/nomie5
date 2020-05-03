function download(filename, content, type) {
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(new Blob([content], { type: `${type};charset=utf-8;` }), filename);
  } else {
    const encodedUri = `data:${type};charset=UTF-8,${encodeURIComponent(content)}`;
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Firefox
    link.click();
    setTimeout(() => {
      link.remove();
    }, 1000);
  }
}

export default {
  csv(filename = "download.csv", content) {
    const type = "text/csv";
    filename = filename.search(".json") == -1 ? `${filename}.csv` : filename;
    download(filename, content, type);
  },
  json(filename = "download.json", content) {
    const type = "text/json";
    filename = filename.search(".json") == -1 ? `${filename}.json` : filename;
    download(filename, content, type);
  },
};
