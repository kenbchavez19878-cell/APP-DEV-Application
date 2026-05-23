from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework import viewsets
from .models import OFWRegistration, OWWAOfficerProfile
from .serializers import OFWRegistrationSerializer, OWWAOfficerProfileSerializer, LoginSerializer, UserSerializer


class LoginView(APIView):
    """
    Authenticates a user against Django's built-in User model.
    Accepts POST body: { "username": "admin", "password": "secret" }
    Returns JWT access and refresh tokens on success.
    """
    authentication_classes = ()
    permission_classes = ()

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"detail": "User account is inactive."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return Response({
            "access": str(access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }, status=status.HTTP_200_OK)


class OFWRegistrationViewSet(viewsets.ModelViewSet):
    queryset = OFWRegistration.objects.all()
    serializer_class = OFWRegistrationSerializer


class OWWAOfficerProfileViewSet(viewsets.ModelViewSet):
    queryset = OWWAOfficerProfile.objects.all()
    serializer_class = OWWAOfficerProfileSerializer
