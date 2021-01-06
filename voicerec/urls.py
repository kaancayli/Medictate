from django.urls import path

from . import views
urlpatterns = [    
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #----API----#
    path("active", views.active_cases, name="active"),
    path("rooms", views.get_rooms, name="rooms"),
    path("room_cases/<int:room_id>", views.get_room_cases, name="room_cases"),
    path("create_room", views.create_room, name="create_room"),
    path("create_case/<int:room_id>", views.create_case, name="create_case"),
    path("send_message", views.compose, name="send_message"),
    path("messagebox", views.messagebox, name="messagebox"),
    path("message/<int:message_id>", views.message, name="message"),
    path("compose", views.compose, name="compose"),
    path("recording_util/<int:case_id>", views.recording_util, name="recording_util"),
    path("case_util/<int:case_id>", views.case_util, name="case_util"),
    path("profile", views.profile, name="profile"),
]