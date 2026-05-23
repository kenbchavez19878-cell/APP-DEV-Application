from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import OFWRegistration, OWWAOfficerProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_active')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

class OFWRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OFWRegistration
        fields = '__all__'

class OWWAOfficerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OWWAOfficerProfile
        fields = '__all__'
