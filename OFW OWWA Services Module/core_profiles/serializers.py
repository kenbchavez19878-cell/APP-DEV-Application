from rest_framework import serializers
from .models import OFWRegistration, OWWAOfficerProfile

class OFWRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OFWRegistration
        fields = '__all__'

class OWWAOfficerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OWWAOfficerProfile
        fields = '__all__'