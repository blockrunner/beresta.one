if (!navigator.bluetooth) {
  alert('Sorry, your browser doesn\'t support Bluetooth API');
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

const convertToByteMatrix = hexArray => hexArray
  .map(r => r
    .toString(2)
    .padStart(hexArray.length, "0")
    .split("")
  );

const convertToHexArray = byteMatrix => byteMatrix
  .map(r => parseInt(r
      .join(""), 2)
    .toString(16)
  );

const nullMatrix =  [    
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0, 0, 0, 0]
                    ];


const MY_BLUETOOTH_NAME = 'WEB-CLIENT';
let toggleLigthCharacteristic;
let myDevice;

function connectButton() {
  log.add('request device...');

  let SEND_SERVICE = Number(document.getElementById('bl-service').value);
  let SEND_SERVICE_CHARACTERISTIC = Number(document.getElementById('bl-char').value);

  navigator.bluetooth.requestDevice({
    filters:
      [
        { name: MY_BLUETOOTH_NAME },
        { services: [SEND_SERVICE] },
      ]
  })
    .then(device => {
      myDevice = device;
      log.add('connect..');
      console.log(myDevice);

      return device.gatt.connect();
    })
    .then(server => server.getPrimaryService(SEND_SERVICE))
    .then(service => service.getCharacteristic(SEND_SERVICE_CHARACTERISTIC))
    .then(characteristic => {
      toggleLigthCharacteristic = characteristic;

      log.add('connected');
      blSendCommand('engine-on');
      setTimeout(() => {
        document.getElementById('hand-right').click();
      }, 500);
      console.log(toggleLigthCharacteristic);
    })
    .catch(error => {
      log.add('error. details in console');
      console.error(error);
    });
}

function writeValues(data, index = 0) {
  if (index === data.length) {
    return;
  }

  const el = data[index];
  let toDeviceData = data[index + 1] ?
    [...convertToDeviceMatrix(data[index]), ...convertToDeviceMatrix(data[index + 1])] :
      [...convertToDeviceMatrix(data[index]), ...nullMatrix];

  toDeviceDataHex = [];
  toDeviceData.forEach(el => {
    toDeviceDataHex.push('0x' + parseInt(objToString(el), 2).toString(16));
  });

  let start = new TextEncoder().encode('!E');
  let end = new TextEncoder().encode('#');

  combined = new Uint8Array(start.length + toDeviceDataHex.length + end.length);
  combined.set(start, 0);
  combined.set(toDeviceDataHex, start.length);
  combined.set(end, start.length + toDeviceDataHex.length);

  console.log(combined);

  toggleLigthCharacteristic.writeValue(combined)
    .then(() => {
      log.add('write data');
      setTimeout(() => {
        if ( data[index + 2] ) writeValues(data, index + 2);
      }, 300);
    })
    .catch(error => {
      log.add('send command - ERROR');
      console.error(`Error writing data: ${error}`);
    }
  );
}

function blSendCommand(type, data = false, isLoad = false) {
  if ( ! toggleLigthCharacteristic ) { return false; }
  
  switch (type) {
    case 'write':
      let bytes = [];
      
      if ( ! isLoad ) { data = [data] }

      data.forEach(arr => {
        if ( Array.isArray(arr) ) {
          arr.forEach(el => {
            bytes.push(el);
          });      
        } else {
          arr = arr.split('');

          if ( arr.length % 2 !== 0 ) {
            arr.push(' ');
          }

          arr.forEach(el => {
            bytes.push(convertToByteMatrix(letter[el]));
          });
        }
      });

      writeValues(bytes);
    break;

    case 'play':
      let t_render = Number(document.getElementById('render-time').value);
      let start = new TextEncoder().encode('*T');
      let end = new TextEncoder().encode('#');
      let mid = ['0x' + decToHex(t_render)];

      combined = new Uint8Array(start.length + mid.length + end.length);
      combined.set(start, 0);
      combined.set(mid, start.length);
      combined.set(end, start.length + mid.length);

      console.log(combined);
      toggleLigthCharacteristic.writeValue(combined)
        .then(() => {
          let t_pause = Number(document.getElementById('pause-time').value);
          let start = new TextEncoder().encode('*U');
          let end = new TextEncoder().encode('#');
          let mid = ['0x' + decToHex(t_pause)];

          combined = new Uint8Array(start.length + mid.length + end.length);
          combined.set(start, 0);
          combined.set(mid, start.length);
          combined.set(end, start.length + mid.length);

          console.log(combined);

          toggleLigthCharacteristic.writeValue(combined)
            .then(() => {
              data = new TextEncoder().encode('*SE#');
              console.log(data);
              toggleLigthCharacteristic.writeValue(data)
                .then(() => {
                  log.add(`${type} command`);
                })
                .catch(error => {
                  log.add(`${type} command - ERROR`);
                  console.error(`Error writing data: ${error}`);
                }
              );
            })
        })
    break;

    case 'pause':
      data = new TextEncoder().encode('*SP#');
      console.log(data);
      toggleLigthCharacteristic.writeValue(data)
        .then(() => {
          log.add(`${type} command`);
        })
        .catch(error => {
          log.add(`${type} command - ERROR`);
          console.error(`Error writing data: ${error}`);
        }
      );
    break;

    case 'stop':
      data = new TextEncoder().encode('*SP#');
      console.log(data);
      toggleLigthCharacteristic.writeValue(data)
        .then(() => {
          log.add(`${type} command`);
        })
        .catch(error => {
          log.add(`${type} command - ERROR`);
          console.error(`Error writing data: ${error}`);
        }
      );
    break;

    case 'clear':
      data = new TextEncoder().encode('*EE#');
      console.log(data);
      toggleLigthCharacteristic.writeValue(data)
        .then(() => {
          log.add(`${type} command`);

            // let start = new TextEncoder().encode('*X');
            // let end = new TextEncoder().encode('#');
            // let mid = [0x00];

            // combined = new Uint8Array(start.length + mid.length + end.length);
            // combined.set(start, 0);
            // combined.set(mid, start.length);
            // combined.set(end, start.length + mid.length);


            // console.log(combined);
            // toggleLigthCharacteristic.writeValue(combined);
        })
        .catch(error => {
          log.add(`${type} command - ERROR`);
          console.error(`Error writing data: ${error}`);
        }
      );
    break;

    case 'engine-on':
      data = new TextEncoder().encode('*M+#');
      console.log(data);
      toggleLigthCharacteristic.writeValue(data)
        .then(() => {
          log.add(`${type} command`);
        })
        .catch(error => {
          log.add(`${type} command - ERROR`);
          console.error(`Error writing data: ${error}`);
        }
      );
    break;

    case 'hand':
      cmd = data === 'left' ?
        new TextEncoder().encode('*HL#') :
          new TextEncoder().encode('*HR#');

      console.log(cmd);
      toggleLigthCharacteristic.writeValue(cmd)
        .then(() => {
          log.add(`${type} ${data} command`);
        })
        .catch(error => {
          log.add(`${type} ${data} command - ERROR`);
          console.error(`Error writing data: ${error}`);
        }
      );
    break;

    case 'test-engines':
      switch (data) {
        case 'enable':
          cmd = new TextEncoder().encode('*M+#');
        break;
        case 'disable':
          cmd = new TextEncoder().encode('*M-#');
        break;
        case 'deviation':
          cmd = new TextEncoder().encode('*MT#');
        break;
      }

      console.log(cmd);
      toggleLigthCharacteristic.writeValue(cmd)
        .then(() => {
          log.add(`${type} ${data} command`);
        })
        .catch(error => {
          log.add(`${type} ${data} command - ERROR`);
          console.error(`Error writing data: ${error}`);
        }
      );
    break;

    default:
      return false;
    break;
  }
}

function convertToDeviceMatrix(array) {
  let newArray = [];

  for (let i = 0; i < array[0].length; i++) {
    let column = [];

    for (let j = 0; j < array.length; j++) {
      column.push(array[j][i]);
    }

    newArray.push(column);
  }

  return newArray;
}

class Log {
  logsArea = document.getElementById('logs');

  add(text) {
    this.logsArea.value += `${text}\n`;
  }
}

let log = new Log();

function drawToMatrix(array) {
  for (i = 0; i < array.length; i++) {
    for (ii = 0; ii < array[i].length; ii++) {
    	if (array[i][ii] == 1) {
        document.getElementById(`pixel-${i}-${[ii+1]}`).classList.add('on');
      }
    }
  }
}

class Fbf {
  static field = document.getElementsByClassName('fbf-line-div')[0];

  static array = [];

  static Add(array) {
    this.array.push(array);
  }

  static Update() {
    let string = '';

    if ( this.array[0] === undefined ) {
      this.array = [];
    }

    this.array.forEach(el => {
      if ( Array.isArray(el) ) {
        string += this.getMinMatrix(el);
      } else {
        string += el;
      }
        string += '<div class="vertical-line"></div>';
    });

    this.field.innerHTML = string;

    string === '' ?
      document.getElementById('fbf-clean').classList.add('disabled') :
        document.getElementById('fbf-clean').classList.remove('disabled');
  }

  static getMinMatrix(matrix_array) {
    let result = ['', ''];

    for (let int = 0; int < 2; int++) {
      matrix_array[int].forEach(el => {
        for (let i = 0; i < el.length; i++) {
          if ( el[i] === 1 ) {
            result[int] += '<dot class="true"></dot>';
          } else {
            result[int] += '<dot class="false"></dot>';
          }

          if ( i !== 0 && i % 7 === 0 ) {
            result[int] += '</div><div class="dot-row">';
          }
        }
      });
    }

    result = `<div class="line-dots"><span><div class="dot-row">${result[0]}</div></span></div>
              <div class="line-dots"><span><div class="dot-row">${result[1]}</div></span></div>`;

    return result;
  }
}

class Queue {
  field = document.getElementsByClassName('text-line-div')[0];
  array = [];

  AddText(text) {
    let appr = true;

    text.split('').forEach(s => {
      if ( ! letter[s] ) { alert(`Символ '${s}' не найден в таблице`); appr = false; }
    });

    if ( appr ) {
      this.array.push({type: 'text', preview: text, data: text});
      blSendCommand('write', text);
      document.getElementById('queue-save').classList.remove('disabled');
      document.getElementById('queue-save').classList.add('default');
    }
  }

  AddMatrix(array) {
      this.array.push({type: 'array', preview: array, data: array})
    document.getElementById('queue-save').classList.remove('disabled');
    document.getElementById('queue-save').classList.add('default');
    blSendCommand('write', array);
  }

  AddMergeMatrix(array, mergedArray) {
    this.array.push({type: 'merged', preview: mergedArray, data: array})
    document.getElementById('queue-save').classList.remove('disabled');
    document.getElementById('queue-save').classList.add('default');
    blSendCommand('write', array, true);
  }

  Update() {
    let string = '';

    if ( this.array[0] === undefined ) {
      this.array = [];
    }

    this.array.forEach(el => {
      if ( Array.isArray(el['preview']) ) {
        string += this.getMinMatrix(el['preview']);
      } else {
        string += el['preview'];
      }
        string += '<div class="vertical-line"></div>';
    });

    this.field.innerHTML = string;
  }

  getMinMatrix(matrix_array) {
    let result = ['', ''];

    for (let int = 0; int < 2; int++) {
      matrix_array[int].forEach(el => {
        for (let i = 0; i < el.length; i++) {
          if ( el[i] === 1 ) {
            result[int] += '<dot class="true"></dot>';
          } else {
            result[int] += '<dot class="false"></dot>';
          }

          if ( i !== 0 && i % 7 === 0 ) {
            result[int] += '</div><div class="dot-row">';
          }
        }
      });
    }

    result = `<div class="line-dots"><span><div class="dot-row">${result[0]}</div></span></div>
              <div class="line-dots"><span><div class="dot-row">${result[1]}</div></span></div>`;

    return result;
  }
}

class Matrix {
  bytes = [];
  enabled = false;
  renderArr = [];
  drawIntervalId;

  convertToByteMatrix = hexArray => hexArray
    .map(r => r
      .toString(2)
      .padStart(hexArray.length, "0")
      .split("")
  );

  Load(input) {
    this.bytes = [];

    if ( ! input ) { alert('Нет матриц в очереди'); return; }

    switch (input['type']) {
      case 'text':
        sendHttpPost('log-add', {
          'log-action': 'draw',
          'log-type': 'txt',
          'log-msg': input['preview'],
        });

        input['data'] = input['data'].split('');

        input['data'].forEach(el => {
          this.bytes.push(this.convertToByteMatrix(letter[el]));
        });
      break;

      case 'array':
        sendHttpPost('log-add', {
          'log-action': 'draw',
          'log-type': 'img',
          'log-msg': input['preview'],
        });

        input['data'].forEach(el => {
          this.bytes.push(el);
        });
      break;

      case 'merged':
        sendHttpPost('log-add', {
          'log-action': 'draw',
          'log-type': 'merged img',
          'log-msg': input['preview'],
        });

        input['data'].forEach(pEl => {
          pEl.forEach(el => {
            this.bytes.push(el);
          });
        });
      break;
    }

  }

  Draw() {
  let t_render = Number(document.getElementById('render-time').value * 1000);
  let t_pause = Number(document.getElementById('pause-time').value * 1000);;
  let cycleTime = t_render + t_pause;
  let startPause = 1000;
  let now_matrix;
  let int = 0;

  const drawNextFrame = () => {
    now_matrix = 1;

    setTimeout(this.Clear, t_render);

    if ( States.play !== 1 ) {
      clearInterval(this.drawIntervalId);
      this.EndRender();
      return;
    }

    if (!this.bytes[int]) {
      clearInterval(this.drawIntervalId);
      this.EndRender();
      return;
    }
    console.log(this.bytes)
    for (let i = 0; i < this.bytes[int].length; i++) {
      for (let ii = 0; ii < this.bytes[int][i].length; ii++) {
        if (this.bytes[int][i][ii] == 1) {
          document.getElementById(`pixel-${now_matrix}-${i}-${[ii]}`).classList.add('on');
        }
      }
    }

    int++;
    now_matrix = 2;

    if (!this.bytes[int]) {
      setTimeout(() => {
        clearInterval(this.drawIntervalId);
        this.EndRender();
      }, t_render);
      return;
    }

    for (let i = 0; i < this.bytes[int].length; i++) {
      for (let ii = 0; ii < this.bytes[int][i].length; ii++) {
        if (this.bytes[int][i][ii] == 1) {
          document.getElementById(`pixel-${now_matrix}-${i}-${[ii]}`).classList.add('on');
        }
      }
    }

    int++;
    now_matrix = 1;

    setTimeout(drawNextFrame, int === 0 ? startPause : cycleTime);
  };

  this.drawIntervalId = setTimeout(drawNextFrame, int === 0 ? startPause : cycleTime);
};

 

  Clear() {
    let pixels = document.getElementsByClassName('pixel');

    for (let i = 0; i < pixels.length; i++) {
      pixels[i].classList.remove('on');
    }
  }

  EndRender() {
    if ( States.play === 1 ) {
      States.enabled = false;
    }

    let el = queue.array.splice(0, 1)[0];
    queue.array.splice(queue.array.length, 1, el);

    queue.Update();
  }
}

class States {
  static play = -1; // -1 - stop, 0 - pause, 1 - play
  static nowInput = 0; // 0 - text, 1 - matrix;
  static playIntervalId; 
  static enabled = false;
  static random = false;
  static playTimeouts = [];
  
  static Update() {
    switch (this.play) {
      case 1:
        document.getElementById('play').classList.add('disabled');
        document.getElementById('pause').classList.remove('disabled');
        document.getElementById('stop').classList.remove('disabled');
        document.getElementById('clear').classList.add('disabled');
      break;

      case 0:
          document.getElementById('play').classList.remove('disabled');
          document.getElementById('pause').classList.add('disabled');
          document.getElementById('stop').classList.remove('disabled');
          document.getElementById('clear').classList.add('disabled');
      break;

      case -1:
        if ( queue.array.length > 0 ) {
          document.getElementById('play').classList.remove('disabled');
          document.getElementById('clear').classList.remove('disabled');
          document.getElementById('pause').classList.add('disabled');
          document.getElementById('stop').classList.add('disabled');
        } else {
          document.getElementById('clear').classList.add('disabled');
          document.getElementById('queue-save').classList.remove('default');
          document.getElementById('queue-save').classList.add('disabled');
        }
      break;
    }
  }
}

let queue = new Queue();
let matrix = new Matrix();

States.Update();

document.addEventListener('click', function(data) {
  if ( data.target.classList.contains('disabled') ) { return; }
      console.log(data.target.id)

  if ( data.target.id.indexOf('input-pixel') !== -1 ) {
    document.getElementById(data.target.id).classList.toggle('on');
  }

  switch (data.target.id) {
    case 'text-active-button':
      document.getElementById('text-active-button').classList.add('active');
      document.getElementById('text-input-field').classList.remove('none');

      document.getElementById('matrix-active-button').classList.remove('active');
      document.getElementById('matrix-input-field').classList.add('none');
      document.getElementById('fbf-send').classList.add('disabled');

      States.nowInput = 0;
    break;

    case 'matrix-active-button':
      document.getElementById('text-active-button').classList.remove('active');
      document.getElementById('text-input-field').classList.add('none');

      document.getElementById('matrix-active-button').classList.add('active');
      document.getElementById('matrix-input-field').classList.remove('none');

      document.getElementById('fbf-send').classList.remove('disabled');

      States.nowInput = 1;
    break;

    case 'random-enable':
      States.random = true;
      document.getElementById('random-disable').classList.remove('active');
      document.getElementById('random-enable').classList.add('active');
    break;

    case 'random-disable':
      States.random = false;
      document.getElementById('random-enable').classList.remove('active');
      document.getElementById('random-disable').classList.add('active');
    break;

    case 'hand-left':
      blSendCommand('hand', 'left');
      document.getElementById('hand-right').classList.remove('active');
      document.getElementById('hand-left').classList.add('active');
    break;

    case 'hand-right':
      blSendCommand('hand', 'right');
      document.getElementById('hand-right').classList.add('active');
      document.getElementById('hand-left').classList.remove('active');
    break;

    case 'test-enable':
      blSendCommand('test-engines', 'enable');
    break;

    case 'test-disable':
      blSendCommand('test-engines', 'disable');
    break;

    case 'test-deviation':
      blSendCommand('test-engines', 'deviation');
    break;

    case 'test-stop':
      blSendCommand('stop');
    break;

    case 'log-clear':
      let ops = confirm('Вы действительно хотите очистить файл лога?');
      if ( ops ) {
        sendHttpPost('log-clear');
      }
    break;

    case 'input-send':
      switch (States.nowInput) {
        case 0:
          let text = document.getElementById('text-input-field').value.trim();

          if ( ! text ) { alert('Не введен текст'); return; }

          queue.AddText(text);
          queue.Update();
          States.Update();
        break;

        case 1:
          if ( Fbf.field.innerHTML === '' ) {
            let pixels = document.getElementsByClassName('input-pixel');
            let empty = true;
            let matrix_array = [  
              [    
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
              ],
              [    
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
              ]
            ];

            for (let key in pixels) {
              if ( pixels[key].classList && pixels[key].classList.contains('on') ) {
                empty = false;
                let matches = pixels[key].id.match(/\d+/g);
                matches = matches.map(function(string) {
                  return parseInt(string);
                });
                matrix_array[matches[0]-1][matches[1]][matches[2]] = 1;
              }
            }

            if ( empty ) {
              alert('Рисунок пуст');
              return false;
            }

            queue.AddMatrix(matrix_array);
          } else {
            queue.AddMergeMatrix(Fbf.array, mergeMatrices(JSON.parse(JSON.stringify(Fbf.array))));
            Fbf.array = [];
            Fbf.Update();
          }
          queue.Update();
          States.Update();
        break;
      }
    break;

    case 'fbf-send':
          let pixels = document.getElementsByClassName('input-pixel');
          let empty = true;
          let matrix_array = [  
            [    
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0]
            ],
            [    
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0]
            ]
          ];

          for (let key in pixels) {
            if ( pixels[key].classList && pixels[key].classList.contains('on') ) {
              empty = false;
              let matches = pixels[key].id.match(/\d+/g);
              matches = matches.map(function(string) {
                return parseInt(string);
              });
              matrix_array[matches[0]-1][matches[1]][matches[2]] = 1;
            }
          }

          if ( empty ) {
            alert('Рисунок пуст');
            return false;
          }

          Fbf.Add(matrix_array);
          Fbf.Update();
    break;

    case 'play':
      if ( queue.array.length === 0 ) { alert('Нет матриц в очереди'); return; }

      sendHttpPost('log-add', {
        'log-action': 'start',
        'log-type': 'command',
        'log-msg': '-',
      });

      if ( ! States.random ) {
        blSendCommand('play');
      }

      States.play = 1;
      States.Update();

      States.enabled = false;
      
      States.playIntervalId = setInterval(() => {
        if ( ! States.enabled ) {
          States.enabled = true;

          if ( States.random ) {
            States.playTimeouts[0] = setTimeout(() => {
              shuffleArray(queue.array);
              queue.Update();

              blSendCommand('clear');

              States.playTimeouts[1] = setTimeout(() => {
                blSendCommand('write', queue.array[0]);

                States.playTimeouts[2] = setTimeout(() => {

                  blSendCommand('play');
                  matrix.Load(queue.array[0]);
                  matrix.Draw();
                }, 500);
              }, 2000);

              return;
            }, 500);
          } else {
            matrix.Load(queue.array[0]);
            matrix.Draw();
          }
        }
      }, 50);
    break;

    case 'pause':
      sendHttpPost('log-add', {
        'log-action': 'pause',
        'log-type': 'command',
        'log-msg': '-',
      });

      blSendCommand('pause');
      States.play = 0;
      States.Update();

      States.playTimeouts.forEach(id => {
        clearTimeout(id);
      })
    break;

    case 'stop':
      sendHttpPost('log-add', {
        'log-action': 'stop',
        'log-type': 'command',
        'log-msg': '-',
      });

      blSendCommand('stop');
      States.play = -1;
      States.Update();

      clearInterval(States.playIntervalId);
      States.playTimeouts.forEach(id => {
        clearTimeout(id);
      })
    break;

    case 'clear':
      blSendCommand('clear');
      queue.array = [];
      queue.field.innerHTML = ``;
      States.Update();
    break;

    case 'fbf-clean':
      Fbf.array = [];
      Fbf.field.innerHTML = ``;
      Fbf.Update();
    break;

    case 'connect':
      connectButton();
    break;

    case 'queue-save':
      let name = prompt('Введите имя шаблона');
      if ( ! name ) { return false; }
      Api.queueSave(name, queue.array);
    break;

    case 'queue-load':
      Api.queueLoad();
    break;

    case 'load-modal-list':
      let array = JSON.parse(data.target.attributes.data.value);
      queue.array = array;
      queue.Update();
      blSendCommand('clear');

      dataArray = [];
      array.forEach(el => {
        dataArray.push(...el['data']);
      })

      setTimeout(() => {
        blSendCommand('write', dataArray, true);
      }, 2000);
    break;

    case 'remove-modal-list':
      let id = data.target.attributes.data_id.value;
      sendHttpPost('queue-remove', {id: id});
      data.target.parentElement.remove();
    break;
  }
});

class Api {
  static queueSave(name, data) {
    sendHttpPost('queue-save', {name: name, data: data});
  }

  static queueLoad() {
    let data = sendHttpPost('queue-load', '', queueLoaded);
  }
}

function queueLoaded(data) {
  let list = '';
  data.forEach(el => {
    t_data = JSON.stringify(el['data']);
    list += `
          <li>
            ${el['name']}
            <button data='${t_data}' id="load-modal-list">Загрузить</button>
            <button data_id='${el['id']}' id="remove-modal-list">Удалить</button>
          </li>
          `;
  })

  let modal = `<div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <ul>
          ${list}
        </ul>
      </div>`;

  document.getElementById("load-modal").innerHTML = modal;
  openModal();
}

let modal = document.getElementById("load-modal");
let closeButton = document.getElementsByClassName("close")[0];

function openModal() {
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};

let cells = document.querySelectorAll('.input-pixel');

let isMouseDown = false;
let isOn = true;

function addClassToCells(cells) {
  for (let i = 0; i < cells.length; i++) {
    cells[i].classList.add('on');
  }
}

function removeClassFromCells(cells) {
  for (let i = 0; i < cells.length; i++) {
    cells[i].classList.remove('on');
  }
}

document.addEventListener('mousedown', function(event) {
  isMouseDown = true;
  if ( event.target.classList.contains('on') ) { isOn = false; }
});

document.addEventListener('mouseup', function(event) {
  isMouseDown = false;
  isOn = true;
});

document.addEventListener('mousemove', function(event) {
  if (isMouseDown) {
    let cellsUnderMouse = document.querySelectorAll('.input-pixel:hover');
    
    isOn ?
      addClassToCells(cellsUnderMouse) :
        removeClassFromCells(cellsUnderMouse);
  }
});



function sendHttpPost(method, body, successCallback, errorCallback) {
  const xhr = new XMLHttpRequest();
  url = 'api.php?method=';
  xhr.open('POST', url + method);
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // console.log(xhr.responseText);
        let result = JSON.parse(xhr.responseText);
        if ( successCallback && result['msg'] == 'success' ) { successCallback(result['data']['data']); }
      } else {
        console.error(xhr.status);
      }
    }
  };

  xhr.send(JSON.stringify(body));
}

function objToString(obj) {
    var str = '';
    for (var p in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
            str += obj[p];
        }
    }
    return str;
}

function decToHex(int) {
  return int.toString(16).padStart(2, '0');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function mergeMatrices(arr) {
  let mergedArr = arr[0];

  for (let i = 1; i < arr.length; i++) {
    let matrices = arr[i];
    for (let j = 0; j < matrices.length; j++) {
      let matrix = matrices[j];
      for (let k = 0; k < matrix.length; k++) {
        let row = matrix[k];
        for (let l = 0; l < row.length; l++) {
          mergedArr[j][k][l] = (mergedArr[j][k][l] || 0) + row[l];
          mergedArr[j][k][l] = mergedArr[j][k][l] > 0 ? 1 : 0;
        }
      }
    }
  }

  return mergedArr;
}