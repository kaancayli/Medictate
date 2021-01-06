from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields.related import ManyToManyField
from django.http import request

# Create your models here.

## add CKEditor ##

class User(AbstractUser):
    pass


class Room(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    name = models.CharField(max_length=100)
    participants = models.ManyToManyField(User, related_name='participated_rooms')

    def serialize(self, request_user):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "name" : self.name,
            "owner" : self.creator == request_user,
        }

class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.PROTECT, related_name="sent")
    subject = models.TextField(max_length=200, default="No Subject")
    recipients = models.ManyToManyField(User, related_name="recieved")
    body = models.TextField()
    date = models.DateTimeField(auto_now_add=True, blank=False)
    read = models.BooleanField(default=False)
    def serialize(self):
        return {
            "id": self.id,
            "recipients": [user.username for user in self.recipients.all()],
            "author": self.sender.username,
            "subject" : self.subject,
            "date" : self.date,
            "body" : self.body,
            "read" : self.read,
        }
class Case(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created")
    assigned = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assigned")
    patient_name = models.CharField(max_length=100)
    patient_surname = models.CharField(max_length=100)
    prediagnosis = models.CharField(max_length=200)
    message = ManyToManyField(Message, blank=True, related_name="case_message")
    closed = models.BooleanField(default=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='cases')
    timestamp = models.DateTimeField(auto_now_add=True, blank=False)

    def serialize(self, request_user):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "can_record": self.assigned == request_user,
            "patient_name": self.patient_name,
            "patient_surname": self.patient_surname,
            "prediagnosis": self.prediagnosis,
            "recordings" : [r.recording.url for r in self.recordings.all()],
            "closed" : self.closed,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p")
        }
class Recording(models.Model):
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, related_name="recordings")
    recorded_for = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, related_name="to_report")
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="recordings")
    recording = models.FileField(upload_to = f'uploads/%Y/%m/%d/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True, blank=False)
    def serialize(self):
        return {
            "id": self.id,
            "recorded_for": self.recorded_for.username,
            "recorded_by": self.recorded_by.username,
            "recording_path" : self.recording.path,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
        }