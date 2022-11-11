var name = '';
var encoded = null;
var fileExt = null;
var SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
const icon = document.querySelector('i.fa.fa-microphone');


///// SEARCH TRIGGER //////
function searchFromVoice() {
  recognition.start();
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    document.getElementById("searchbar").value = speechToText;
    search();
  }
}

function search() {
  var searchTerm = document.getElementById("searchbar").value;
  var apigClient = apigClientFactory.newClient({ apiKey: "vTkt3JLf0qaJ1FVE4Hg6NW7bo08ryoR3mMnXfdu5" });


  var body = {};
  var params = {
    q: searchTerm,
    'Content-Type': "application/json"
  };

  apigClient.searchGet(params, {}, {}).then(function (res) {
    showImages(res.data)
  }).catch(function (result) {
    console.log("NO RESULT");
  });

}


/////// SHOW IMAGES BY SEARCH //////

function showImages(res) {
  var newDiv = document.getElementById("images");
  if (typeof (newDiv) != 'undefined' && newDiv != null) {
    while (newDiv.firstChild) {
      newDiv.removeChild(newDiv.firstChild);
    }
  }

  if (res.length == 0) {
    var newContent = document.createTextNode("No image to display");
    newDiv.appendChild(newContent);
  }
  else {
    results = res['imagePaths']
    
    for (var i = 0; i < results.length; i++) {
      
      filename = results[i].substring(results[i].lastIndexOf('/') + 1)
      var request = new XMLHttpRequest();
      request.open('GET', "https://b2-photo-store.s3.amazonaws.com/" + filename, true);
      request.responseType = 'blob';
      request.onload = function () {
        var newDiv = document.getElementById("images");
        var newimg = document.createElement("img");
        var reader = new FileReader();
        reader.onload = function (e) {
          newimg.src = 'data:image/*;base64, ' + (e.target.result);
        };
        reader.readAsText(this.response, 'base64');
        newDiv.appendChild(newimg);
      }
      request.send();
    }
  }
}


function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


///// UPLOAD IMAGES ///////
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // reader.onload = () => resolve(reader.result)
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if (encoded.length % 4 > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
}


var customlabel
function uploadImage() {
  const fileBtn = document.getElementById("file_id");
  fileBtn.click();
}

function previewFile(input) {
  var file = document.getElementById('file_id').files[0];
  customlabel = prompt("Please enter a label", "image");

  var file_data;
  var encoded_image = getBase64(file).then((data) => {
    var apigClient = apigClientFactory.newClient({ apiKey: "vTkt3JLf0qaJ1FVE4Hg6NW7bo08ryoR3mMnXfdu5" });

    var file_type = file.type + ';base64';

    var body = data;
    var params = {
      key: file.name,
      bucket: 'b2-photo-store',
      'Content-Type': file.type,
      'x-amz-meta-customLabels': customlabel,
      'x-api-key': 'vTkt3JLf0qaJ1FVE4Hg6NW7bo08ryoR3mMnXfdu5',
      Accept: '*/*',
    };

    var additionalParams = {};
    apigClient
      .uploadPut(params, body, additionalParams)
      .then(function (res) {
        if (res.status == 200) {
          alert("Photo Uploaded Successfully");
        } else {
          alert("You are dOOmed");
        }
      });
  });

}