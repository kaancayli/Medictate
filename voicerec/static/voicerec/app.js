//webkitURL is deprecated but nevertheless
// I followed this guide to integrate recorder.js to my project: https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/
// It's same in the big part I just tweaked it a little bit for the project.
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

function startRecording(case_id) {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	// Owner can only make one voice recording at a time.
	// Deactivate all recordbuttons
	recordButton = document.querySelectorAll(`.recordButton`).forEach((r) => r.disabled = true);

	// By default pause and stop buttons are disabled 
	pauseButton = document.querySelector(`#pauseButton${case_id}`)
	pauseButton.disabled = false;

	stopButton = document.querySelector(`#stopButton${case_id}`)
	stopButton.disabled = false;

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
}

function pauseRecording(case_id){
	console.log("pauseButton clicked rec.recording=",rec.recording );

	pauseButton = document.querySelector(`#pauseButton${case_id}`)

	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";

	}
}

function stopRecording(case_id) {
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	recordButton = document.querySelectorAll(`.recordButton`).forEach((r) => r.disabled = false);

	pauseButton = document.querySelector(`#pauseButton${case_id}`);
	pauseButton.disabled = true;

	stopButton = document.querySelector(`#stopButton${case_id}`);
	stopButton.disabled = true;
	
	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV((blob) => createDownloadLink(blob, case_id));
}

function createDownloadLink(blob, case_id) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = "Save to disk";

	//add the new audio element to li
	li.appendChild(au);
	
	//add the filename to the li
	li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	li.appendChild(link);
	
	var formData = new FormData();
	formData.append('audio', blob);
	const request = new Request(
        `/recording_util/${case_id}`,
        { headers: { 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value } }
    );
	// Save the recording via form data
	fetch(request, {
	method: 'POST',
	body: formData
	})
	.then(response => response.json())
	.catch(error => console.error('Error:', error))
	.then(response => console.log('Success:', JSON.stringify(response)));

	li.appendChild(document.createTextNode (" "));//add a space in between

	//add the li element to the ol
	recordingList = document.querySelector(`#recordingList${case_id}`);
	
	recordingList.appendChild(li);
}