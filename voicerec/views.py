from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.core.paginator import EmptyPage, Paginator
import json
from django.conf import settings
from django.db.models import Q
from .models import Message, User, Case, Room, Recording

# Create your views here.

@login_required(login_url='login')
def index(request):
    return render(request, "voicerec/index.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "voicerec/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "voicerec/login.html")

@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

@login_required
def profile(request): 
    if request.method != 'GET':
        return JsonResponse({'error' : 'request should be via GET'}, status=400)

    message_count = Message.objects.all().filter(recipients=request.user, read=False).count()
    case_count = Case.objects.all().filter(Q(assigned=request.user, closed=False) | Q(creator=request.user, closed=True)).count()

    return JsonResponse({'message_count': message_count, 'case_count': case_count}, status=201)

@login_required
def active_cases(request):
    '''
    Returns active cases
    '''
    Cases = Case.objects.all().filter(Q(assigned=request.user, closed=False) | Q(creator=request.user, closed=True)).order_by("-timestamp")
    return JsonResponse([case.serialize(request.user) for case in Cases],safe=False, status=201)

@login_required
def get_rooms(request):
    '''
    Returns active cases
    '''
    Rooms = Room.objects.all().filter(creator=request.user) | request.user.participated_rooms.all()
    return JsonResponse([room.serialize(request.user) for room in Rooms],safe=False, status=201)

@login_required
def get_room_cases(request, room_id):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return JsonResponse({"error": f"Room with id {room_id} is not found."}, status=404)
    
    cases = room.cases.all().filter(Q(assigned=request.user) | Q(creator=request.user)).order_by("-timestamp")
    return JsonResponse([case.serialize(request.user) for case in cases],safe=False, status=201)

@login_required
def create_case(request, room_id) :
    '''
    Creates a case
    '''
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        surname = data.get("surname")
        prediagnosis = data.get("prediagnosis")
        room = Room.objects.all().get(id=room_id)

        case = Case(creator = request.user, assigned=room.creator, patient_name=name, patient_surname=surname, prediagnosis=prediagnosis, room=room)
        case.save()
        return JsonResponse({"message": "Case created successfully."}, status=200)
    else:
        JsonResponse({"error": "POST request required."}, status=400)

@login_required
def case_util(request, case_id):
    '''
    Creates case and assignes as task
    '''
    try:
        case = Case.objects.get(id=case_id)
    except Case.DoesNotExist:
        return JsonResponse({"error": f"Case with id {case_id} is not found."}, status=404)
    if request.method == 'GET':
        return JsonResponse(case.serialize(request.user), safe=False)
    if request.method == 'PUT':
        data = json.loads(request.body)
        if data.get("closed") is not None:
            case.closed = data["closed"]
            
        if data.get("prediagnosis") is not None:
            if case.creator != request.user:
                return JsonResponse({"error": "You can't edit this field."}, status=400)
            case.prediagnosis = data["prediagnosis"]
        
        if data.get("patient_name") is not None:
            if case.creator != request.user:
                return JsonResponse({"error": "You can't edit this field."}, status=400)
            case.patient_name = data["patient_name"]

        if data.get("patient_surname") is not None:
            if case.creator != request.user:
                return JsonResponse({"error": "You can't edit this field."}, status=400)
            case.patient_surname = data["patient_surname"]
        
        case.save()    
        return JsonResponse(case.serialize(request.user), safe=False)
    if request.method == 'DELETE':
        case.delete()
    else:       
        return JsonResponse({"error": "PUT or GET request required."}, status=400)

@login_required
def recording_util(request, case_id):
    '''
    Saves the recording
    '''
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    try:
        case = Case.objects.get(id=case_id)
    except Case.DoesNotExist:
        return JsonResponse({"error": f"Case with id {case_id} is not found."}, status=404)
    
    if request.user != case.room.creator:
        return JsonResponse({"error": f"You can not make a recording in this room"}, status=400)

    data = request.FILES.get("audio")
    if data is not None:           
        record_model = Recording(recorded_by=request.user, recorded_for=case.room.creator, case=case)
        record_model.recording.save(f'{case.patient_name}_{case.patient_surname}_{case.prediagnosis}.wav', data)
        record_model.save()
        
    return JsonResponse({
            'success': True,
    })

@login_required
def create_room(request):
    '''
    Creates a recording room
    '''
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("room_name")
        participants = data.get("participants").split(",")
        room = Room(creator=request.user, name=name)
        room.save()
        for p in participants : 
            try:
                user = User.objects.get(username = p)
                room.participants.add(user)
            except User.DoesNotExist:
                return JsonResponse({"error": f"User {p} not found."}, status=404)
        room.save()
        return JsonResponse({"message": f"Room {name} created successfully."}, status=200)
    else:
        JsonResponse({"error": "POST request required."}, status=400)

@login_required
def delete_room(request, room_id):
    '''
    Removes a user from a recording room
    '''
    if request.method == "PUT":
        try:
            room = Room.objects.get(room_id)
        except Room.DoesNotExist:
                return JsonResponse({"error": f"Room with {room_id} is not found."}, status=404)
        
        room.delete()
    else:
         JsonResponse({"error": "PUT request required."}, status=400)

@login_required
def add_user(request, room_id, username):
    '''
    Adds user to a recording room
    '''
    if request.method == "PUT":
        room = Room.objects.get(room_id)
        try:
            user = User.objects.get(user=username)
            room.participants.add(user)
        except User.DoesNotExist:
            return JsonResponse({"error": f"User {username} not found."}, status=404)
    else:
         JsonResponse({"error": "PUT request required."}, status=400)

@login_required
def remove_user(request, room_id, username):
    '''
    Removes a user from a recording room
    '''
    if request.method == "DELETE":
        try:
            room = Room.objects.get(room_id)
        except Room.DoesNotExist:
            return JsonResponse({"error": f"Room with {room_id} is not found."}, status=404)
        
        try:
            user = User.objects.get(user=username)
            if room.participants.all().filter(username=request.user.username).exists():
                room.participants.remove(user)
            else:
                return JsonResponse({"error": f"User {username} is not in the specified room."}, status=400)
        except User.DoesNotExist:
                return JsonResponse({"error": f"User {username} not found."}, status=404)
    else:
         JsonResponse({"error": "DELETE request required."}, status=400)

@login_required
def compose(request):

    # Composing a new message must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    users = [user.strip() for user in data.get("recipients").split(",")]
    if users == [""]:
        return JsonResponse({
            "error": "At least one recipient required."
        }, status=400)

    # Get contents of message
    body = data.get("body", "")
    subject = data.get("subject", "")
    recipients = []
    for usr in users:
        try:
            user = User.objects.get(username=usr)
            recipients.append(user)
        except User.DoesNotExist:
            return JsonResponse({
                "error": f"User {usr} does not exist."
            }, status=400)
    
    users = set()
    users.add(request.user)
    users.update(recipients)
    for user in users:
        message = Message(
            user=user,
            subject = subject,
            sender=request.user,
            body=body,
            read=user == request.user
        )
        message.save()
        for recipient in recipients:
            message.recipients.add(recipient)
        message.save()

    return JsonResponse({"message": "Message sent successfully."}, status=201)

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "voicerec/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "voicerec/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "voicerec/register.html")

@login_required
def messagebox(request):
    #Get user messages
    Messages = request.user.messages

    # Return emails in reverse chronologial order
    messages = Messages.order_by("-date").all()
    return JsonResponse([message.serialize() for message in messages], safe=False)

def message(request, message_id):
    try:
        #Get user message
        message = Message.objects.all().get(id=message_id)
    except Message.DoesNotExist:
        return JsonResponse({"error": "Message not found."}, status=404)

    # Return email contents
    if request.method == "GET":
        return JsonResponse(message.serialize())

    # Update whether email is read or should be archived
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("read") is not None:
            message.read = data["read"]
        message.save()
        return HttpResponse(status=204)

    # Message must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)