window.onload = function() {
  run();
}

async function run() {
  let input = await loadVideo('sintel-1024.webm');
  let output = await transcode(input);
  downloadData(output);
}

function loadVideo(url) {
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open("GET", url , true);
    req.responseType = "arraybuffer";
    req.onload = function(oEvent) {
      resolve(new Blob([req.response], {type: 'video/webm'}));
    };
    req.send();
  });
}

function transcode(blob) {
  console.log('will transcode', blob);
  return new Promise((resolve, reject) => {
    let worker = new Worker('ffmpeg-worker-mp4.js');
    let stderr, stdout;
    worker.onmessage = (e) => {
      let msg = e.data;
      console.log(msg);
      switch (msg.type) {
        case 'ready':
          worker.postMessage(
            {
              type: 'run',
              mounts: [
                { type: "WORKERFS",
                  opts: { blobs: [{ name: 'input.webm', data: blob }]},
                  mountpoint: '/data' }
              ],
              arguments: "-i /data/input.webm -c:v copy output.mp4".split(' ')
            });
          break;
        case 'stdout':
          stdout += msg.data + '\n';
          break;
        case 'stderr':
          stderr += msg.data + '\n';
          break;
        case 'done':
          worker.terminate();
          resolve(new Blob([msg.data.MEMFS[0].data], { type: 'video/mp4' }));
          break;
        case 'exit':
          if (msg.data) { // exit code not zero
            worker.terminate();
            reject(msg.data);
          }
          break;
        default: break;
      }
    };
  });
}

function downloadData(blob, basename) {
  basename = basename || 'output';
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = `${basename}.${blob.type.split('/')[1]}`;
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
