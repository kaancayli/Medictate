from django.contrib import admin
from .models import User, Message, Room, Recording, Case

# Register your models here.
admin.site.register(User)
admin.site.register(Message)
admin.site.register(Case)
admin.site.register(Recording)
admin.site.register(Room)