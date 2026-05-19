from rest_framework import viewsets
from .models import OFWRegistration, OWWAOfficerProfile
from .serializers import OFWRegistrationSerializer, OWWAOfficerProfileSerializer

class OFWRegistrationViewSet(viewsets.ModelViewSet):
    queryset = OFWRegistration.objects.all()
    serializer_class = OFWRegistrationSerializer

class OWWAOfficerProfileViewSet(viewsets.ModelViewSet):
    queryset = OWWAOfficerProfile.objects.all()
    serializer_class = OWWAOfficerProfileSerializer