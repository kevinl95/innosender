import './utils.ts';

function download(data, filename, type) {
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
      var a = document.createElement("a"),
              url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
      }, 0); 
  }
}

// This is a basic web component
class AppButton extends HTMLButtonElement {
  constructor() {
    super();

    this.addEventListener('click', this.handleReceiver);

    this.style.transition = 'all 40ms ease-in-out';
  }

  async handleReceiver() {
    window.app.showLoading();
    const response = await fetch('/api/v0/handle-receiver');
    const res = await response.json();
    download(res.payloadPub, "payloadPub.txt", "text/plain;charset=utf-8");
    download(res.payloadPriv, "payloadPriv.txt", "text/plain;charset=utf-8");
    download(res.scanPub, "scanPub.txt", "text/plain;charset=utf-8");
    download(res.scanPriv, "scanPriv.txt", "text/plain;charset=utf-8");
    navigator.clipboard.writeText(res.addr);
    this.innerText = `Share this address (it's been copied to your clipboard!) ${res.addr}`;
    window.app.hideLoading();
  }
}

export default AppButton;
