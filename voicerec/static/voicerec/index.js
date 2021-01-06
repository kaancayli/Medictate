document.addEventListener("DOMContentLoaded", function () {
  // by default show profile-view
  document.querySelector("#patient-form").style.display = "none";
  document.querySelector("#create-room").style.display = "none";
  document.querySelector("#messages-view").style.display = "none";
  document.querySelector("#message").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#profile-view").style.display = "block";

  document
    .querySelector("#profile-button")
    .addEventListener("click", function () {
      // Show the main and hide other views
      document.querySelector("#patient-form").style.display = "none";
      document.querySelector("#create-room").style.display = "none";
      document.querySelector("#messages-view").style.display = "none";
      document.querySelector("#message").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";
      document.querySelector("#table").style.display = "block";
      document.querySelector("#table-closed").style.display = "block";
      document.querySelector("#profile-view").style.display = "block";
      document.querySelector("#title").innerHTML = "All Cases";
      load_profile("active");
    });

  // Shows create-room-view
  document
    .querySelector("#create-room-button")
    .addEventListener("click", function () {
      // Show the create-room view and hide other views
      document.querySelector("#title").innerHTML = "Create Room";
      document.querySelector("#messages-view").style.display = "none";
      document.querySelector("#message").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";
      document.querySelector("#patient-form").style.display = "none";
      document.querySelector("#table").style.display = "none";
      document.querySelector("#table-closed").style.display = "none";
      document.querySelector("#create-room").style.display = "block";
      document.querySelector("#profile-view").style.display = "none";
    });

  // Messages view
  document
    .querySelector("#message-button")
    .addEventListener("click", function () {
      document.querySelector("#title").innerHTML = "Messages";
      load_messages();
    });

  // Compose view
  document
    .querySelector("#message-compose-menu")
    .addEventListener("click", function () {
      document.querySelector("#title").innerHTML = "Compose Message";
      compose_message();
    });

  // Create room
  document.querySelector("#room-submit").onclick = () => create_room();

  //Load rooms and make them visible on the sidebar
  load_rooms();

  document.querySelector("#title").innerHTML = "All Cases";
  // Load main page
  load_profile("active");
});

// Load main page
function load_profile(url) {
  fetch(`/${url}`)
    .then((response) => response.json())
    .then((cases) => {
      display_cases(cases);
    });

  fetch("/profile")
    .then((response) => response.json())
    .then((counts) => {
      document.querySelector(
        "#message_count"
      ).innerHTML = `${counts.message_count} Unread Messages`;
      document.querySelector(
        "#case_count"
      ).innerHTML = `${counts.case_count} Cases to handle`;
      document.querySelector("#messages_view_details").onclick = () => {
        load_messages();
        document.querySelector("#title").innerHTML = "Messages";
      };
    });
}

function create_room() {
  const request = new Request("/create_room", {
    headers: {
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
    },
  });
  fetch(request, {
    method: "POST",
    body: JSON.stringify({
      room_name: document.querySelector("#room-name").value,
      participants: document.querySelector("#participants").value,
    }),
    mode: "same-origin",
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
      document.querySelector("#participants").value = "";
      document.querySelector("#room-name").value = "";
      load_rooms();
    });
}
function load_rooms() {
  fetch("/rooms")
    .then((response) => response.json())
    .then((rooms) => {
      document.querySelector("#room-menu").innerHTML = "";
      document.querySelector("#room-menu-small").innerHTML = "";
      rooms.forEach(function (room) {
        // Add rooms to the side panel
        const li = document.createElement("li");
        li.className = "nav-item";
        const a = document.createElement("a");
        a.className = "nav-link";
        a.href = "#";
        a.onclick = () => show_room(room);
        li.append(a);
        const icon = document.createElement("span");
        icon.setAttribute("data-feather", "mic");
        a.append(icon);
        document.querySelector("#room-menu").append(li);

        // Add rooms also to the dropdown menu
        const a_small = document.createElement("a");
        a.href = "#";
        a_small.className = "dropdown-item";
        document.querySelector("#room-menu-small").append(a_small);
        a_small.onclick = () => show_room(room);
        if (room.owner) {
          const small = document.createElement("small");
          small.className = "text-muted";
          small.innerHTML = "(owner)";
          a.append(document.createTextNode(`${room.name} `));
          a.append(small);

          a_small.append(document.createTextNode(`${room.name} `));
          a_small.append(small.cloneNode(true));
        } else {
          a.append(document.createTextNode(`${room.name}`));

          a_small.append(document.createTextNode(`${room.name}`));
        }
        feather.replace();
      });
    });
}

function create_case(room) {
  // Show the create-room view and hide other views
  document.querySelector("#messages-view").style.display = "none";
  document.querySelector("#message").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#patient-form").style.display = "block";
  document.querySelector("#table").style.display = "none";
  document.querySelector("#table-closed").style.display = "none";
  document.querySelector("#create-room").style.display = "none";
  document.querySelector("#profile-view").style.display = "none";
  const request = new Request(`/create_case/${room.id}`, {
    headers: {
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
    },
  });
  fetch(request, {
    method: "POST",
    body: JSON.stringify({
      name: document.querySelector("#patient-name").value,
      surname: document.querySelector("#patient-surname").value,
      prediagnosis: document.querySelector("#prediagnosis").value,
    }),
    mode: "same-origin",
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
      document.querySelector("#patient-name").value = "";
      document.querySelector("#patient-surname").value = "";
      document.querySelector("#prediagnosis").value = "";
      show_room(room);
    });

  return false;
}

// Load the cases for a particular room
function show_room(room) {
  // Show the room and hide other views
  document.querySelector("#messages-view").style.display = "none";
  document.querySelector("#message").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#patient-form").style.display = "none";
  document.querySelector("#table").style.display = "block";
  document.querySelector("#table-closed").style.display = "block";
  document.querySelector("#create-room").style.display = "none";
  document.querySelector("#profile-view").style.display = "none";
  document.querySelector("#title").innerHTML = room.name;

  document.querySelector("#case-submit").onclick = () => create_case(room);
  if (room["owner"] !== true) {
    document.querySelector("#patient-form").style.display = "block";
  }
  fetch(`/room_cases/${room.id}`)
    .then((response) => response.json())
    .then((cases) => {
      display_cases(cases);
    });
}

// Render cases as tables
function display_cases(cases) {
  console.log(cases);
  document.querySelector(
    "#dataTableActive"
  ).innerHTML = `<thead class="thead-dark" id="patient-table-head-closed">
    <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Prediagnosis</th>
        <th>Created By</th>
        <th>Date</th>
        <th>Recorded</th>
        <th>Edit</th>
      </tr>
    </thead>`;
  document.querySelector("#dataTableClosed").innerHTML = document.querySelector(
    "#dataTableActive"
  ).innerHTML;
  cases.forEach(add_case);
}

// Code from: https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
function urlify(text) {
  urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '">' + url + "</a>";
  });
}

// Renders and displays all cases in a table
function add_case(cases) {
  const tr = document.createElement("tr");
  tr.className = "accordion-toggle";
  tr.setAttribute("data-toggle", "collapse");
  tr.setAttribute("data-target", `#demo${cases.id}`);

  // Create table elements
  const patientName = document.createElement("td");
  patientName.innerHTML = `<p>${cases.patient_name}</p>`;

  const patientSurname = document.createElement("td");
  patientSurname.innerHTML = `<p>${cases.patient_surname}</p>`;

  const prediagnosis = document.createElement("td");
  prediagnosis.innerHTML = `<p>${cases.prediagnosis}</p>`;

  const createdBy = document.createElement("td");
  createdBy.innerHTML = `${cases.creator}`;

  const actions = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.setAttribute("id", `checkbox${cases.id}`);
  checkbox.type = "checkbox";
  actions.append(checkbox);

  const edit = document.createElement("td");
  const button = document.createElement("button");
  button.setAttribute("id", "editButton");
  button.innerHTML = '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
  edit.append(button);
  const date = document.createElement("td");
  date.innerHTML = `${cases.timestamp}`;

  tr.append(
    patientName,
    patientSurname,
    prediagnosis,
    createdBy,
    date,
    actions,
    edit
  );

  // Edit content event listener
  tr.onclick = function (event) {
    // Don't dropdown the row when a field is clicked for editing
    if (
      patientName.firstChild.contentEditable === "true" ||
      patientSurname.firstChild.contentEditable === "true" ||
      prediagnosis.firstChild.contentEditable === "true"
    ) {
      event.stopPropagation();
    }
    // Clicking anywhere other than fields stops editing
    if (
      event.target !== patientName.firstChild &&
      event.target !== patientSurname.firstChild &&
      event.target !== prediagnosis.firstChild
    ) {
      patientName.firstChild.contentEditable = "false";
      patientSurname.firstChild.contentEditable = "false";
      prediagnosis.firstChild.contentEditable = "false";

      patientName.firstChild.innerHTML = patientName.firstChild.innerHTML;
      patientSurname.firstChild.innerHTML = patientSurname.firstChild.innerHTML;
      prediagnosis.firstChild.innerHTML = prediagnosis.firstChild.innerHTML;
      if (!button.disabled) {
        button.innerHTML =
          '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
        button.style.backgroundColor = "rgb(255, 109, 109)";
      }
      timesClicked = 0;
    }
  };
  const trHiddenRow = document.createElement("tr");
  const tdHiddenRow = document.createElement("td");
  tdHiddenRow.setAttribute("colspan", "6");
  tdHiddenRow.className = "hiddenRow";
  const body = document.createElement("div");
  body.setAttribute("id", `demo${cases.id}`);
  body.className = "accordian-body collapse";

  const record = document.createElement("div");
  record.className = "record";

  const recordingList = document.createElement("ul");
  recordingList.setAttribute("id", `recordingList${cases.id}`);
  recordingList.className = "recordingList";

  // If user can not record just show recording list.
  if (!cases.can_record) {
    record.append(recordingList);
    button.disabled = false;
  } else {
    const controls = document.createElement("div");
    controls.className = "controls";

    const recordButton = document.createElement("button");
    recordButton.innerHTML = "Record";
    recordButton.setAttribute("id", `recordButton${cases.id}`);
    recordButton.className = "recordButton";

    const pauseButton = document.createElement("button");
    pauseButton.innerHTML = "Pause";
    pauseButton.setAttribute("id", `pauseButton${cases.id}`);
    pauseButton.setAttribute("disabled", "true");
    pauseButton.className = "pauseButton";

    const stopButton = document.createElement("button");
    stopButton.innerHTML = "Stop";
    stopButton.setAttribute("id", `stopButton${cases.id}`);
    stopButton.setAttribute("disabled", "true");
    stopButton.className = "stopButton";

    recordButton.addEventListener("click", () => startRecording(cases.id));
    stopButton.addEventListener("click", () => stopRecording(cases.id));
    pauseButton.addEventListener("click", () => pauseRecording(cases.id));
    button.disabled = true;
    controls.append(recordButton, pauseButton, stopButton);
    record.append(controls, recordingList);
  }

  body.append(record);

  // Retrieve the recordings in the database
  cases.recordings.forEach(function (url) {
    var au = document.createElement("audio");
    var li = document.createElement("li");
    au.controls = true;
    au.src = url;
    li.appendChild(au);
    li.appendChild(document.createTextNode(" "));
    recordingList.appendChild(li);
  });
  tdHiddenRow.append(body);
  trHiddenRow.append(tdHiddenRow);

  const trWhole = document.createElement("tbody");
  trWhole.append(tr, trHiddenRow);
  // Activate/Close a case by checking checkbox
  checkbox.onclick = function (event) {
    event.stopPropagation();
    const request = new Request(`/case_util/${cases.id}`, {
      headers: {
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
          .value,
      },
    });
    fetch(request, {
      method: "PUT",
      body: JSON.stringify({
        closed: !cases.closed,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        // Print result
        console.log(result);
        this.parentNode.parentNode.parentNode.parentNode.removeChild(
          this.parentNode.parentNode.parentNode
        );
        cases.closed = !cases.closed;
      });

    fetch("/profile")
      .then((response) => response.json())
      .then((counts) => {
        document.querySelector(
          "#message_count"
        ).innerHTML = `${counts.message_count} Unread Messages`;
        document.querySelector(
          "#case_count"
        ).innerHTML = `${counts.case_count} Cases to handle`;
      });
  };

  // Save changes made to the case that the user edited and stop editing.

  timesClicked = 0;
  button.onclick = function (event) {
    event.stopPropagation();
    timesClicked++;
    if (timesClicked == 1) {
      patientName.firstChild.contentEditable = "true";
      patientSurname.firstChild.contentEditable = "true";
      prediagnosis.firstChild.contentEditable = "true";
      if (!button.disabled) {
        button.innerHTML =
          '<i class="fa fa-paper-plane" aria-hidden="true"></i>';
        button.style.backgroundColor = "green";
      }
    } else {
      const request = new Request(`case_util/${cases.id}`, {
        headers: {
          "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
            .value,
        },
      });
      fetch(request, {
        method: "PUT",
        body: JSON.stringify({
          patient_name: patientName.firstChild.innerHTML,
          patient_surname: patientSurname.firstChild.innerHTML,
          prediagnosis: prediagnosis.firstChild.innerHTML,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          patientName.firstChild.contentEditable = "false";
          patientSurname.firstChild.contentEditable = "false";
          prediagnosis.firstChild.contentEditable = "false";
          if (!button.disabled) {
            button.innerHTML =
              '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
            button.style.backgroundColor = "rgb(255, 109, 109)";
          }
          console.log(result);
          timesClicked = 0;
        });
    }
  };

  // If case is closed if check the checkbox beforehand
  if (cases.closed) {
    document.querySelector("#dataTableClosed").append(trWhole);
    checkbox.checked = true;
  } else {
    document.querySelector("#dataTableActive").append(trWhole);
  }
}

// Compose a new message
function compose_message() {
  compose_message(null);
}

// Compose a new message
function compose_message(message) {
  // Show compose view and hide other views
  document.querySelector("#messages-view").style.display = "none";
  document.querySelector("#message").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#create-room").style.display = "none";
  document.querySelector("#patient-form").style.display = "none";
  document.querySelector("#table").style.display = "none";
  document.querySelector("#table-closed").style.display = "none";
  document.querySelector("#patient-form").style.display = "none";
  document.querySelector("#profile-view").style.display = "none";

  document.querySelector("#title").innerHTML = "Compose Message";
  // Clear out composition fields
  if (message == null) {
    document.querySelector("#compose-recipients").value = "";
    document.querySelector("#compose-subject").value = "";
    document.querySelector("#compose-body").value = "";
  } else {
    document.querySelector("#compose-recipients").value = message.author;
    document.querySelector("#compose-subject").value = "Re: " + message.subject;
    document.querySelector(
      "#compose-body"
    ).value = `\n\n-----------------------------\n\n ${message.date} ${message.author} wrote: \n${message.body}`;
  }
  document.querySelector("#compose-form").onsubmit = () => {
    const request = new Request("/compose", {
      headers: {
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
          .value,
      },
    });
    fetch(request, {
      method: "POST",
      body: JSON.stringify({
        recipients: document.querySelector("#compose-recipients").value,
        subject: document.querySelector("#compose-subject").value,
        body: document.querySelector("#compose-body").value,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        // Print result
        console.log(result);
        document.querySelector("#compose-recipients").value = "";
        document.querySelector("#compose-subject").value = "";
        document.querySelector("#compose-body").value = "";
      });
    return false;
  };
}

// Activates message view
function load_message(message) {
  document.querySelector("#messages-view").style.display = "none";
  document.querySelector("#message").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#create-room").style.display = "none";
  document.querySelector("#patient-form").style.display = "none";
  document.querySelector("#table").style.display = "none";
  document.querySelector("#table-closed").style.display = "none";
  document.querySelector("#profile-view").style.display = "none";

  const container = document.createElement("div");

  const title = document.createElement("h5");
  title.innerHTML = message.subject;
  const sender_date = document.createElement("div");
  sender_date.className = "sender-date";
  sender_date.innerHTML = `Sender: ${message.author} Sent: ${message.date}`;

  const body = document.createElement("p");
  body.innerHTML = message.body;

  container.append(title);
  container.append(sender_date);
  container.append(body);

  reply = document.createElement("button");
  reply.innerHTML = "Reply";
  reply.className = "btn btn-secondary";
  reply.addEventListener("click", function () {
    compose_message(message);
  });
  container.append(reply);

  document.querySelector("#message").innerHTML = "";
  document.querySelector("#message").append(container);
}

// Renders and display all messages
function load_messages() {
  // Show the messagebox and hide other views
  document.querySelector("#messages-view").style.display = "block";
  document.querySelector("#message").style.display = "none";
  document.querySelector("#create-room").style.display = "none";
  document.querySelector("#patient-form").style.display = "none";
  document.querySelector("#table").style.display = "none";
  document.querySelector("#table-closed").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#patient-form").style.display = "none";
  document.querySelector("#profile-view").style.display = "none";

  document.querySelector("#title").innerHTML = "Messages";
  fetch(`/messagebox`)
    .then((response) => response.json())
    .then((messages) => {
      // Print messages
      console.log(messages);
      document.querySelector("#messages-view").innerHTML = "";
      messages.forEach(add_message);
    });
}

// Render message div
function add_message(message) {
  const container = document.createElement("div");
  container.className = `message-box-`;

  const header = document.createElement("div");
  header.className = "message-header";
  header.innerHTML = `<div class="clearfix"> 
         <div id="sender">  ${message.author} </div> 
         <div id="subject"> ${message.subject} </div>
         <div id="date"> ${message.date} </div> 
        </div>`;

  if (message.read) {
    header.style.background = "LightGray";
  }

  header.addEventListener("click", function () {
    const request = new Request(`/message/${message.id}`, {
      headers: {
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
          .value,
      },
    });
    if (!message.read) {
      fetch(request, {
        method: "PUT",
        body: JSON.stringify({
          read: true,
        }),
      });
    }
    load_message(message);
  });
  container.append(header);
  // Add message to DOM
  document.querySelector("#messages-view").append(container);
}
