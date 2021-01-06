# Medictate (Final Project for CS50W: Web Programming with Python and JavaScript)

[Course Certificate](https://cs50.harvard.edu/certificates/aab7e662-7767-4776-a774-cd3561c4df8e)

[Course website](https://cs50.harvard.edu/web/2020/)

[Final Project Requirements](https://cs50.harvard.edu/web/2020/projects/final/capstone/)

## Description
Medictate is a dynamic website, which allows you to create voice recording rooms and make voice recordings for dictating medical
reports to be typed in by others. Project is mainly intended for teleradyology applications.

## What inspired me to come up with this project?
My father is a radiologist and diagnoses many cases everyday, which also have to be reported.Reporting is usually done by his secretaries while he dictates, which speeds up the process. However my father travels every 2-3 weeks to visit us, and meanwhile new scans e.g. MRI, CT and x-rays are shot, which naturally have to be reported as quickly as possible. Therefore he uses messaging apps to record his voice and sends them to his secretaries, so that they can type the report. Yet it becomes harder to keep track of the cases that haven't been reported yet. So I wanted to automatize this process.

## Installation

- Install project dependencies by typing `python install -r requirements.txt`
- Make and apply migrations by typing `python manage.py makemigration` and `python manage.py migrate`
- Create superuser with `python manage.py createsuperuser` - This step is optional
- Go to [localhost:8000](localhost:8000) (port number can vary) and register your account

## Project Specificaitons

- **Single Page**
  - Project is constructed entirely as a single page application.
- **Main Page**
  - Shows all active and closed cases, which user has to handle.
  - Informs the user about the number of unread messages and the number of active cases
- **Room**
  - Rooms, which user participates or owns are listed on the side panel
  - Each room shows the cases added to it.
  - Users can create new voice recording rooms.
  - Clicking on the plus sign reveals the create room view.
  - User who created the room becomes the owner of the room.
  - While creating room, owner can chose which users can join the room as participants.
  - Each Room has two tables, one for active and one for closed cases.
- **Case**
  - Cases are shown in a table row.
  - Clicking on a case reveals the recording controls and if any, the voice recordings made for that particular case.
  - Participants (NOT the owner) in a room can add new cases to the room to be reported.
  - Each case includes most importantly patient's name, surname and prediagnosis.
  - Newly created cases are automatically assigned to owner of the room
  - Cases can be activated and deactivated
  - Cases can be edited by participants (NOT by the owner)
- **Voice Recording**
  - This project uses the [recorder.js](https://github.com/mattdiamond/Recorderjs) for voice recording in the frontend. 
  - The owner can make voice recordings seperately for each case.
  - Participants in a room are not allowed to make voice recordings.
  - Owner can only make one voice recording at a time.
  - While recording, users can pause the recording.
  - Stopping the recording saves it and lists it.
- **Messages**
  - Users can send messages to each other.
  - This has the same functionality as the [CS50W 2020 Project 3 - Mail](https://cs50.harvard.edu/web/2020/projects/3/mail/)
- **Styling**
  - I used [Dashboard example](https://getbootstrap.com/docs/4.0/examples/dashboard/) as template and its CSS for this project and tweaked it a bit according to my needs.
  - I followed [this guide](https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/) to integrate [recorder.js](https://github.com/mattdiamond/Recorderjs) into my project.

## Requirements
The final project is your opportunity to design and implement a dynamic website of your own. So long as your final project draws upon this course’s lessons, the nature of your website will be entirely up to you, albeit subject to the staff’s approval.

In this project, you are asked to build a web application of your own. The nature of the application is up to you, subject to a few requirements:

- Your web application must be sufficiently distinct from the other projects in this course (and, in addition, may not be based on the old CS50W Pizza  project), and more complex than those.
- ***My Justification***
  - The main purpose of the application is voice recording. In none of the applications in the course, we implemented a voice recorder.
  - With voice recording one has to deal with file transfer from frontend to the backend, which in turn is more complex than the projects that we implemented so far
  - The behaviour of the frontend i.e. Javascript is more complex than the other projects. 
  - The project is entirely different from the [CS50 Pizza Project](https://docs.cs50.net/web/2020/x/projects/3/project3.html)
  - Only project that my project shares a common feaute is [Project 3 - Mail](https://cs50.harvard.edu/web/2020/projects/3/mail/), which is just a nice extension to my project.
- Your web application must be mobile-responsive.
- In README.md, include a short writeup describing your project, what’s contained in each file you created or modified, and (optionally) any other additional information the staff should know about your project.
- If you’ve added any Python packages that need to be installed in order to run your web application, be sure to add them to requirements.txt!
- Beyond these requirements, the design, look, and feel of the website are up to you!

## Project Structure
```
voicerec - main application directory    
│
└───templates
│   │
│   └───voicerec
│       │   layout.html     - base template, all other templates extend from it (uses Bootstrap 4).
│       │   index.html      - template that shows main content (uses recorder.js).
│       │   login.html      - login page
│       │   register.html   - register page
│
│ admin.py    - all models are registered here for django admin interface
│ views.py    - respectively, contains all application views. 
│ models.py   - contains 5 models (User, Room, Message, Case, Recording) for the application
│ urls.py     - contains all application urls
│
└───static
│   │
│   └───voicerec
│       │   style.css       - styling css
│       │   app.js          - script that utilizes recorder.js
│       │   index.js        - main script that renders the page and defines behaviours
│                             e.g. create case, make recording and create a room etc.
│
dictatenet - project directory
│
media - voice recordings are stored here (it contains 3 example voice recordings)
```
